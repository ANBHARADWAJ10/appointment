const Admin = require("../models/admin");

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    await Admin.findByIdAndUpdate(adminId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    res.status(200).json({ message: "Admin will be removed after 7 days" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7*24*60* 60 * 1000); 

    const admins = await Admin.find({
      $or: [
        { isDeleted: false },
        {
          isDeleted: true,
          updatedAt: { $gte: oneWeekAgo }
        }
      ]
    });

    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { deleteAdmin, getAdmin };
