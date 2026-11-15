import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

import { UserModule } from '../user/user.module';

@Global()
@Module({
    imports: [
        UserModule,

        PassportModule,

        ConfigModule,

        JwtModule.registerAsync({
            inject: [ConfigService],

            useFactory: (
                configService: ConfigService,
            ) => ({
                secret:
                    configService.get<string>(
                        'JWT_SECRET',
                    ),

                signOptions: {
                    expiresIn: '1d',
                },
            }),
        }),
    ],

    controllers: [AuthController],

    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [JwtAuthGuard],
})
export class AuthModule { }
