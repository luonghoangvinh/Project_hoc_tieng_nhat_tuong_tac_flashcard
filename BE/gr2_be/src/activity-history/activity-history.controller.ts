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

import { ActivityHistoryService } from './activity-history.service';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { UpdateActivityHistoryDto } from './dto/update-activity-history.dto';

@Controller('activity-history')
@UseGuards(JwtAuthGuard)
export class ActivityHistoryController {
    constructor(
        private readonly historyService: ActivityHistoryService,
    ) { }

    @Post()
    create(
        @Body() dto: CreateActivityHistoryDto,
    ) {
        return this.historyService.create(dto);
    }

    @Get()
    findAll() {
        return this.historyService.findAll();
    }

    @Get(':id')
    findById(
        @Param('id') id: string,
    ) {
        return this.historyService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateActivityHistoryDto,
    ) {
        return this.historyService.update(id, dto);
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.historyService.delete(id);
    }
}
