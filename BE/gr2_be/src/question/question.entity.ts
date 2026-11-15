import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { JLPTLevel, QuestionType } from "../exercise/exercise.entity";

@Schema()
export class Question {
    @Prop({
            type: String,
            enum: QuestionType,
            required: true,
        })
    type!: string;

    @Prop({
            type: String,
            enum: JLPTLevel,
            required: true,
        })
    level!: string;

    @Prop()
    audioURL?: string;

    @Prop()
    imageURL?: string;

    @Prop()
    readingContent?: string;

    @Prop({ required: true })
    question!: string;

    @Prop([String])
    options!: string[];

    @Prop()
    correctAnswer!: number;

    @Prop()
    explanation?: string;
}
export const QuestionSchema =
    SchemaFactory.createForClass(Question);