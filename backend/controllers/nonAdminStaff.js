import User from '../models/user.js';
import Expense from '../models/expense.js';

const getData = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const expenses = await Expense.find({ approvalFlow: { $elemMatch: { approverId: user._id } } });

        const refined_expenses = expenses.filter(e => {
            e.isSequentialApproval === false || (e.isSequentialApproval === true && e.currentApproverId.toString() === user._id.toString())
        })
        res.status(200).json({ expenses: refined_expenses });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Server error' });
    }   
};


