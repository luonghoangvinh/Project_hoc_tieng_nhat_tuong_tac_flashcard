import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';
import {JLPTLevel} from "../../exercise/exercise.entity";

export class CreateFlashcardDto {
    @IsString()
    front!: string;

    @IsString()
    back!: string;

    @IsEnum(['vocabulary', 'grammar'])
    type?: string;

    @IsEnum(JLPTLevel)
    level?: JLPTLevel;

    @IsOptional()
    @IsString()
    example?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    audio?: string;
}