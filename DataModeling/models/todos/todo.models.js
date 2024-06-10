import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema( // Always user "new keyword"
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',

      // ab yha pe ham string vegra to nhi likh sakte hai.
      // is liye hame link krna padega user ko.
      // uske liye ham "Types" use krte hai ye ek "Speical Type" hai
      // uske baad "ObjectId": special type likhte hai
      // uske baad ham "red": dete hai.
      // jo ham ne ye modal main naam diya hai

      // => mongoose.model('User', userScherma);
      // ***"User" is hi ko dete hai  ref main.***
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subTodo',
        // yha pe ye jo har ek object hoga subTodo array main usko structure krege.
        // ki har object kaise hoga.
      },
      //Array of subTodos
    ],
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);

// In database "Todo" model =>  "todos"
