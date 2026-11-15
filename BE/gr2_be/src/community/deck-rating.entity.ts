import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeckRatingDocument = HydratedDocument<DeckRating>;

@Schema({ timestamps: true })
export class DeckRating {
    _id!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Deck', required: true, index: true })
    deckId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true })
    userName!: string;

    @Prop({ default: '' })
    userAvatar?: string;

    @Prop({ required: true, min: 1, max: 5 })
    rating!: number;

    @Prop({ default: '' })
    comment?: string;

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop({ default: Date.now })
    updatedAt!: Date;
}

export const DeckRatingSchema = SchemaFactory.createForClass(DeckRating);
DeckRatingSchema.index({ deckId: 1, userId: 1 }, { unique: true });
DeckRatingSchema.index({ deckId: 1, createdAt: -1 });
