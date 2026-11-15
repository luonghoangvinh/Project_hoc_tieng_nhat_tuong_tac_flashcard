import { BadRequestException } from '@nestjs/common';

export interface Pagination { skip: number; limit: number }

export function getPagination(page?: string, limit?: string) {
    if (page === undefined && limit === undefined) return undefined;

    const parsedPage = Number(page ?? 1);
    const parsedLimit = Number(limit ?? 20);
    if (!Number.isInteger(parsedPage) || parsedPage < 1 ||
        !Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        throw new BadRequestException('page must be >= 1 and limit must be between 1 and 100');
    }
    return { skip: (parsedPage - 1) * parsedLimit, limit: parsedLimit };
}
