import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

export class PublishDeckDto {
    @ApiProperty({ description: 'ID bộ thẻ cá nhân cần xuất bản', example: '6640c5f0f1b2c3d4e5f6a802' })
    @IsString()
    @IsNotEmpty()
    deckId!: string;

    @ApiProperty({ description: 'Tiêu đề hiển thị trên cộng đồng', example: 'N5 Từ vựng thiết yếu 1000 từ' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiPropertyOptional({ description: 'Mô tả bộ thẻ', example: 'Tổng hợp 1000 từ vựng N5 sát đề thi thật' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Cấp độ JLPT', enum: ['N5', 'N4', 'N3', 'N2', 'N1'], example: 'N5' })
    @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
    jlptLevel!: string;

    @ApiProperty({ description: 'Chủ đề', enum: ['vocabulary', 'grammar', 'kanji', 'conversation', 'other'], example: 'vocabulary' })
    @IsEnum(['vocabulary', 'grammar', 'kanji', 'conversation', 'other'])
    topic!: string;

    @ApiPropertyOptional({ description: 'Danh sách nhãn tags', type: [String], example: ['n5', 'từ-vựng', 'cơ-bản'] })
    @IsArray()
    @IsOptional()
    tags?: string[];
}
