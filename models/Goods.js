const mongoose = require("mongoose");
const GoodsSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
    },
    sellerName: {
      type: String,
    },
    buyerId: {
      type: String,
    },
    buyerName: {
      type: String,
    },
    status: {
      type: String,
    },
    productName: {
      type: String,
      max: 20,
    },
    description: {
      type: String,
    },
    deliveryCharge: {
      type: String,
    },
    shippingMethod: {
      type: String,
    },
    area: {
      type: String,
    },
    shippingDate: {
      type: String,
    },
    sellingPrice: {
      type: String,
    },
    img: {
      type: String,
    },
    isExhibit: {
      type: Boolean,
    },
    isBuyed: {
      type: Boolean,
    },
    isCompletion: {
      type: Boolean,
    },
  },
  { timestamps: true }
);
//インポートするときGoodsの名前で取り出す
module.exports = mongoose.model("Goods", GoodsSchema);
