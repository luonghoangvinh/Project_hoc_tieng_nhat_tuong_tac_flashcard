import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseProgressDto } from './create-exercise-progress.dto';

export class UpdateExerciseProgressDto
    extends PartialType(CreateExerciseProgressDto) { }