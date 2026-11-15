import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ActivityHistoryModule } from './activity-history/activity-history.module';
import { QuestionModule } from './question/question.module';
import { DeckModule } from './deck/deck.module';
import { ExerciseProgressModule } from './exercise-progress/exercise-progress.module';
import { AuthModule } from './auth/auth.module';
import { UserAnswerModule } from './user-answer/user-answer.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    UserModule,
    ExerciseModule,
    QuestionModule,
    DeckModule,
    ExerciseProgressModule,
    ActivityHistoryModule,
    AuthModule,
    UserAnswerModule,
    CommunityModule,
  ],
})
export class AppModule {}