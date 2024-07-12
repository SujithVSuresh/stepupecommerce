const mongoose = require("mongoose");

const categoryOfferSchema = mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Category" },
  percentage: { type: Number, required: true },
  expiryDate: {
    type: Date,
    index: { expires: 0 },
  },
});

module.exports = mongoose.model("Categoryoffer", categoryOfferSchema);
