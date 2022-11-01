const { Schema, model } = require("mongoose");

const pipFormSchema = new Schema(
  {
    mentor: {
      type: String,
      required: true,
    },
    mentorMail: {
      type: String,
      required: true,
    },
    pipCreater: {
      type: String,
      required: true,
    },
    pipCreaterMail: {
      type: String,
      required: true,
    },
    pipStartDate: {
      type: String,
      required: true,
    },
    pipDuration: {
      type: String,
      required: true,
    },
    pipEndDate: {
      type: String,
      required: true,
    },
    improvmentObjectives: {
      type: String,
      required: true,
    },
    successCriteria: {
      type: String,
      required: true,
    },
    additionalSupportRequired: {
      type: String,
      required: true,
    },
    reviewSchedule: {
      type: String,
      required: true,
    },
    objectiveOutcome: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("pipform", pipFormSchema);
