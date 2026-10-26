import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';
import { User } from '../user/user.entity';
import { Exercise } from '../exercise/exercise.entity';

@Schema({ timestamps: true })
export class ExerciseProgress {
  _id!: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Exercise.name,
    required: true,
  })
  exerciseId!: Types.ObjectId;

  @Prop()
  exerciseTitle!:string;
  @Prop({ default: Date.now })
  completeAt!: Date;

  @Prop()
  score!: number;

  @Prop()
  totalQuestion!: number;

  @Prop()
  rightAnswer!: number;
}
export const ExerciseProgressSchema =
    SchemaFactory.createForClass(ExerciseProgress);
ExerciseProgressSchema.index({ userId: 1, updatedAt: -1 });
ExerciseProgressSchema.index({ userId: 1, exerciseId: 1 });
