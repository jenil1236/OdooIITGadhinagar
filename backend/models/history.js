import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    expense: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
        required: true
    },
    approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        required: true
    }
}, { timestamps: true }
);

const History = mongoose.model('History', historySchema);
export default History;