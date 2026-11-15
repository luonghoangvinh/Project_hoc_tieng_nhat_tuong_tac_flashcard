import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Question } from './question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name)
        private readonly questionModel: Model<Question>,
    ) { }

    async create(dto: CreateQuestionDto) {
        return this.questionModel.create(dto);
    }

    async findAll() {
        return this.questionModel.find().exec();
    }

    async findById(id: string) {
        const question =
            await this.questionModel.findById({_id: new Types.ObjectId(id)});

        if (!question) {
            throw new NotFoundException(
                'Question not found',
            );
        }

        return question;
    }

    async update(
        id: string,
        dto: UpdateQuestionDto,
    ) {
        const question =
            await this.questionModel.findByIdAndUpdate(
                {_id: new Types.ObjectId(id)},
                dto,
                { new: true },
            );

        if (!question) {
            throw new NotFoundException(
                'Question not found',
            );
        }

        return question;
    }

    async delete(id: string) {
        const question =
            await this.questionModel.findByIdAndDelete({_id: new Types.ObjectId(id)});

        if (!question) {
            throw new NotFoundException(
                'Question not found',
            );
        }

        return question;
    }
}