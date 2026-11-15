import { Module } from "@nestjs/common";
import { MongooseModule, Schema } from "@nestjs/mongoose";
import { Mongoose } from "mongoose";
import { UserAnswer, UserAnswerSchema } from "./user-answer.entity";
import { UserAnswersService } from "./user-answer.service";
import { UserAnswersController } from "./user-answer.controller";
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [AuthModule, MongooseModule.forFeature([{
        name: UserAnswer.name,
        schema: UserAnswerSchema,
    }])],
    providers: [UserAnswersService],
    controllers: [UserAnswersController]
})
export class UserAnswerModule {}
