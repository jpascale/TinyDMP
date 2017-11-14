import * as mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  ip: String,
  name: String,
  url: String,
  content: {
    category: String,
    subcategory: String,
    text: String
  },
  train: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);