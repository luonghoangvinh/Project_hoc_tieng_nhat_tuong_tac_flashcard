import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Question, QuestionSchema } from './question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Question.name,
                schema: QuestionSchema,
            },
        ]),
        AuthModule,
    ],
    controllers: [QuestionController],
    providers: [QuestionService],
    exports: [MongooseModule, QuestionService],
})
export class QuestionModule { }
