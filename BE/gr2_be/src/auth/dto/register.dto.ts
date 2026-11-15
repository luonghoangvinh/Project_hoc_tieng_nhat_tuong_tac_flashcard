import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {

    @ApiProperty({
        description: 'Tên người dùng',
        example: 'vinhluong',
    })
    @IsString()
    @MaxLength(80)
    @IsNotEmpty()
    userName!: string;

    @ApiProperty({
        description: 'Địa chỉ email',
        example: 'vinh@gmail.com',
    })
    @IsEmail()
    gmail!: string;

    @ApiProperty({
        description: 'Mật khẩu',
        example: '123456',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(72)
    password!: string;
}
