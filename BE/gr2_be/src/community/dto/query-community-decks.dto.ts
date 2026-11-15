import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCommunityDecksDto {
    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm trong tên, mô tả, tags, tác giả', example: 'kanji' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Cấp độ JLPT', enum: ['all', 'N5', 'N4', 'N3', 'N2', 'N1'], example: 'all' })
    @IsString()
    @IsOptional()
    level?: string;

    @ApiPropertyOptional({ description: 'Chủ đề', enum: ['all', 'vocabulary', 'grammar', 'kanji', 'conversation', 'other'], example: 'all' })
    @IsString()
    @IsOptional()
    topic?: string;

    @ApiPropertyOptional({ description: 'Sắp xếp theo', enum: ['popular', 'newest', 'top-rated', 'most-downloaded'], example: 'popular' })
    @IsString()
    @IsOptional()
    sort?: string;

    @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: '1', example: '1' })
    @IsString()
    @IsOptional()
    page?: string;

    @ApiPropertyOptional({ description: 'Số lượng bộ thẻ mỗi trang', default: '12', example: '12' })
    @IsString()
    @IsOptional()
    perPage?: string;
}
