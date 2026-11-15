import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ActivityHistory } from './activity-history.entity';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { UpdateActivityHistoryDto } from './dto/update-activity-history.dto';

@Injectable()
export class ActivityHistoryService {
    constructor(
        @InjectModel(ActivityHistory.name)
        private readonly historyModel:
            Model<ActivityHistory>,
    ) { }

    async create(
        dto: CreateActivityHistoryDto,
    ) {
        return this.historyModel.create(dto);
    }

    async findAll() {
        return this.historyModel.find().exec();
    }

    async findById(id: string) {
        const history =
            await this.historyModel.findById(id);

        if (!history) {
            throw new NotFoundException(
                'History not found',
            );
        }

        return history;
    }

    async update(
        id: string,
        dto: UpdateActivityHistoryDto,
    ) {
        const history =
            await this.historyModel.findByIdAndUpdate(
                id,
                dto,
                { new: true },
            );

        if (!history) {
            throw new NotFoundException(
                'History not found',
            );
        }

        return history;
    }

    async delete(id: string) {
        const history =
            await this.historyModel.findByIdAndDelete(id);

        if (!history) {
            throw new NotFoundException(
                'History not found',
            );
        }

        return history;
    }
}