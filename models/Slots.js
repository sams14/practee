const { Schema, model } = require("mongoose");

const slotSchema = new Schema(
    {
      T1: {
        type: [Object]
      },
      T2: {
        type: [Object]
      },
      T3: {
        type: [Object]
      },
      T8: {
        type: [Object]
      },
      email: {
        type: String,
        required: true
      },
      zoomID: {
        type: String,
        required: true
      },
      date: {
        type: [String],
        required: true
      }
    }
  );

  module.exports = model("mentorSlot", slotSchema);