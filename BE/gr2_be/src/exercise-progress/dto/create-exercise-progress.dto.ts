import { ApiProperty } from '@nestjs/swagger';
import {
    IsMongoId,
    IsNumber,
    IsString,
} from 'class-validator';

export class CreateExerciseProgressDto {

    @ApiProperty({
        description: 'ID của người dùng',
        example: '685be33d39cb3a8f67a0d123',
    })
    @IsMongoId()
    userId!: string;

    @ApiProperty({
        description: 'ID của bài luyện tập',
        example: '685bf01239cb3a8f67a0d456',
    })
    @IsMongoId()
    exerciseId!: string;

    @ApiProperty({
        description: 'Tên bài luyện tập',
        example: 'Kanji N3 - Bài 1',
    })
    @IsString()
    exerciseTitle!: string;

    @ApiProperty({
        description: 'Điểm số đạt được (%)',
        example: 85,
    })
    @IsNumber()
    score!: number;

    @ApiProperty({
        description: 'Tổng số câu hỏi',
        example: 20,
    })
    @IsNumber()
    totalQuestion!: number;

    @ApiProperty({
        description: 'Số câu trả lời đúng',
        example: 17,
    })
    @IsNumber()
    rightAnswer!: number;

    @ApiProperty({
        description: 'Điểm thưởng hoặc điểm tích lũy',
        example: 170,
    })
    @IsNumber()
    point!: number;
}