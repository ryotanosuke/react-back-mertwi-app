const router = require("express").Router();
const Goods = require("../models/Goods");
const User = require("../models/User");

// 出品情報を作成（ No.1 ）
router.post("/", async (req, res) => {
  const newGoods = await new Goods(req.body);
  try {
    // インスタンスのセーブ
    const saveGoods = await newGoods.save();

    // 正常な場合のリターン
    return res.status(200).json(saveGoods);
  } catch (err) {
    //エラーの場合の処理
    return res.status(500).json(err);
  }
});

// 出品者を取得（ No.2 ）
router.get("/seller/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  try {
    const exhibits = await Goods.find({ sellerId: user._id });
    return res.status(200).json(exhibits);
  } catch (err) {
    res.status(500).json("正常にデータがとれません");
  }
});

// 買主を取得（ No.3 ）
router.get("/buyer/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  try {
    const exhibits = await Goods.find({ buyerId: user._id });
    return res.status(200).json(exhibits);
  } catch (err) {
    res.status(500).json("正常にデータがとれません");
  }
});

// 商品を購入（ No.4 ）
router.put("/buy/:goodsId", async (req, res) => {
  const goods = await Goods.findById(req.params.goodsId);
  try {
    await goods.updateOne({ $set: { buyerId: req.body._id } });
    await goods.updateOne({ $set: { buyerName: req.body.userName } });
    await goods.updateOne({ $set: { isBuyed: true } });
    return res.status(200).json();
  } catch (err) {
    res.status(500).json("正常にデータがとれません");
  }
});

// 購入手続き完了（ No.5 ）
router.put("/completion/:goodsId", async (req, res) => {
  const goods = await Goods.findById(req.params.goodsId);
  try {
    await goods.updateOne({ $set: { isCompletion: true } });

    return res.status(200).json();
  } catch (err) {
    res.status(500).json("正常にデータがとれません");
  }
});

// ルーターのエクスポート
module.exports = router;
