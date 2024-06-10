import mongoose from 'mongoose';

const hospitalTimeScema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  hours: {
    type: String,
    required: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experienceInYears: {
      type: Number,
      default: 0,
    },
    worksInHospitals: [
      hospitalTimeScema,
      // now problem aayegi ki kis hospital main kiten time tak beth ta hai docrot.
      // Is case main ek new mini model banaege and ye wala object bhi uske ander iclude krdege.
    ],
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
