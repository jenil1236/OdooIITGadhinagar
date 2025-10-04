// controllers/user.js
import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("managerId");    // optional: populate manager info

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/user.js
import User from "../models/user.js";

// PUT /api/users/approval-settings
export const updateApprovalSettings = async (req, res) => {
  const {
    userId, // now comes from body
    isManagerApprover,
    isSequentialApproval,
    minimumApprovalPercentage,
    managerId,
    approvalFlow // array of { approverId, isRequired }
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (typeof isManagerApprover === "boolean") user.isManagerApprover = isManagerApprover;
    if (typeof isSequentialApproval === "boolean") user.isSequentialApproval = isSequentialApproval;
    if (typeof minimumApprovalPercentage === "number") {
      if (minimumApprovalPercentage < 0 || minimumApprovalPercentage > 100) {
        return res.status(400).json({ error: "minimumApprovalPercentage must be 0-100" });
      }
      user.minimumApprovalPercentage = minimumApprovalPercentage;
    }
    if (managerId) user.managerId = managerId;

    if (Array.isArray(approvalFlow)) {
      // Expecting: [{ approverId, isRequired }]
      user.approvalFlow = approvalFlow.map(a => ({
        approverId: a.approverId,
        isRequired: !!a.isRequired,
        status: "PENDING"
      }));
    }

    await user.save();
    res.status(200).json({ message: "Approval settings updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
