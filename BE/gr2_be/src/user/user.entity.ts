import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    _id!: Types.ObjectId;
    @Prop({ required: true })
    userName!: string;

    @Prop({ required: true, unique: true })
    gmail!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ default: Date.now })
    createdTime!: Date;

    @Prop({ default: 0 })
    totalQuestion!: number;

    @Prop({ default: 0 })
    rightAnswer!: number;

    @Prop({ default: 0 })
    point!: number;

    @Prop({ default: 0 })
    streak!: number;

    @Prop({ default: '' })
    avatar?: string;

    @Prop()
    lastStudyDate?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
