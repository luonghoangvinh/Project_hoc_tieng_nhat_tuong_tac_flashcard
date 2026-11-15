import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { getPagination } from '../common/pagination';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ExerciseProgressService } from './exercise-progress.service';
import { CreateExerciseProgressDto } from './dto/create-exercise-progress.dto';
import { UpdateExerciseProgressDto } from './dto/update-exercise-progress.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('exercise-progress')
@UseGuards(JwtAuthGuard)
export class ExerciseProgressController {
    constructor(
        private readonly progressService: ExerciseProgressService,
    ) { }


    @ApiOperation({
                summary: 'Thêm thông tin hoàn thiện bài tập',
                description: 'Đưa dữ liệu bài tập lần đầu của người dùng vào cơ sở dữ liệu',
            })
    @Post()
    create(
        @Body() dto: CreateExerciseProgressDto,
    ) {
        return this.progressService.create(dto);
    }


    @ApiOkResponse({
        description: 'Lấy danh sách kết quả các bài luyện tập của người dùng',
        schema: {
            example: [
                {
                    "_id": "6a21ae58691b0be4d7730f43",
                    "userId": "6a1d7ed4ea40c435b6c02bf1",
                    "exerciseId": "6a1fe90e20713e6234e04107",
                    "completeAt": "2026-06-04T16:30:00.000Z",
                    "score": 10,
                    "totalQuestion": 20,
                    "rightAnswer": 2,
                    "updatedAt": "2026-06-28T12:39:12.811Z",
                    "exerciseTitle": "N5 Vocab 01"
                }
            ]
        }
    })
    @Get('user/:userId')
    @ApiOperation({
        description: 'Lấy thông tin bài tập đã hoàn hoàn thành bởi người dùng'
    })
    getProgressByUserId(
        @Param('userId') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.progressService.findByUserId(userId, getPagination(page, limit));
    }

    @Get()
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.progressService.findAll(getPagination(page, limit));
    }

    @Get(':id')
    findById(
        @Param('id') id: string,
    ) {
        return this.progressService.findById(id);
    }


    @ApiOperation({
                summary: 'chỉnh sửa thông tin hoàn thiện bài tập',
                description: 'Chỉnh sửa thông tin bài tập đã hoàn thành của người dùng vào cơ sở dữ liệu',
            })
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateExerciseProgressDto,
    ) {
        return this.progressService.update(id, dto);
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.progressService.delete(id);
    }

}
