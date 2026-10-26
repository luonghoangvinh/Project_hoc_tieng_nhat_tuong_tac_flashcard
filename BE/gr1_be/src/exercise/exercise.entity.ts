import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum QuestionType {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    LISTENING = 'listening',
    READING = 'reading',
}

export enum JLPTLevel {
    N5 = 'N5',
    N4 = 'N4',
    N3 = 'N3',
    N2 = 'N2',
    N1 = 'N1',
}
export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

@Schema()
export class Exercise {
    @Prop({ required: true })
    title!: string;

    @Prop()
    questionIDs!: string[];
    @Prop()
    description?: string;

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
    questionCount!: number;

    @Prop()
    timeLimit?: number;

    @Prop({
        type: String,
        enum: Difficulty,
        required: true,
    })
    difficulty!: string;

    @Prop()
    score!: number;
}
export const ExerciseSchema =
    SchemaFactory.createForClass(Exercise);
ExerciseSchema.index({ level: 1, type: 1 });
