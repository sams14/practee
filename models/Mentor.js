const { Schema, model } = require("mongoose");

const mentorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = model("mentor", mentorSchema);
