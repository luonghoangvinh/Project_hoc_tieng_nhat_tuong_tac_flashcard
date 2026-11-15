import {
    Injectable,
    NotFoundException,
    BadRequestException,
    OnModuleInit,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deck } from '../deck/deck.entity';
import { User, UserDocument } from '../user/user.entity';
import { DeckRating, DeckRatingDocument } from './deck-rating.entity';
import { SavedDeck, SavedDeckDocument } from './saved-deck.entity';
import { PublishDeckDto } from './dto/publish-deck.dto';
import { SubmitRatingDto } from './dto/submit-rating.dto';
import { QueryCommunityDecksDto } from './dto/query-community-decks.dto';

@Injectable()
export class CommunityService {
    private readonly logger = new Logger(CommunityService.name);

    constructor(
        @InjectModel(Deck.name)
        private readonly deckModel: Model<Deck>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(DeckRating.name)
        private readonly deckRatingModel: Model<DeckRatingDocument>,
        @InjectModel(SavedDeck.name)
        private readonly savedDeckModel: Model<SavedDeckDocument>,
    ) { }


    private formatDeck(deck: any) {
        const doc = deck.toObject ? deck.toObject() : deck;
        const user = doc.userId;
        const authorId = user?._id
            ? user._id.toString()
            : (doc.userId ? doc.userId.toString() : 'system');
        const authorName = user?.userName || doc.authorName || 'Rakun JLPT';
        const authorAvatar = user?.avatar || doc.authorAvatar || undefined;

        return {
            ...doc,
            _id: doc._id.toString(),
            authorId,
            authorName,
            authorAvatar,
            cards: doc.cards?.map((c: any) => ({
                ...c,
                _id: c._id ? c._id.toString() : undefined,
                id: c._id ? c._id.toString() : (c.id || undefined),
            })) || [],
        };
    }

