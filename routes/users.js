const router = require("express").Router();
const User = require("../models/User");

// ユーザー情報の更新（ No.1 ）
router.put("/:id", async (req, res) => {
  console.log(req.body);
  // パラーメーターのidと入力idを確認 (DBのidと比較していないので注意)
  // shinさんのミスの可能性あり
  try {
    // 一致するidをDBから検索し、リクエスト情報（$set）を上書き更新
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    //正常な場合の処理
    res.status(200).json("ユーザー情報を更新しました。");
  } catch (err) {
    //findByIdAndUpdateのエラー処理
    return res.status(500).json(err);
  }
});

// ユーザー情報の削除（ No.2 ）
router.delete("/:id", async (req, res) => {
  // パラーメーターのidと入力idを確認 (DBのidと比較していないので注意)
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      // 一致するidをDBから検索し、DBのオブジェクトを削除
      const user = await User.findByIdAndDelete(req.params.id);

      //正常な場合の処理
      res.status(200).json("ユーザー情報を削除しました。");
    } catch (err) {
      //findByIdAndDeleteのエラー処理
      return res.status(500).json(err);
    }
  } else {
    // パラメーターidと入力idが一致しない場合
    return res.status(403).json("自分の情報を削除してください。");
  }
});

// ユーザー情報の取得（ No.3 ）
router.get("/:id", async (req, res) => {
  try {
    // 一致するidをDBから検索し、DBのオブジェクトを取得
    // params.id はURLから渡ってくる情報
    const user = await User.findById(req.params.id);

    // 他人に見られないようにpassと更新情報をを除外する
    const { password, updatedAt, ...other } = user._doc;

    //正常な場合の処理
    return res.status(200).json(other);
  } catch (err) {
    //findByIdのエラー処理

    return res.status(500).json(err);
  }
});

// クエリでユーザー情報を取得（ No.4 ）
router.get("/", async (req, res) => {
  // ~/~/?userID=honda の = 以降の部分
  const userId = req.query.userId;
  // ~/~/?username=honda の = 以降の部分
  const username = req.query.username;
  try {
    // userIdがなければusernameで検索
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    // 他人に見られないようにpassと更新情報をを除外する
    const { password, updatedAt, ...other } = user._doc;

    //正常な場合の処理
    return res.status(200).json(other);
  } catch (err) {
    //findByIdのエラー処理

    return res.status(500).json(err);
  }
});

//ユーザーのフォロー（ No.5 ）
router.put("/:id/follow", async (req, res) => {
  // フォローが自分自身でない場合にフォローできる
  // bodyがフォローする側
  if (req.body.user !== req.params.id) {
    try {
      // これからフォローするためユーザーのIDを検索
      // DBのオブジェクトを取得
      const user = await User.findById(req.params.id);

      // ログインユーザー取得
      const currentUser = await User.findById(req.body._id);

      // followersにidが登録されているかどうか調べる
      if (!user.followers.includes(req.body._id)) {
        // フォロワーにidを登録
        await user.updateOne({
          $push: {
            followers: req.body._id,
          },
        });

        // フォローにIDを登録
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });

        // 正常の場合のリターン
        return res.status(200).json("フォローに成功しました");
      } else {
        return res.status(403).json("既にこのユーザーをフォローしています");
      }
    } catch (err) {
      // findById のエラー処理
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローしてください。");
  }
});

//ユーザーのフォロー解除（ No.6 ）
router.put("/:id/unfollow", async (req, res) => {
  if (req.body._id !== req.params.id) {
    try {
      // ログインしていないユーザー
      const user = await User.findById(req.params.id);

      // ログインユーザー
      const currentUser = await User.findById(req.body._id);

      // followersにidが登録されているかどうか調べる
      if (user.followers.includes(req.body._id)) {
        // フォロワーにidを登録
        await user.updateOne({
          $pull: {
            followers: req.body._id,
          },
        });

        // フォローにIDを削除
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });

        // 正常の場合のリターン
        return res.status(200).json("フォローを解除しました！");
      } else {
        return res.status(403).json("このユーザーをフォロー解除できません！");
      }
    } catch (err) {
      // findById のエラー処理
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除できません！");
  }
});

// 自分以外の全ユーザー情報の取得（ No.7 ）
router.get("/all/:userId", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.userId } });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// フォロワ-の取得（ No.8 ）
router.get("/followings/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const followingUser = await Promise.all(
      user.followings.map((followingId) => {
        return User.findById(followingId);
      })
    );

    return res.status(200).json(followingUser);
  } catch {
    return res.status(500).json("通信に失敗しました。");
  }
});

// フォロワ-の取得（ No.9 ）
router.get("/followers/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const followersUser = await Promise.all(
      user.followers.map((followersId) => {
        return User.findById(followersId);
      })
    );
    return res.status(200).json(followersUser);
  } catch {
    return res.status(500).json("通信に失敗しました。");
  }
});

module.exports = router;
