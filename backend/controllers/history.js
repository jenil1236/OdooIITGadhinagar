import History from "../models/history";
import Expense from "../models/expense.js";

export const getHistory = async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        const historyRecords = await History.find({ expense: expenseId }).populate('approver');
        res.status(200).json(historyRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};