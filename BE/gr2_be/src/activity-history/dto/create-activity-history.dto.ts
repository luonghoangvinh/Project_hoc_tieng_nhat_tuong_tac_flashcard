import {
    IsMongoId,
    IsNumber,
    IsString,
} from 'class-validator';

export class CreateActivityHistoryDto {
    @IsMongoId()
    accountId!: string;

    @IsString()
    title!: string;

    @IsNumber()
    totalQuestion!: number;

    @IsNumber()
    rightAnswer!: number;
}