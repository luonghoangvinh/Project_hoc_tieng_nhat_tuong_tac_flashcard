import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiOkResponse,
    ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunityService } from './community.service';
import { PublishDeckDto } from './dto/publish-deck.dto';
import { SubmitRatingDto } from './dto/submit-rating.dto';
import { QueryCommunityDecksDto } from './dto/query-community-decks.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @ApiOperation({
        summary: 'Lấy danh sách bộ thẻ cộng đồng',
        description: 'Tìm kiếm, lọc theo cấp độ JLPT, chủ đề, sắp xếp và phân trang danh sách bộ thẻ được chia sẻ công khai.',
    })
    @ApiOkResponse({ description: 'Lấy danh sách bộ thẻ cộng đồng thành công.' })
    @Get('decks')
    findAll(@Query() query: QueryCommunityDecksDto) {
        return this.communityService.findAll(query);
    }

    @ApiOperation({
        summary: 'Lấy các mục bộ thẻ nổi bật',
        description: 'Trả về 3 danh mục nổi bật cho trang chủ cộng đồng: Mới nhất (newest), Đánh giá cao nhất (topRated), và Tải nhiều nhất (mostDownloaded).',
    })
    @ApiOkResponse({ description: 'Lấy danh mục nổi bật thành công.' })
    @Get('featured')
    getFeatured() {
        return this.communityService.getFeatured();
    }

    @ApiOperation({
        summary: 'Lấy danh sách bộ thẻ cộng đồng đã lưu',
        description: 'Trả về danh sách đầy đủ các bộ thẻ cộng đồng mà người dùng đang đăng nhập đã bookmark/lưu.',
    })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('saved')
    getSavedDecks(@Req() req: any) {
        return this.communityService.getSavedDecks(req.user.userId);
    }

    @ApiOperation({
        summary: 'Lấy danh sách ID các bộ thẻ đã lưu',
        description: 'Trả về mảng string ID các bộ thẻ mà người dùng hiện tại đã lưu.',
    })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('saved-ids')
    getSavedDeckIds(@Req() req: any) {
        return this.communityService.getSavedDeckIds(req.user.userId);
    }

    @ApiOperation({
        summary: 'Xem chi tiết bộ thẻ cộng đồng',
        description: 'Trả về chi tiết bộ thẻ, tác giả, danh sách thẻ xem trước và tự động tăng lượt xem (viewCount).',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cộng đồng' })
    @Get('decks/:id')
    findById(@Param('id') id: string) {
        return this.communityService.findById(id);
    }

    @ApiOperation({
        summary: 'Lấy danh sách bộ thẻ liên quan',
        description: 'Lấy tối đa 4 bộ thẻ cộng đồng khác có cùng chủ đề hoặc cấp độ JLPT.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ hiện tại' })
    @Get('decks/:id/related')
    findRelated(@Param('id') id: string) {
        return this.communityService.findRelated(id);
    }

    @ApiOperation({
        summary: 'Xuất bản bộ thẻ cá nhân lên cộng đồng',
        description: 'Đăng tải một bộ thẻ cá nhân lên chợ cộng đồng với cấu hình tiêu đề, mô tả, trình độ JLPT, chủ đề và nhãn tags.',
    })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('decks/publish')
    publishDeck(@Req() req: any, @Body() dto: PublishDeckDto) {
        return this.communityService.publishDeck(req.user.userId, dto);
    }

    @ApiOperation({
        summary: 'Gỡ bộ thẻ khỏi cộng đồng (Unpublish)',
        description: 'Chuyển trạng thái bộ thẻ về cá nhân, không còn xuất hiện trên chợ cộng đồng.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cần gỡ' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Delete('decks/:id/publish')
    unpublishDeck(@Req() req: any, @Param('id') id: string) {
        return this.communityService.unpublishDeck(req.user.userId, id);
    }

    @ApiOperation({
        summary: 'Tải bộ thẻ cộng đồng về cá nhân',
        description: 'Tạo bản sao độc lập của bộ thẻ cộng đồng vào danh sách bộ thẻ cá nhân của học viên và tăng lượt download.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cộng đồng cần tải' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('decks/:id/download')
    downloadDeck(@Req() req: any, @Param('id') id: string) {
        return this.communityService.downloadDeck(req.user.userId, id);
    }

    @ApiOperation({
        summary: 'Lưu bộ thẻ vào danh sách yêu thích (Bookmark)',
        description: 'Lưu liên kết bộ thẻ cộng đồng vào danh sách yêu thích của người dùng và tăng saveCount.',
    })
    @ApiParam({ name: 'deckId', description: 'ID của bộ thẻ cộng đồng' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('saved/:deckId')
    saveDeck(@Req() req: any, @Param('deckId') deckId: string) {
        return this.communityService.saveDeck(req.user.userId, deckId);
    }

    @ApiOperation({
        summary: 'Bỏ lưu bộ thẻ khỏi danh sách yêu thích (Unbookmark)',
        description: 'Xóa bộ thẻ khỏi danh sách yêu thích và giảm saveCount.',
    })
    @ApiParam({ name: 'deckId', description: 'ID của bộ thẻ cộng đồng' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Delete('saved/:deckId')
    unsaveDeck(@Req() req: any, @Param('deckId') deckId: string) {
        return this.communityService.unsaveDeck(req.user.userId, deckId);
    }

    // --- RATINGS MODULE ---
    @ApiOperation({
        summary: 'Lấy danh sách đánh giá của bộ thẻ',
        description: 'Trả về toàn bộ đánh giá số sao và nhận xét của học viên cho một bộ thẻ cộng đồng.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cộng đồng' })
    @Get('decks/:id/ratings')
    getRatings(@Param('id') id: string) {
        return this.communityService.getRatings(id);
    }

    @ApiOperation({
        summary: 'Gửi đánh giá và bình luận cho bộ thẻ',
        description: 'Học viên đánh giá từ 1 đến 5 sao kèm nhận xét. Tự động tính toán lại điểm sao trung bình của bộ thẻ.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cộng đồng' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('decks/:id/ratings')
    submitRating(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: SubmitRatingDto,
    ) {
        return this.communityService.submitRating(req.user.userId, id, dto);
    }

    @ApiOperation({
        summary: 'Lấy đánh giá của chính người dùng hiện tại cho bộ thẻ',
        description: 'Kiểm tra xem người dùng hiện tại đã đánh giá bộ thẻ này chưa và lấy thông tin đánh giá cũ.',
    })
    @ApiParam({ name: 'id', description: 'ID của bộ thẻ cộng đồng' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('decks/:id/ratings/me')
    getUserRating(@Req() req: any, @Param('id') id: string) {
        return this.communityService.getUserRating(req.user.userId, id);
    }
}
