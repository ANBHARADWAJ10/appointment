const Doctor = require("../models/doctor");

async function removeDeletedDoctors() {
  
  const remove = new Date(Date.now() - 1* 60 * 1000);

  try {
    const result = await Doctor.deleteMany({
      isDeleted: true,
      status:"deleted",
      updatedAt: { $lt: remove }
    });

    console.log(`Deleted ${result.deletedCount} doctors`);
  } catch (err) {
    console.error("Error in deleting doctors:", err);
  }
}

module.exports = removeDeletedDoctors;
