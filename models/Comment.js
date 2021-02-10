const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema({
    username: String,
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  });

module.exports = mongoose.model("Comment",Comment);