const { Schema, model } = require("mongoose");

const vimeoSchema = new Schema(
  {
    student_email: {
      type: String,
      required: true
    },
    student_name: {
      type: String,
      required: true
    },
    privacy: {
      type: String,
      required: true
    },
    folder_id: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = model("vimeoFolder", vimeoSchema);
