import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ExerciseProgress } from './exercise-progress.entity';
import { CreateExerciseProgressDto } from './dto/create-exercise-progress.dto';
import { UpdateExerciseProgressDto } from './dto/update-exercise-progress.dto';
import { User } from '../user/user.entity';
import { Pagination } from '../common/pagination';

@Injectable()
export class ExerciseProgressService {
    constructor(
        @InjectModel(ExerciseProgress.name)
        private readonly progressModel:
            Model<ExerciseProgress>,
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) { }

    private startOfDay(date: Date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    private async updateUserPointAndStreak(userId: string, point: number) {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const today = this.startOfDay(new Date());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const lastStudyDate = user.lastStudyDate
            ? this.startOfDay(user.lastStudyDate)
            : null;

        let newStreak = user.streak || 0;

        if (!lastStudyDate) {
            newStreak = 1;
        } else if (lastStudyDate.getTime() === today.getTime()) {
            newStreak = user.streak || 1;
        } else if (lastStudyDate.getTime() === yesterday.getTime()) {
            newStreak = (user.streak || 0) + 1;
        } else {
            newStreak = 1;
        }

        await this.userModel.findByIdAndUpdate(userId, {
            $inc: { point },
            $set: {
                streak: newStreak,
                lastStudyDate: new Date(),
            },
        });
    }

    async findAll(pagination?: Pagination) {
        const query = this.progressModel.find();
        if (pagination) query.skip(pagination.skip).limit(pagination.limit);
        return query.exec();
    }

    async findByUserId(userId: string, pagination?: Pagination) {
        const query = this.progressModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ updatedAt: -1 });
        if (pagination) query.skip(pagination.skip).limit(pagination.limit);
        return query.exec();
    }

    async create(dto: CreateExerciseProgressDto) {
        const progress = await this.progressModel.create({
            ...dto,
            userId: new Types.ObjectId(dto.userId),
            exerciseId: new Types.ObjectId(dto.exerciseId),
        });

        await this.updateUserPointAndStreak(dto.userId, dto.point ?? dto.score);

        return progress;
    }

    async findById(id: string) {
        const progress =
            await this.progressModel.findById({ _id: new Types.ObjectId(id) });

        if (!progress) {
            throw new NotFoundException(
                'Progress not found',
            );
        }

        return progress;
    }

    async update(
        id: string,
        dto: UpdateExerciseProgressDto,
    ) {
        const progress =
            await this.progressModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id) },
                {
                    ...dto,
                    userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
                    exerciseId: dto.exerciseId ? new Types.ObjectId(dto.exerciseId) : undefined,
                },
                {
                    returnDocument: 'before'
                }
            );

        if (!progress) {
            throw new NotFoundException(
                'Progress not found',
            );
        }

        const point = dto.point ?? dto.score;

        if (dto.userId && typeof point === 'number') {
            await this.updateUserPointAndStreak(dto.userId, point);
        }

        return progress;
    }

    async delete(id: string) {
        const progress =
            await this.progressModel.findByIdAndDelete({ _id: new Types.ObjectId(id) });

        if (!progress) {
            throw new NotFoundException(
                'Progress not found',
            );
        }

        return progress;
    }
}
