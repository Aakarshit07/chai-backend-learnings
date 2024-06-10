import mongoose from 'mongoose';

const userScherma = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwor: {
      type: String,
      required: [true, 'Password is required'], // can also give array to store.
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userScherma);

// Avoid Practice: For Better Modeling
// {
//   username: String,
//   email: String,
//   isActive: Boolean,
// }
