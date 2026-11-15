import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../user/user.entity";

@Schema()
export class ActivityHistory {
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
    })
    accountId!: Types.ObjectId;

    @Prop()
    title!: string;

    @Prop({ default: Date.now })
    completeAt!: Date;

    @Prop()
    totalQuestion!: number;

    @Prop()
    rightAnswer!: number;
}
export const ActivityHistorySchema =
    SchemaFactory.createForClass(ActivityHistory);
ActivityHistorySchema.index({ accountId: 1, completeAt: -1 });
