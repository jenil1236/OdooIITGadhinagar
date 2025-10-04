import Expense from '../models/expense.js';

const createExpense = async (req, res) => {
    try {
        const expenseData = req.body;       
        const newExpense = new Expense(expenseData);
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const expense = await Expense.findByIdAndUpdate(id, updatedData, { new: true });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;   
        const expense = await Expense.findByIdAndDelete(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {   
        res.status(500).json({ message: error.message });
    }
};

export { createExpense, getExpense, updateExpense, deleteExpense };