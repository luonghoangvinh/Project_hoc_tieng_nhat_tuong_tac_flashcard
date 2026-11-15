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
export class CommunityService implements OnModuleInit {
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

    async onModuleInit() {
        try {
            await this.seedInitialCommunityDecks();
        } catch (error) {
            this.logger.warn(`Failed to seed community decks: ${error}`);
        }
    }

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

    private async seedInitialCommunityDecks() {
        const publicCount = await this.deckModel.countDocuments({ isPublic: true });
        if (publicCount > 0) {
            return;
        }

        this.logger.log('Seeding initial community flashcard decks...');

        let defaultUser = await this.userModel.findOne();
        if (!defaultUser) {
            defaultUser = await this.userModel.create({
                userName: 'Nguyễn Minh Tú',
                gmail: 'author@rakunjlpt.com',
                password: 'default_password_hashed',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tu',
            });
        }

        const defaultUserId = defaultUser._id;

        const specs = [
            {
                name: 'N5 Từ vựng thiết yếu 1000 từ',
                description: 'Bộ 1000 từ vựng N5 được chọn lọc kỹ lưỡng, có ví dụ thực tế',
                level: 'N5',
                topic: 'vocabulary',
                rating: 4.8,
                ratingCount: 234,
                downloadCount: 1892,
                saveCount: 445,
                tags: ['n5', 'từ-vựng', 'cơ-bản'],
                cards: [
                    { front: '水', back: 'みず (mizu) - Nước', example: '水を飲みます。', type: 'vocabulary', level: 'N5' },
                    { front: '食べる', back: 'たべる (taberu) - Ăn', example: '朝ごはんを食べます。', type: 'vocabulary', level: 'N5' },
                    { front: '見る', back: 'みる (miru) - Nhìn / Xem', example: 'テレビを見ます。', type: 'vocabulary', level: 'N5' },
                    { front: '大きい', back: 'おおきい (ookii) - To, Lớn', example: '大きい犬がいます。', type: 'vocabulary', level: 'N5' },
                    { front: '小さい', back: 'ちいさい (chiisai) - Nhỏ, Bé', example: '小さい猫です。', type: 'vocabulary', level: 'N5' },
                ],
            },
            {
                name: 'N4 Ngữ pháp tổng hợp',
                description: 'Tổng hợp 80 cấu trúc ngữ pháp N4 thường xuất hiện trong đề thi',
                level: 'N4',
                topic: 'grammar',
                rating: 4.9,
                ratingCount: 189,
                downloadCount: 2341,
                saveCount: 678,
                tags: ['n4', 'ngữ-pháp', 'đề-thi'],
                cards: [
                    { front: '〜てしまう', back: 'Diễn tả hành động đã hoàn thành (tiếc nuối)', example: '財布を忘れてしまった。', type: 'grammar', level: 'N4' },
                    { front: '〜ために', back: 'Vì..., Để..., Mục đích', example: '日本語を勉強するために、毎日練習します。', type: 'grammar', level: 'N4' },
                    { front: '〜ておく', back: 'Làm trước để chuẩn bị', example: '旅行の前に、ホテルを予約しておきます。', type: 'grammar', level: 'N4' },
                ],
            },
            {
                name: 'N3 Kanji thường gặp 500 chữ',
                description: 'Bộ 500 Kanji quan trọng cho N3, kèm âm đọc và ví dụ',
                level: 'N3',
                topic: 'kanji',
                rating: 4.7,
                ratingCount: 312,
                downloadCount: 3120,
                saveCount: 890,
                tags: ['n3', 'kanji', 'chữ-hán'],
                cards: [
                    { front: '経済', back: 'けいざい (keizai) - Kinh tế', example: '日本の経済は発展しています。', type: 'vocabulary', level: 'N3' },
                    { front: '政治', back: 'せいじ (seiji) - Chính trị', example: '政治に興味があります。', type: 'vocabulary', level: 'N3' },
                    { front: '科学', back: 'かがく (kagaku) - Khoa học', example: '科学の進歩が速い。', type: 'vocabulary', level: 'N3' },
                ],
            },
            {
                name: 'N2 Từ vựng nâng cao Business',
                description: 'Từ vựng công việc và kinh doanh cho N2, phù hợp làm việc tại Nhật',
                level: 'N2',
                topic: 'vocabulary',
                rating: 4.6,
                ratingCount: 98,
                downloadCount: 987,
                saveCount: 234,
                tags: ['n2', 'business', 'công-việc'],
                cards: [
                    { front: '交渉', back: 'こうしょう (koushou) - Đàm phán, Thương lượng', example: '取引先と交渉しました。', type: 'vocabulary', level: 'N2' },
                    { front: '提案', back: 'ていあん (teian) - Đề xuất, Đề nghị', example: '新しい提案を出しました。', type: 'vocabulary', level: 'N2' },
                ],
            },
            {
                name: 'N1 Thành ngữ và Tục ngữ',
                description: 'Tuyển tập thành ngữ, tục ngữ Nhật Bản cho N1 với giải thích chi tiết',
                level: 'N1',
                topic: 'vocabulary',
                rating: 4.5,
                ratingCount: 67,
                downloadCount: 542,
                saveCount: 123,
                tags: ['n1', 'thành-ngữ', 'tục-ngữ'],
                cards: [
                    { front: '七転び八起き', back: 'ななころびやおき - Thất bại 7 lần, đứng dậy 8 lần', example: '七転び八起きの精神で頑張れ。', type: 'vocabulary', level: 'N1' },
                    { front: '一石二鳥', back: 'いっせきにちょう - Nhất cử lưỡng tiện', example: 'それは一石二鳥のアイデアだ。', type: 'vocabulary', level: 'N1' },
                ],
            },
            {
                name: 'N5 Hội thoại cơ bản hàng ngày',
                description: 'Các mẫu câu hội thoại hàng ngày cho người mới bắt đầu học tiếng Nhật',
                level: 'N5',
                topic: 'conversation',
                rating: 4.9,
                ratingCount: 456,
                downloadCount: 5678,
                saveCount: 1234,
                tags: ['n5', 'hội-thoại', 'mới-bắt-đầu'],
                cards: [
                    { front: 'はじめまして', back: 'Xin chào (lần đầu gặp)', example: 'はじめまして、田中です。よろしくお願いします。', type: 'vocabulary', level: 'N5' },
                    { front: 'ありがとうございます', back: 'Cảm ơn bạn (lịch sự)', example: 'ありがとうございます！助かりました。', type: 'vocabulary', level: 'N5' },
                    { front: 'すみません', back: 'Xin lỗi / Xin phép', example: 'すみません、駅はどこですか？', type: 'vocabulary', level: 'N5' },
                ],
            },
            {
                name: 'N4 Kanji Jouyou cơ bản',
                description: 'Kanji thường dùng trong cuộc sống N4, học theo chủ đề',
                level: 'N4',
                topic: 'kanji',
                rating: 4.4,
                ratingCount: 143,
                downloadCount: 1456,
                saveCount: 345,
                tags: ['n4', 'kanji', 'jouyou'],
                cards: [
                    { front: '病院', back: 'びょういん (byouin) - Bệnh viện', example: '病院に行きました。', type: 'vocabulary', level: 'N4' },
                    { front: '駅', back: 'えき (eki) - Ga tàu', example: '駅まで歩きます。', type: 'vocabulary', level: 'N4' },
                ],
            },
            {
                name: 'N3 Ngữ pháp điểm cao',
                description: 'Các điểm ngữ pháp N3 thường ra trong thi, có bài tập luyện',
                level: 'N3',
                topic: 'grammar',
                rating: 4.8,
                ratingCount: 201,
                downloadCount: 2100,
                saveCount: 567,
                tags: ['n3', 'ngữ-pháp', 'thi-cử'],
                cards: [
                    { front: '〜にとって', back: 'Đối với..., Từ góc nhìn của...', example: '私にとって日本語は難しいです。', type: 'grammar', level: 'N3' },
                    { front: '〜ことになっている', back: 'Đã được quy định rằng...', example: '明日会議があることになっています。', type: 'grammar', level: 'N3' },
                ],
            },
        ];

        const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#6366F1', '#14B8A6'];
        const icons = ['📚', '📖', '📝', '✏️', '📕', '📗', '📘', '📙'];

        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            const created = await this.deckModel.create({
                userId: defaultUserId,
                name: spec.name,
                description: spec.description,
                cards: spec.cards,
                color: colors[i % colors.length],
                icon: icons[i % icons.length],
                visibility: 'community',
                isPublic: true,
                jlptLevel: spec.level,
                topic: spec.topic,
                tags: spec.tags,
                downloadCount: spec.downloadCount,
                saveCount: spec.saveCount,
                rating: spec.rating,
                ratingCount: spec.ratingCount,
                viewCount: spec.downloadCount * 2 + spec.saveCount * 3,
                publishedAt: new Date(Date.now() - (i + 1) * 86400000 * 3),
                createdAt: new Date(Date.now() - (i + 1) * 86400000 * 5),
            });

            await this.deckRatingModel.create([
                {
                    deckId: created._id,
                    userId: defaultUserId,
                    userName: 'Minh Khang',
                    rating: 5,
                    comment: 'Bộ thẻ rất hữu ích! Tôi học được nhiều từ mới.',
                    createdAt: new Date(Date.now() - 86400000 * 2),
                },
                {
                    deckId: created._id,
                    userId: defaultUserId,
                    userName: 'Thu Hương',
                    rating: 5,
                    comment: 'Ví dụ rõ ràng, dễ nhớ. Cảm ơn tác giả nhiều lắm!',
                    createdAt: new Date(Date.now() - 86400000 * 4),
                },
                {
                    deckId: created._id,
                    userId: defaultUserId,
                    userName: 'Quốc Bảo',
                    rating: 4,
                    comment: 'Nội dung rất tốt, giúp ôn thi hiệu quả.',
                    createdAt: new Date(Date.now() - 86400000 * 6),
                },
            ]);
        }

        this.logger.log(`Successfully seeded ${specs.length} community decks!`);
    }
}
