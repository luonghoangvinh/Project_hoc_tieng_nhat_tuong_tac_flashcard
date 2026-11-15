import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Exercise, ExerciseSchema } from './exercise.entity';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { QuestionModule } from '../question/question.module';
import { ExerciseProgressModule } from '../exercise-progress/exercise-progress.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Exercise.name,
                schema: ExerciseSchema,
            },
        ]),
        QuestionModule,
        ExerciseProgressModule,
        AuthModule,
    ],
    controllers: [ExerciseController],
    providers: [ExerciseService],
    exports: [MongooseModule, ExerciseService],
})
export class ExerciseModule { }
