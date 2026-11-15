import {
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) { }

    async create(dto: CreateUserDto) {

        return this.userModel.create(dto);

    }

    async findAll() {
        return this.userModel.find().exec();
    }

    async findById(id: string) {
        const user = await this.userModel.findById(id).select('-password -__v');;


        return user;
    }


    async findByUsername(username: string) {
        const user = await this.userModel.findOne({ userName: username });
        return user;
    }

    async findByGmail(gmail: string) {
        const user = await this.userModel.findOne({ gmail: gmail });
        return user;
    }



    async update(
        id: string,
        dto: UpdateUserDto,
    ) {
        const user = await this.userModel.findByIdAndUpdate(
            id,
            dto,
            { new: true },
        );



        return user;
    }

    async delete(id: string) {
        const user =
            await this.userModel.findByIdAndDelete(id);

        return user;
    }
}