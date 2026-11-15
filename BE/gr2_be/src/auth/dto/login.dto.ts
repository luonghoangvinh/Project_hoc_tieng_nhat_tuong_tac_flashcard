import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class LoginDto {

    @ApiProperty({
        description: 'Email đăng nhập',
        example: 'vinh@gmail.com',
    })
    @IsEmail()
    @IsString()
    gmail!: string;

    @ApiProperty({
        description: 'Mật khẩu',
        example: '123456',
        minLength: 6,
    })
    @IsString()
    @MaxLength(72)
    @MinLength(6)
    password!: string;
}
