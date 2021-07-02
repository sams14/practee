const { Schema, model } = require("mongoose");

const mentorSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    zoomID: {
      type: String,
      required: true
    },
    gender: {
        type: String,
        required: true,
        default: "Prefer Not To Say"
    },
    regionalLang: {
        type: String,
        required: true,
        default: "N/A"
    },
    workingHour: {
      type: String,
      default: "08:00-19:35",
      required: true
    },
    breakHours: {
        type: [String],
        required: true
    }
  },
  { timestamps: true }
);

module.exports = model("mentor", mentorSchema);
