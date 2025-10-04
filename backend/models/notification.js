const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['REQUEST_PENDING', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED'],
    required: true 
  },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
