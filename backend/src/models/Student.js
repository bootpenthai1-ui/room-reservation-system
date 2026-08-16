const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true, trim: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  major: { type: String, trim: true },
  faculty: { type: String, trim: true },
  academic_year: { type: Number },
});

module.exports = mongoose.model("Student", studentSchema);
