import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Exercise } from './exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Question } from '../question/question.entity';
import { ExerciseProgress } from '../exercise-progress/exercise-progress.entity';
import { Pagination } from '../common/pagination';

@Injectable()
export class ExerciseService {
    private readonly cache = new Map<string, { expiresAt: number; value: any }>();
    constructor(
        @InjectModel(Exercise.name)
        private readonly exerciseModel: Model<Exercise>,

        @InjectModel(Question.name)
        private readonly questionModel: Model<Question>,

        @InjectModel(ExerciseProgress.name)
        private readonly exerciseProgressModel: Model<ExerciseProgress>
    ) { }


    async create(dto: CreateExerciseDto) {
        this.cache.clear();
        return this.exerciseModel.create(dto);
    }

    async findAll(pagination?: Pagination) {
        if (pagination) return this.exerciseModel.find().skip(pagination.skip).limit(pagination.limit).lean().exec();
        return this.cached('all', () => this.exerciseModel.find().lean().exec());
    }

    async findById(id: string) {
        const exercise =
            await this.exerciseModel.findById(id);
        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        return exercise;
    }

    async findByUserIdAndId(userId: string,id: string) {
        const exercise = await this.exerciseModel.findById(id);
        const userProgress = await this.exerciseProgressModel.find({ userId: new Types.ObjectId(userId) });
        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        return {
            ...exercise.toObject(),
            completed: userProgress.some(p => p.exerciseId.equals(exercise._id)),
            progressId: userProgress.find(p => p.exerciseId.equals(exercise._id))?._id??""
        };
    }

    async update(
        id: string,
        dto: UpdateExerciseDto,
    ) {
        this.cache.clear();
        const exercise =
            await this.exerciseModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                dto,
                { new: true },
            );

        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        return exercise;
    }

    async delete(id: string) {
        this.cache.clear();
        const exercise =
            await this.exerciseModel.findByIdAndDelete({ _id: new Types.ObjectId(id) });

        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        return exercise;
    }


    async getExercises(
        userId?: string,
        level?: string,
        type?: string,
        pagination?: Pagination,
    ) {
        const cacheKey = `list:${level ?? ''}:${type ?? ''}`;
        if (!userId && !pagination) return this.cached(cacheKey, async () => {
            const filter: Record<string, string> = {};
            if (level) filter.level = level;
            if (type) filter.type = type;
            const items = await this.exerciseModel.find(filter).lean().exec();
            return items.map(ex => ({ ...ex, completed: false, score: 0, progressId: '' }));
        });

        let userProgress: ExerciseProgress[] = [];
        const filter: any = {};

        if (level) {
            filter.level = level;
        }

        if (type) {
            filter.type = type;
        }
        if (userId) {
            userProgress = await this.exerciseProgressModel.find({ userId: new Types.ObjectId(userId) }).select('exerciseId score').lean();
        }

        const query = this.exerciseModel.find(filter);
        if (pagination) query.skip(pagination.skip).limit(pagination.limit);
        const exercises = await query.lean();
        const progressByExercise = new Map(userProgress.map(progress => [progress.exerciseId.toString(), progress]));

        return exercises.map(ex => ({
            ...ex,
            completed: progressByExercise.has(ex._id.toString()),
            score: progressByExercise.get(ex._id.toString())?.score ?? 0,
            progressId: progressByExercise.get(ex._id.toString())?._id ?? ""
        }));
    }

    private async cached<T>(key: string, load: () => Promise<T>): Promise<T> {
        const entry = this.cache.get(key);
        if (entry && entry.expiresAt > Date.now()) return entry.value as T;
        const value = await load();
        this.cache.set(key, { value, expiresAt: Date.now() + 60_000 });
        return value;
    }
    async getQuestionsByExerciseId(exerciseId: string) {
        const exercise = await this.exerciseModel.findById(exerciseId);

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        return this.questionModel.find({
            _id: { $in: exercise.questionIDs }
        });
    }
}
