import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Deck } from './deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DeckService {
    constructor(
        @InjectModel(Deck.name)
        private readonly deckModel: Model<Deck>,
    ) { }

    async create(dto: CreateDeckDto) {
        return this.deckModel.create({
            ...dto,
            userId: new Types.ObjectId(dto.userId),
        });
    }

    async duplicate(id: string) {
        const deck = await this.deckModel.findById(id);
        const obj = deck?.toObject();
        if (obj) {
            const { _id, ...deckData } = obj;
            const newDeck = {
                ...deckData,
                name: `${deckData.name} (copy)`,
                createdAt: Date.now(),
                cards: deckData.cards?.map(card => {
                    const { _id, ...cardData } = card;
                    return cardData;
                }
                )
            }
            return this.deckModel.create(newDeck);
        }
        return false;
    }

    async findAll() {
        return this.deckModel.find().exec();
    }

    async findById(id: string) {
        const deck = await this.deckModel.findById(id);

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        return deck;
    }


    async findByUserId(userId: string) {
        const decks = await this.deckModel.find({
            userId: new Types.ObjectId(userId),
        });

        return decks;
    }

    async update(
        id: string,
        dto: UpdateDeckDto,
    ) {
        const deck =
            await this.deckModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                dto,
                {
                    returnDocument: 'after',
                },
            );

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        return deck;
    }

    async delete(id: string) {
        const deck =
            await this.deckModel.findByIdAndDelete({ _id: new Types.ObjectId(id) });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        return deck;
    }
}