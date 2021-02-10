const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = new Schema({
    username: String,
    description: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: "Post"
    }]
  });

module.exports = mongoose.model("Post",Post);