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

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }


    @Post()
    create(
        @Body() dto: CreateUserDto,
    ) {
        return this.userService.create(dto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @ApiOperation({
        summary: 'Lấy thống kê người dùng',
        description: 'Trả về thông tin tài khoản và thống kê học tập của người dùng đang đăng nhập.',
    })
    @ApiOkResponse({
        description: 'Lấy thống kê người dùng thành công.',
        schema: {
            example: {
                "_id": "6a1d7ed4ea40c435b6c02bf1",
                "userName": "lhvinh",
                "gmail": "lhvinh@gmail.com",
                "totalQuestion": 0,
                "rightAnswer": 0,
                "point": 110,
                "createdTime": "2026-06-01T12:45:08.911Z",
                "createdAt": "2026-06-01T12:45:08.911Z",
                "updatedAt": "2026-06-28T14:02:38.456Z",
                "lastStudyDate": "2026-06-28T14:02:38.456Z",
                "streak": 1
            }
        }
    })
    @Get(':id')
    findById(
        @Param('id') id: string,
    ) {
        return this.userService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.userService.delete(id);
    }
}
