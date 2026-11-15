import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

import { JLPTLevel, QuestionType } from '../../exercise/exercise.entity';
export class CreateQuestionDto {
    @IsEnum(QuestionType)
    type!: QuestionType;

    @IsEnum(JLPTLevel)
    level!: JLPTLevel;

    @IsOptional()
    @IsString()
    audioURL?: string;

    @IsOptional()
    @IsString()
    imageURL?: string;

    @IsString()
    question!: string;

    @IsArray()
    options!: string[];

    @IsNumber()
    correctAnswer!: number;

    @IsOptional()
    @IsString()
    explanation?: string;
}