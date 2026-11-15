import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateUserAnswerDto {
    @ApiProperty({
        description: 'ID của người dùng',
        example: '685be33d39cb3a8f67a0d123',
    })
    @IsMongoId()
    userId!: string;

    @ApiProperty({
        description: 'ID của câu hỏi',
        example: '685be45f39cb3a8f67a0d456',
    })
    @IsMongoId()
    questionId!: string;

    @ApiPropertyOptional({
        description: 'Loại câu hỏi',
        example: 'multiple_choice',
    })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({
        description: 'Cấp độ JLPT của câu hỏi',
        example: 'N3',
    })
    @IsOptional()
    @IsString()
    level?: string;

    @ApiProperty({
        description: 'Kết quả trả lời đúng hay sai',
        example: true,
    })
    @IsBoolean()
    isCorrect!: boolean;

    @ApiPropertyOptional({
        description: 'Thời gian trả lời (giây)',
        example: 12,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    timeSpent?: number;

    @ApiPropertyOptional({
        description: 'Thời điểm trả lời',
        example: '2026-06-28T20:30:00.000Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    answeredAt?: Date;
}