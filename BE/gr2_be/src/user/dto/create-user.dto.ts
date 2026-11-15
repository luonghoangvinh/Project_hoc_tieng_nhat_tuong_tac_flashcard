import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'Tên hiển thị của người dùng',
        example: 'vinhluong',
    })
    @IsString()
    userName!: string;

    @ApiProperty({
        description: 'Địa chỉ email dùng để đăng nhập',
        example: 'vinh@gmail.com',
    })
    @IsEmail()
    gmail!: string;

    @ApiProperty({
        description: 'Mật khẩu đăng nhập',
        example: '123456',
        minLength: 6,
    })
    @MinLength(6)
    password!: string;
}