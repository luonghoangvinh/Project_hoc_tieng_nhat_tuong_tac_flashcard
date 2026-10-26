import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    ExerciseProgress,
    ExerciseProgressSchema,
} from './exercise-progress.entity';
import { User, UserSchema } from '../user/user.entity';
import { ExerciseProgressController } from './exercise-progress.controller';
import { ExerciseProgressService } from './exercise-progress.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: ExerciseProgress.name,
                schema: ExerciseProgressSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    controllers: [ExerciseProgressController],
    providers: [ExerciseProgressService],
    exports: [MongooseModule, ExerciseProgressService],
})
export class ExerciseProgressModule { }
