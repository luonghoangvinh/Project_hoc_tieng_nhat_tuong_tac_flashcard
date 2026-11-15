import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { JLPTLevel } from "../exercise/exercise.entity";
import { Types } from "mongoose";

@Schema()
export class Flashcard {
    _id!:Types.ObjectId;
    @Prop()
    front!: string;

    @Prop()
    back!: string;

    @Prop({
        enum: ['vocabulary', 'grammar'],
    })
    type?: string;

    @Prop({
        enum: JLPTLevel,
    })
    level?: string;

    @Prop()
    example?: string;

    @Prop()
    image?: string;

    @Prop()
    audio?: string;

    @Prop()
    status?: string;
}
export const FlashcardSchema =
    SchemaFactory.createForClass(Flashcard);