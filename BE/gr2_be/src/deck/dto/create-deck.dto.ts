import { Type } from 'class-transformer';
import {
    IsArray,
    IsMongoId,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { CreateFlashcardDto } from '../../flashcard/dto/create-flashcard.dto';

export class CreateDeckDto {

    @ApiProperty({
        description: 'ID của người sở hữu bộ thẻ',
        example: '685be33d39cb3a8f67a0d123',
    })
    @IsMongoId()
    userId!: string;

    @ApiProperty({
        description: 'Tên bộ flashcard',
        example: 'JLPT N3 - Kanji',
    })
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        description: 'Mô tả bộ flashcard',
        example: 'Các Kanji thường gặp trong JLPT N3',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Danh sách flashcard của bộ',
        type: [CreateFlashcardDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFlashcardDto)
    cards!: CreateFlashcardDto[];

    @ApiPropertyOptional({
        description: 'Màu hiển thị của bộ thẻ',
        example: '#4F46E5',
    })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({
        description: 'Tên icon hiển thị',
        example: 'BookOpen',
    })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({
        description: 'Phạm vi chia sẻ của bộ thẻ',
        example: 'personal',
        enum: ['personal', 'community'],
    })
    @IsString()
    visibility!: string;
}