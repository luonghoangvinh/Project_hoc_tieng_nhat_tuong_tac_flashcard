import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
    ) { }

    // REGISTER
    async register(userName: string, gmail: string, password: string) {
        const exist = await this.userModel.findOne({ gmail });
        if (exist) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userModel.create({
            userName,
            gmail,
            password: hashedPassword,

        });

        return {
            id: user._id,
            userName: user.userName,
            gmail: user.gmail,
        };
    }

    // LOGIN
    async login(gmail: string, password: string) {
        const user = await this.userModel.findOne({ gmail });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user._id,
            gmail: user.gmail,
            userName: user.userName,
        };

        return {
            access_token: this.jwtService.sign(payload),

            user: {
                id: user._id,
                userName: user.userName,
                gmail: user.gmail,

                // các field stats
                totalQuestion: user.totalQuestion,
                rightAnswer: user.rightAnswer,
                point: user.point,
                streak: user.streak,
                lastStudyDate: user.lastStudyDate,
                createdTime:user.createdTime,
            },
        };
    }
}
