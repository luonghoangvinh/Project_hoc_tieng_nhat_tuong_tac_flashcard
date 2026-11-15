import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DeckController {
    constructor(
        private readonly deckService: DeckService,
    ) { }

    @ApiOperation({
            summary: 'Tạo bộ flashcard mới',
            description: 'Tạo deck mới với ID người dùng và lưu vào cơ sở dữ liệu',
        })
    @Post()
    create(
        @Body() dto: CreateDeckDto,
    ) {
        return this.deckService.create(dto);
    }


    @ApiOperation({
            summary: 'copy deck mới',
            description: 'Tạo deck mới với ID người dùng dựa trên deck cũ với ID đã đưa vào api và lưu vào cơ sở dữ liệu',
        })
    @Post(':id/duplicate')
    async duplicate(
        @Param('id') id: string,
    ) {
        const deck = await this.deckService.duplicate(id);

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        return deck;
    }

    @ApiOperation({
        summary: 'Lấy danh sách bộ flashcard',
        description: 'Trả về tất cả bộ flashcard của người dùng cùng danh sách các thẻ trong từng bộ.',
    })
    @ApiOkResponse({
        description: 'Lấy danh sách bộ flashcard thành công.',
        schema: {
            example: [
                {
                    "_id": "6a3e4e919e9c18d6c6f7005d",
                    "userId": "6a1d7ed4ea40c435b6c02bf1",
                    "name": "JLPT N5 Vocabulary",
                    "description": "Các từ vựng cơ bản N5",
                    "cards": [
                        {
                            "front": "thẻ 1",
                            "back": "ok",
                            "type": "vocabulary",
                            "level": "N5",
                            "example": "",
                            "_id": "6a3e4ed19e9c18d6c6f70063"
                        }
                    ],
                    "color": "#4F46E5",
                    "icon": "BookOpen",
                    "visibility": "personal",
                    "createdAt": "2026-06-28T12:00:00.000Z",
                    "updatedAt": "2026-06-28T12:10:00.000Z"
                }
            ]
        }
    })
    @Get("user/:id")
    findByUserId(
        @Param('id') userId: string,
    ) {
        return this.deckService.findByUserId(userId);
    }


    @Get()
    findAll() {
        return this.deckService.findAll();
    }


    @ApiOperation({
        summary: 'Lấy 1 bộ flashcard',
        description: 'Trả về bộ flashcard của người dùng cùng danh sách các thẻ trong từng bộ thông qua id của bộ flashcard.',
    })
    @ApiOkResponse({
        description: 'Lấy danh sách bộ flashcard thành công.',
        schema: {
            example:
                {
                    "_id": "6a3e4e919e9c18d6c6f7005d",
                    "userId": "6a1d7ed4ea40c435b6c02bf1",
                    "name": "JLPT N5 Vocabulary",
                    "description": "Các từ vựng cơ bản N5",
                    "cards": [
                        {
                            "front": "thẻ 1",
                            "back": "ok",
                            "type": "vocabulary",
                            "level": "N5",
                            "example": "",
                            "_id": "6a3e4ed19e9c18d6c6f70063"
                        }
                    ],
                    "color": "#4F46E5",
                    "icon": "BookOpen",
                    "visibility": "personal",
                    "createdAt": "2026-06-28T12:00:00.000Z",
                    "updatedAt": "2026-06-28T12:10:00.000Z"
                }
        }
    })
    @Get(':id')
    findById(
        @Param('id') id: string,
    ) {
        return this.deckService.findById(id);
    }


    @ApiOperation({
            summary: 'chỉnh sửa thông tin bộ flashcard',
            description: 'chỉnh sửa dữ liệu của bộ flashcard và lưu vào cơ sở dữ liệu',
        })
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateDeckDto,
    ) {
        return this.deckService.update(id, dto);
    }

    @ApiOperation({
        summary: 'Xóa 1 bộ flashcard',
        description: 'Xóa một bộ flashcard của người dùng thông qua id của bộ flashcard.',
    })
    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.deckService.delete(id);
    }
}
