import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    convertedAmount: { type: Number, required: true },
    currentApproverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalFlow: [{
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED']
        },
        isRequired: { type: Boolean, default: false }
    }],
    isManagerApprover: { type: Boolean },
    isSequentialApproval: { type: Boolean },
    minimumApprovalPercentage: { type: Number, min: 0, max: 100 },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'History' }]
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
