import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    JLPTLevel,
    QuestionType,
    Difficulty,
} from '../exercise.entity';

export class CreateExerciseDto {
    @ApiProperty({
        description: 'Tên bài luyện tập',
        example: 'Kanji N3 - Bài 1',
    })
    @IsString()
    title!: string;

    @ApiPropertyOptional({
        description: 'Mô tả bài luyện tập',
        example: 'Luyện tập Kanji chương 1',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Loại câu hỏi',
        enum: QuestionType,
        example: QuestionType.VOCABULARY,
    })
    @IsEnum(QuestionType)
    type!: QuestionType;

    @ApiProperty({
        description: 'Trình độ JLPT',
        enum: JLPTLevel,
        example: JLPTLevel.N3,
    })
    @IsEnum(JLPTLevel)
    level!: JLPTLevel;

    @ApiProperty({
        description: 'Số lượng câu hỏi',
        example: 20,
    })
    @IsNumber()
    questionCount!: number;

    @ApiPropertyOptional({
        description: 'Thời gian làm bài (giây)',
        example: 900,
    })
    @IsOptional()
    @IsNumber()
    timeLimit?: number;

    @ApiProperty({
        description: 'Độ khó',
        enum: Difficulty,
        example: Difficulty.MEDIUM,
    })
    @IsEnum(Difficulty)
    difficulty!: Difficulty;

    @ApiPropertyOptional({
        description: 'Điểm tối đa của bài luyện tập',
        example: 100,
    })
    @IsOptional()
    @IsNumber()
    score?: number;
}