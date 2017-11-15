import * as mongoose from "mongoose";

const mapSchema = new mongoose.Schema({
  name: String,
  categories: [String]
}, { timestamps: true });

module.exports = mongoose.model("Map", mapSchema);