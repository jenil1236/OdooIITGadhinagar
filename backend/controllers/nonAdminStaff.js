import Expense from '../models/expense.js';

const getData = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const expenses = await Expense.find({ approvalFlow: { $elemMatch: { approverId: user._id } } });
        // const expenses = await Expense.find({ approvalFlow: { $elemMatch: { approverId: user._id } }, status: 'PENDING' });
        const manager = user.managerId;
        const refined_expenses = expenses.filter(e =>
            (e.isSequentialApproval === false) ||
            ((e.isSequentialApproval === true) && (e.currentApproverId.toString() === user._id.toString())) &&
            (e.isManagerApprover === false || ((e.isManagerApprover === true) &&
                (() => {
                    const mgrApproval = e.approvalFlow.find(flow =>
                        flow.approverId.toString() === manager.toString()
                    );
                    return mgrApproval &&
                        ['APPROVED', 'REJECTED'].includes(mgrApproval.status);
                })()
            )));
        res.status(200).json({ expenses: refined_expenses });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const approver = req.user._id;
        const updatedData = req.body.status;
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        expense.approvalFlow = expense.approvalFlow.map(approverObj => {
            if (approverObj.approverId.toString() === approver.toString()) {
                return { ...approverObj, status: updatedData };
            }
            else {
                return approverObj;
            }
        });
        const history = new History({
            expense: expense._id,
            approver: approver,
            status: updatedData
        })
        await history.save();
        expense.history.push(history._id);
        if (expense.isSequentialApproval === true) {
            var index = expense.approvalFlow.findIndex(approverObj => approverObj.approverId.toString() === approver.toString());
            if (index !== expense.approvalFlow.length - 1)
                expense.currentApproverId = expense.approvalFlow[index + 1].approverId;
            else
                expense.currentApproverId = null;
        }
        let approved = 0;
        let reqReject = 0;
        let count = 0;
        let total = expense.approvalFlow.length;
        for (const ex of expense.approvalFlow) {
            if (ex.status === 'APPROVED') {
                approved++;
                count++;
            }
            if (ex.status === 'REJECTED') {
                if (ex.isRequired === true)
                    reqReject++;
                count++;
            }
        }
        if (reqReject > 0) {
            expense.status = 'REJECTED';
            expense.currentApproverId = null;
        }
        else {
            const approvalPercentage = (approved / total) * 100;
            if (approvalPercentage >= expense.minimumApprovalPercentage) {
                expense.status = 'APPROVED';
                expense.currentApproverId = null;
            }
            else if (count === total) {
                expense.status = 'REJECTED';
                expense.currentApproverId = null;
            }
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getData, updateExpense };