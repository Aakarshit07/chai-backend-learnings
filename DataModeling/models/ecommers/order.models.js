import mongoose from 'mongoose';

//Mini Model
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    orderItems: {
      // to ab yha per orderitems ko kaise store kre?
      // array dekr but problem ye hai ki har ek item kaise store hoga kya structure hoga ?
      // to uske liye ham products main bhi chance nhi kr sakte hai.
      // is liye ham mini modals banate hai. OrderItem
      type: [orderItemSchema],

      //Aise bhi kr sakte hai:
      // orderItems:{
      //   type: [
      //     {
      // productId: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'Product',
      // },
      // quantity: {
      //   type: Number,
      //   required: true,
      // },
      //     }
      //   ]
      // }
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CANCELLED', 'DELIVERED'],
      default: 'PENDING',
      // is case main hame ye sure krna hai ki agar order pending hai to uski spelling vegra sab same hi honi chaiye.
      // TO is liye ham enum ka use krte hai
      // enum => means choices.
      // to jab bhi ye order create hoga to ye apne aap value choose krlega enum main se
      // initially default value rhe gi jab order create hoga. to PENDING rhegi state.
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
