import { Controller, Post, Body, HttpException, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    private readonly attempts = new Map<string, { count: number; resetAt: number }>();

    private checkRateLimit(request: Request) {
        const key = request.ip || 'unknown';
        const now = Date.now();
        const current = this.attempts.get(key);
        if (!current || current.resetAt <= now) {
            this.attempts.set(key, { count: 1, resetAt: now + 60_000 });
            return;
        }
        if (current.count >= 10) {
            throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
        }
        current.count += 1;
    }

    @Post('register')
    @ApiOperation({
    summary: 'Đăng ký',
    description: 'Đăng kí tài khoản mới'
})
    register(@Body() dto: RegisterDto, @Req() request: Request) {
        this.checkRateLimit(request);
        return this.authService.register(
            dto.userName,
            dto.gmail,
            dto.password,
        );
    }

    @Post('login')
    @ApiOperation({
        summary: 'Đăng nhập',
        description: 'Xác thực người dùng bằng gmail và mật khẩu. Nếu thành công sẽ trả về JWT token.'
    })
    login(@Body() dto: LoginDto, @Req() request: Request) {
        this.checkRateLimit(request);
        return this.authService.login(dto.gmail, dto.password);
    }
}
