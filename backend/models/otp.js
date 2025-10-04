import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes expiry
  }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
