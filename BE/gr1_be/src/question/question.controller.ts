import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
    constructor(
        private readonly questionService: QuestionService,
    ) { }

    @Post()
    create(
        @Body() dto: CreateQuestionDto,
    ) {
        return this.questionService.create(dto);
    }

    @Get()
    findAll() {
        return this.questionService.findAll();
    }

    @Get(':id')
    findById(
        @Param('id') id: string,
    ) {
        return this.questionService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateQuestionDto,
    ) {
        return this.questionService.update(id, dto);
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.questionService.delete(id);
    }
}
