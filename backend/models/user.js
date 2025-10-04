import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  role: {
    type: String,
    required: true
  },
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' ,
    default: null
  },
  country: {
    type: String,
    required: true
  },
  approvalFlow: [{
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'] 
    },
    isRequired: { type: Boolean, default: false }
  }],
  isManagerApprover: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
export default mongoose.model('User', userSchema);
