import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserAnswerDocument = HydratedDocument<UserAnswer>;

@Schema({
    timestamps: true,
})
export class UserAnswer {
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    questionId!: Types.ObjectId;

    @Prop({
        required: true,
    })
    type!: string;

    @Prop({
        required: true,
    })
    level!: string;

    @Prop({
        required: true,
    })
    isCorrect!: boolean;

    @Prop({
        required: true,
        min: 0,
    })
    timeSpent?: number;

    @Prop({
        required: true,
        default: Date.now,
    })
    answeredAt?: Date;

    
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);
UserAnswerSchema.index({ userId: 1, answeredAt: -1 });
