import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true } // optional
});

userSchema.plugin(passportLocalMongoose);

export default mongoose.model('User', userSchema);
