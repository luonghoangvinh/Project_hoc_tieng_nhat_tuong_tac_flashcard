import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Flashcard, FlashcardSchema } from "../flashcard/flashcard.entity";
import { Types } from "mongoose";

@Schema()
export class Deck {

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    userId!: Types.ObjectId;
    @Prop()
    name!: string;

    @Prop()
    description?: string;


    @Prop({
        type: [FlashcardSchema],
        default: [],
    })
    cards?: Flashcard[];

    @Prop({ default: Date.now })
    createdAt!: Date;

    @Prop()
    color!: string;

    @Prop()
    icon!: string;

    @Prop({
        enum: ['personal', 'community'],
        default: 'personal',
    })
    visibility!: string;

    @Prop({ default: 0 })
    viewCount?: number;

    @Prop({ default: false })
    isPublic?: boolean;

    @Prop({
        enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
        required: false,
    })
    jlptLevel?: string;

    @Prop({
        enum: ['vocabulary', 'grammar', 'kanji', 'conversation', 'other'],
        default: 'vocabulary',
    })
    topic?: string;

    @Prop({
        type: [String],
        default: [],
    })
    tags?: string[];

    @Prop({ default: 0 })
    downloadCount?: number;

    @Prop({ default: 0 })
    saveCount?: number;

    @Prop({ default: 0 })
    rating?: number;

    @Prop({ default: 0 })
    ratingCount?: number;

    @Prop({ default: null })
    publishedAt?: Date;

    @Prop({ default: false })
    isDeleted?: boolean;
}
export const DeckSchema =
    SchemaFactory.createForClass(Deck);
DeckSchema.index({ userId: 1 });
DeckSchema.index({ isPublic: 1, jlptLevel: 1, topic: 1 });
DeckSchema.index({ isPublic: 1, rating: -1, downloadCount: -1 });
