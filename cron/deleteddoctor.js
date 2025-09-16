const Doctor = require("../models/doctor");

async function removeDeletedDoctors() {
  
  const removeBefore = new Date(Date.now() - 7*24* 60 * 60 * 1000);

  try {
    const result = await Doctor.deleteMany({
      isDeleted: true,
      status:"deleted",
      updatedAt: { $lt: removeBefore }
    });

    console.log(`cron deleted ${result.deletedCount} doctors`);
  } catch (err) {
    console.error("cron Error deleting doctors:", err);
  }
}

module.exports = removeDeletedDoctors;
