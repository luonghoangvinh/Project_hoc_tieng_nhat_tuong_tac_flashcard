import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class SubmitRatingDto {
    @ApiProperty({ description: 'Số sao đánh giá (1 đến 5)', minimum: 1, maximum: 5, example: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({ description: 'Nhận xét bình luận', example: 'Bộ thẻ rất hữu ích, ví dụ rõ ràng!' })
    @IsString()
    @IsOptional()
    comment?: string;
}
