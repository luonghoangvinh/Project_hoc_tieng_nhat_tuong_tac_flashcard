import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SavedDeckDocument = HydratedDocument<SavedDeck>;

@Schema({ timestamps: true })
export class SavedDeck {
    _id!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Deck', required: true, index: true })
    deckId!: Types.ObjectId;

    @Prop({ default: Date.now })
    createdAt!: Date;
}

export const SavedDeckSchema = SchemaFactory.createForClass(SavedDeck);
SavedDeckSchema.index({ userId: 1, deckId: 1 }, { unique: true });
SavedDeckSchema.index({ userId: 1, createdAt: -1 });
