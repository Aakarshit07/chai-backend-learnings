import mongoose, { mongo } from 'mongoose';

const subtodoSchema = new mongoose(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const subtodos = mongoose.model('subTodo', subtodoSchema);