    async findAll(query: QueryCommunityDecksDto) {
        const page = Math.max(1, parseInt(query.page || '1', 10));
        const perPage = Math.max(1, parseInt(query.perPage || '12', 10));
        const skip = (page - 1) * perPage;

        const filter: any = {
            isPublic: true,
            isDeleted: { $ne: true },
        };

        if (query.level && query.level !== 'all') {
            filter.jlptLevel = query.level;
        }

        if (query.topic && query.topic !== 'all') {
            filter.topic = query.topic;
        }

        if (query.search && query.search.trim()) {
            const regex = new RegExp(query.search.trim(), 'i');
            filter.$or = [
                { name: regex },
                { description: regex },
                { tags: regex },
            ];
        }

        let sortOption: any = { downloadCount: -1, saveCount: -1, _id: -1 };
        if (query.sort === 'newest') {
            sortOption = { publishedAt: -1, createdAt: -1 };
        } else if (query.sort === 'top-rated') {
            sortOption = { rating: -1, ratingCount: -1 };
        } else if (query.sort === 'most-downloaded') {
            sortOption = { downloadCount: -1, rating: -1 };
        } else if (query.sort === 'popular') {
            sortOption = { downloadCount: -1, saveCount: -1 };
        }

        const [items, total] = await Promise.all([
            this.deckModel
                .find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(perPage)
                .populate('userId', 'userName avatar')
                .exec(),
            this.deckModel.countDocuments(filter),
        ]);

        return {
            items: items.map(d => this.formatDeck(d)),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage) || 1,
        };
    }

    async getFeatured() {
        const filter = { isPublic: true, isDeleted: { $ne: true } };

        const [newest, topRated, mostDownloaded] = await Promise.all([
            this.deckModel
                .find(filter)
                .sort({ publishedAt: -1, createdAt: -1 })
                .limit(4)
                .populate('userId', 'userName avatar')
                .exec(),
            this.deckModel
                .find(filter)
                .sort({ rating: -1, ratingCount: -1 })
                .limit(4)
                .populate('userId', 'userName avatar')
                .exec(),
            this.deckModel
                .find(filter)
                .sort({ downloadCount: -1, rating: -1 })
                .limit(4)
                .populate('userId', 'userName avatar')
                .exec(),
        ]);

        return {
            newest: newest.map(d => this.formatDeck(d)),
            topRated: topRated.map(d => this.formatDeck(d)),
            mostDownloaded: mostDownloaded.map(d => this.formatDeck(d)),
        };
    }

    async findById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID bộ thẻ không hợp lệ');
        }

        const deck = await this.deckModel
            .findByIdAndUpdate(
                id,
                { $inc: { viewCount: 1 } },
                { returnDocument: 'after' },
            )
            .populate('userId', 'userName avatar')
            .exec();

        if (!deck || deck.isDeleted) {
            throw new NotFoundException('Không tìm thấy bộ thẻ');
        }

        return this.formatDeck(deck);
    }

    async findRelated(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            return [];
        }

        const currentDeck = await this.deckModel.findById(id).exec();
        if (!currentDeck) {
            return [];
        }

        const related = await this.deckModel
            .find({
                _id: { $ne: new Types.ObjectId(id) },
                isPublic: true,
                isDeleted: { $ne: true },
                $or: [
                    { topic: currentDeck.topic },
                    { jlptLevel: currentDeck.jlptLevel },
                ],
            })
            .limit(4)
            .populate('userId', 'userName avatar')
            .exec();

        return related.map(d => this.formatDeck(d));
    }

    async publishDeck(userId: string, dto: PublishDeckDto) {
        if (!Types.ObjectId.isValid(dto.deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const deck = await this.deckModel.findOne({
            _id: new Types.ObjectId(dto.deckId),
            userId: new Types.ObjectId(userId),
        });

        if (!deck) {
            throw new NotFoundException('Không tìm thấy bộ thẻ hoặc bạn không có quyền sở hữu');
        }

        if (!deck.cards || deck.cards.length === 0) {
            throw new BadRequestException('Bộ thẻ phải có ít nhất 1 thẻ flashcard để xuất bản');
        }

        deck.name = dto.title.trim();
        if (dto.description !== undefined) {
            deck.description = dto.description.trim();
        }
        deck.jlptLevel = dto.jlptLevel;
        deck.topic = dto.topic;
        deck.tags = dto.tags && dto.tags.length > 0 ? dto.tags.map(t => t.trim().toLowerCase()) : [];
        deck.visibility = 'community';
        deck.isPublic = true;
        deck.publishedAt = new Date();

        await deck.save();
        const populated = await deck.populate('userId', 'userName avatar');
        return this.formatDeck(populated);
    }

    async unpublishDeck(userId: string, deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const deck = await this.deckModel.findOne({
            _id: new Types.ObjectId(deckId),
            userId: new Types.ObjectId(userId),
        });

        if (!deck) {
            throw new NotFoundException('Không tìm thấy bộ thẻ hoặc bạn không có quyền sở hữu');
        }

        deck.isPublic = false;
        deck.visibility = 'personal';
        await deck.save();

        return {
            success: true,
            message: 'Đã gỡ bộ thẻ khỏi cộng đồng thành công',
            deckId,
        };
    }

    async downloadDeck(userId: string, deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const deck = await this.deckModel
            .findById(deckId)
            .populate('userId', 'userName')
            .exec();

        if (!deck || deck.isDeleted) {
            throw new NotFoundException('Không tìm thấy bộ thẻ cộng đồng');
        }

        const authorName = (deck.userId as any)?.userName || 'Cộng đồng';

        const clonedCards = (deck.cards || []).map(card => {
            const cObj = (card as any).toObject ? (card as any).toObject() : card;
            const { _id, ...cleanCard } = cObj;
            return cleanCard;
        });

        const newDeck = await this.deckModel.create({
            userId: new Types.ObjectId(userId),
            name: `${deck.name} (Tải về)`,
            description: `${deck.description || ''}\n(Tải về từ cộng đồng - Tác giả: ${authorName})`,
            color: deck.color || '#3B82F6',
            icon: deck.icon || '📚',
            visibility: 'personal',
            isPublic: false,
            cards: clonedCards,
            createdAt: new Date(),
        });

        await this.deckModel.findByIdAndUpdate(deckId, {
            $inc: { downloadCount: 1 },
        });

        return newDeck;
    }

    async saveDeck(userId: string, deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const existing = await this.savedDeckModel.findOne({
            userId: new Types.ObjectId(userId),
            deckId: new Types.ObjectId(deckId),
        });

        if (!existing) {
            await this.savedDeckModel.create({
                userId: new Types.ObjectId(userId),
                deckId: new Types.ObjectId(deckId),
            });
            await this.deckModel.findByIdAndUpdate(deckId, {
                $inc: { saveCount: 1 },
            });
        }

        return { isSaved: true };
    }

    async unsaveDeck(userId: string, deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const deleted = await this.savedDeckModel.findOneAndDelete({
            userId: new Types.ObjectId(userId),
            deckId: new Types.ObjectId(deckId),
        });

        if (deleted) {
            await this.deckModel.findByIdAndUpdate(deckId, {
                $inc: { saveCount: -1 },
            });
        }

        return { isSaved: false };
    }

    async getSavedDecks(userId: string) {
        const savedList = await this.savedDeckModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();

        const deckIds = savedList.map(s => s.deckId);
        const decks = await this.deckModel
            .find({
                _id: { $in: deckIds },
                isDeleted: { $ne: true },
            })
            .populate('userId', 'userName avatar')
            .exec();

        return decks.map(d => this.formatDeck(d));
    }

    async getSavedDeckIds(userId: string) {
        const savedList = await this.savedDeckModel
            .find({ userId: new Types.ObjectId(userId) })
            .select('deckId')
            .exec();

        return {
            savedIds: savedList.map(s => s.deckId.toString()),
        };
    }

    // --- RATINGS MODULE ---
    async getRatings(deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            return [];
        }

        const ratings = await this.deckRatingModel
            .find({ deckId: new Types.ObjectId(deckId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        return ratings.map(r => ({
            ...r,
            id: r._id.toString(),
            _id: r._id.toString(),
            deckId: r.deckId.toString(),
            userId: r.userId.toString(),
        }));
    }

    async submitRating(userId: string, deckId: string, dto: SubmitRatingDto) {
        if (!Types.ObjectId.isValid(deckId)) {
            throw new BadRequestException('ID bộ thẻ không hợp lệ');
        }

        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        const rating = await this.deckRatingModel.findOneAndUpdate(
            {
                deckId: new Types.ObjectId(deckId),
                userId: new Types.ObjectId(userId),
            },
            {
                deckId: new Types.ObjectId(deckId),
                userId: new Types.ObjectId(userId),
                userName: user.userName,
                userAvatar: user.avatar || '',
                rating: dto.rating,
                comment: dto.comment ? dto.comment.trim() : '',
                updatedAt: new Date(),
            },
            { upsert: true, new: true },
        );

        // Recalculate average rating for this deck
        const allRatings = await this.deckRatingModel.find({
            deckId: new Types.ObjectId(deckId),
        });

        const ratingCount = allRatings.length;
        const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        const roundedAvg = Math.round(avgRating * 10) / 10;

        await this.deckModel.findByIdAndUpdate(deckId, {
            rating: roundedAvg,
            ratingCount,
        });

        return {
            id: rating._id.toString(),
            _id: rating._id.toString(),
            deckId: rating.deckId.toString(),
            userId: rating.userId.toString(),
            userName: rating.userName,
            userAvatar: rating.userAvatar,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            averageRating: roundedAvg,
            ratingCount,
        };
    }

    async getUserRating(userId: string, deckId: string) {
        if (!Types.ObjectId.isValid(deckId)) {
            return null;
        }

        const rating = await this.deckRatingModel.findOne({
            deckId: new Types.ObjectId(deckId),
            userId: new Types.ObjectId(userId),
        });

        if (!rating) {
            return null;
        }

        return {
            id: rating._id.toString(),
            _id: rating._id.toString(),
            deckId: rating.deckId.toString(),
            userId: rating.userId.toString(),
            userName: rating.userName,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
        };
    }


}
