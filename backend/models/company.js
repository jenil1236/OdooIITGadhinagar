import mongoose from 'mongoose';
const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  baseCurrency: { type: String, required: true, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Company', companySchema);
