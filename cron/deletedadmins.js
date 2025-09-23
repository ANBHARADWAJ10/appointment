const Admin = require('../models/admin'); 

async function removeDeletedAdminsFromDb() {
  
  const remove = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const result = await Admin.deleteMany({
      isDeleted: true,
      status: "deleted",
      updatedAt: { $lt: remove }
    });

    console.log(`Deleted ${result.deletedCount} admins`);
  } catch (err) {
    console.error("cron Error deleting admins:", err);
  }
}

module.exports = removeDeletedAdminsFromDb;