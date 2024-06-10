import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //The one who is subscribing
        ref:"User",
    },
    channel: {
        type: Schema.Types.ObjectId, //One to whom, "subscriber" is subscribing
        ref:"User",
    }
}, {timestamps: true}
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);