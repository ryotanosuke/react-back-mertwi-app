const router = require("express").Router();
const User = require("../models/User");
const { route } = require("./users");

//ユーザー登録（ No.1 ）
router.post("/register", async (req, res) => {
  // ① ユーザースキムをインスタンス化する
  // ② currentValueのリクエスト情報(オブジェクト)をスキームに代入する
  try {
    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      point: 0,
      stockPoint: 0,
    });

    // インスタンスのセーブ
    const user = await newUser.save();

    // 正常な場合のリターン
    return res.status(200).json(user);
  } catch (err) {
    //エラーの場合の処理
    return res.status(500).json(err);
  }
});

//ログイン（ No.2 ）
router.post("/login", async (req, res) => {
  try {
    // 一致するスキーマーを獲得
    const user = await User.findOne({ email: req.body.email });

    // 一致するアドがない場合の処理
    if (!user) return res.status(404).send("ユーザーが見つかりません");

    // 登録したスキーマーパスとログインのパスを確認
    const vailedPassword = req.body.password === user.password;

    // パスが合わない場合の処理
    if (!vailedPassword) return res.status(400).json("パスワードが違います。");

    // 正常な場合にはuserのオブジェクトを返す
    return res.status(200).json(user);
  } catch (err) {
    // エラーの場合の処理
    return res.status(500).json(err);
  }
});

// ルーターのエクスポート
module.exports = router;
