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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { getPagination } from '../common/pagination';

import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('exercises')
export class ExerciseController {
    constructor(
        private readonly exerciseService: ExerciseService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @Body() dto: CreateExerciseDto,
    ) {
        return this.exerciseService.create(dto);
    }


    @ApiOperation({
        summary: 'Lấy danh sách bài luyện tập',
        description: 'Trả về danh sách các bài luyện tập theo cấp độ và loại câu hỏi.',
    })
    @ApiOkResponse({
        description: 'Lấy danh sách bài luyện tập thành công.',
        schema: {
            example: [
                {
                    "_id": "6a1dc227dc951ae512789ba2",
                    "title": "Kanji Reading Practice 01",
                    "questionIDs": [
                        "6a1dc0addc951ae512789b97",
                        "6a1dc0addc951ae512789b98",
                        "6a1dc10bdc951ae512789b9a",
                        "6a1dc10bdc951ae512789b9b",
                        "6a1dc10bdc951ae512789b9c",
                        "6a1dc10bdc951ae512789b9d"
                    ],
                    "description": "Luyện tập từ vựng JLPT N4 dạng chọn Kanji hoặc cách đọc đúng.",
                    "type": "vocabulary",
                    "level": "N4",
                    "questionCount": 6,
                    "timeLimit": 5,
                    "difficulty": "easy",
                    "score": 100
                }
            ]
        }
    })
    @Get()
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.exerciseService.findAll(getPagination(page, limit));
    }

    @ApiOperation({
        summary: 'Lấy danh sách bài luyện tập',
        description:
            'Trả về danh sách bài luyện tập theo loại câu hỏi và cấp độ JLPT, đồng thời bao gồm trạng thái hoàn thành của người dùng.',
    })
    @ApiOkResponse({
        description: 'Lấy danh sách bài luyện tập thành công.',
        schema: {
            example: [
                {
                    "_id": "6a326eccdc98f1bdad1bc7ad",
                    "title": "JLPT N5 Vocabulary Reading Practice 01",
                    "questionIDs": [
                        "6a326991dc98f1bdad1bc799",
                        "6a326991dc98f1bdad1bc79a",
                        "6a326991dc98f1bdad1bc79b",
                        "6a326991dc98f1bdad1bc79c",
                        "6a326991dc98f1bdad1bc79d",
                        "6a326991dc98f1bdad1bc79e"
                    ],
                    "description": "Luyện tập từ vựng JLPT N5 phần 1.",
                    "type": "vocabulary",
                    "level": "N5",
                    "questionCount": 6,
                    "timeLimit": 5,
                    "difficulty": "easy",
                    "score": 0,
                    "completed": false,
                    "progressId": ""
                }
            ]
        }
    })
    @Get("findBy")
    async getExercises(
        @Query('userId') userId?: string,
        @Query('level') level?: string,
        @Query('type') type?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.exerciseService.getExercises(userId, level, type, getPagination(page, limit));
    }


    @ApiOperation({
        summary: 'Lấy chi tiết bài luyện tập',
        description:
            'Trả về thông tin chi tiết của bài luyện tập cùng trạng thái hoàn thành và điểm số của người dùng.',
    })
    @ApiOkResponse({
        description: 'Lấy thông tin bài luyện tập thành công.',
        schema: {
            example: {
                "_id": "6a1ffd3b20713e6234e04142",
                "title": "N5 Grammar Basics",
                "questionIDs": [
                    "6a1ffc7b20713e6234e04133",
                    "6a1ffc7b20713e6234e04134",
                    "6a1ffc7b20713e6234e04135"
                ],
                "description": "Luyện tập ngữ pháp JLPT N5 bao gồm trợ từ, mẫu câu, hội thoại và sắp xếp thứ tự từ.",
                "type": "grammar",
                "level": "N5",
                "questionCount": 13,
                "timeLimit": 10,
                "difficulty": "easy",
                "score": 100,
                "completed": true,
                "progressId": "6a22fc5811fcd35aa62416ab"
            }
        }
    })
    @Get('ByUserIandId')
    findByUserIandId(
        @Query('userId') userId: string,
        @Query('id') id: string,
    ) {
        return this.exerciseService.findByUserIdAndId(userId, id);
    }

    @ApiOperation({
        summary: 'Lấy danh sách câu hỏi',
        description: 'Trả về toàn bộ câu hỏi thuộc một bài luyện tập.',
    })
    @ApiOkResponse({
        description: 'Lấy danh sách câu hỏi thành công.',
        schema: {
            example: [
                {
                    "_id": "6a1fd84920713e6234e040f1",
                    "type": "vocabulary",
                    "level": "N5",
                    "question": "(絵)を かきました。",
                    "options": [
                        "ぶん",
                        "ほん",
                        "え",
                        "じ"
                    ],
                    "correctAnswer": 2,
                    "explanation": "絵（え）をかく: Vẽ tranh."
                }
            ]
        }
    })
    @Get(':id/questions')
    getQuestionsByExerciseId(
        @Param('id') exerciseId: string,
    ) {
        return this.exerciseService.getQuestionsByExerciseId(exerciseId);
    }
    @Get(':id')
    findById(
        //@Query('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.exerciseService.findById(id);
    }



    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id') id: string,
        @Body() dto: UpdateExerciseDto,
    ) {
        return this.exerciseService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    delete(
        @Param('id') id: string,
    ) {
        return this.exerciseService.delete(id);
    }
}
