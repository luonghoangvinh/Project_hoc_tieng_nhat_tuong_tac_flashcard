import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityHistoryDto } from './create-activity-history.dto';

export class UpdateActivityHistoryDto
    extends PartialType(CreateActivityHistoryDto) { }