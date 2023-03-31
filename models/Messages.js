const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema(
  {
    contents: [Object],
  },
  { timestamps: true }
);
//インポートするときPostの名前で取り出す
module.exports = mongoose.model("Message", MessagesSchema);
