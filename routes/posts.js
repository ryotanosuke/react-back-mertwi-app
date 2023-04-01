const router = require("express").Router();
const Post = require("../models/Post");
const Goods = require("../models/Goods");
const User = require("../models/User");

// 投稿を作成する （ NO.1 ）
router.post("/", async (req, res) => {
  // スキームをインスタンス化してリクエスト情報を代入
  const newPost = new Post(req.body);
  try {
    // インスタンスをセーブ
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    // newPost.save()のエラー
    return res.status(500).json(err);
  }
});

// 投稿を更新する （ NO.2）
router.put("/:id", async (req, res) => {
  try {
    // DBのオブジェクトをオブジェクトIDを元に取得
    const post = await Post.findById(req.params.id);

    // パラメーターとボディの id を比較
    if (post.userId === req.body.userId) {
      // 情報を一括更新 $setを使用 ( 一部はpushを使用 )
      await post.updateOne({
        $set: req.body,
      });
      // 正常な場合の処理
      return res.status(200).json("投稿編集に成功しました");
    } else {
      // IDが違った場合の処理
      return res.status(403).json("あなたは他の人のIDを編集できません");
    }
  } catch (err) {
    // findById のエラー
    return res.status(403).json(err);
  }
});

// 投稿を削除する （ NO.3 ）
router.delete("/:id", async (req, res) => {
  try {
    if (!req.body.isExhibit) {
      //DBのオブジェクトをオブジェクトIDを元に取得
      const post = await Post.findById(req.params.id);
      // パラメーターとボディの id を比較
      if (post.userId === req.body.userId) {
        await post.deleteOne();

        // 正常な場合の処理
        return res.status(200).json("投稿削除に成功しました");
      } else {
        // IDが違った場合の処理
        return res.status(403).json("あなたは他の人のIDを削除できません");
      }
    } else {
      // DBのオブジェクトをオブジェクトIDを元に取得
      const goods = await Goods.findById(req.params.id);
      // パラメーターとボディの id を比較（他人の投稿を削除しないため）

      if (goods.sellerId === req.body.sellerId) {
        await goods.deleteOne();
        // 正常な場合の処理
        return res.status(200).json("投稿削除に成功しました");
      } else {
        // IDが違った場合の処理
        return res.status(403).json("あなたは他の人のIDを削除できません");
      }
    }
  } catch (err) {
    // findById が起動しなかった時のエラー
    return res.status(403).json(err);
  }
});

// 特定の投稿を取得する （ NO.4 ）
router.get("/:id", async (req, res) => {
  try {
    // postオブジェクトをuserのオブジェクトIDを元に取得
    const post = await Post.findById(req.params.id);
    // 正常な場合の処理
    return res.status(200).json(post);
  } catch (err) {
    // findById が起動しなかった時のエラー
    return res.status(403).json(err);
  }
});

// 特定のフォロワーにいいねを押す （ NO.5 ）
router.put("/:id/like", async (req, res) => {
  try {
    // いいねされているPostを検索
    // DBのオブジェクトを取得
    const post = await Post.findById(req.params.id);

    // すでにいいねされているかどうか調べる
    // req.body.userId ( userのid )= currentUser
    // post._id ( 投稿のid ) = req.params.id
    if (!post.likes.includes(req.body.userId)) {
      // フォロワーにidを登録
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });

      // 正常の場合のリターン
      return res.status(200).json("投稿にいいねを押しました！");

      // 既にいいねが押されていた場合
    } else {
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("投稿にいいねを外しました！");
    }
  } catch (err) {
    // findById のエラー処理
    return res.status(500).json(err);
  }
});

// プロフィール専用のタイムライン（ NO.6 ）
router.get("/profile/:userId", async (req, res) => {
  try {
    //自分の内容を取得
    const user = await User.findById(req.params.userId);
    // _idはオブジェクトのidのこと
    const posts = await Post.find({ userId: user._id });
    // 自分の出品を取得
    const goods = await Goods.find({ sellerId: user._id });

    const concatPosts = posts.concat(...goods);

    return res.status(200).json(concatPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// タイムラインの投稿を取得 （ NO.7 ）
router.get("/timeline/:userId", async (req, res) => {
  try {
    //自分の投稿を取得
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });

    // 自分の出品を取得
    const userGoods = await Goods.find({ sellerId: currentUser._id });

    // 友達の内容を取得
    // Promis.allは非同期処理後に実行させるため
    // mapで返されるものは配列型になる
    const friendPosts = await Promise.all(
      // followingsのidを配列で回して検索
      currentUser.followings.map((friendId) => {
        // friendIdと一致するオブジェクトを返す
        return Post.find({ userId: friendId });
      })
    );

    console.log(friendPosts);

    const friendGoods = await Promise.all(
      // followingsのidを配列で回して検索
      currentUser.followings.map((friendId) => {
        // friendIdと一致するオブジェクトを返す
        return Goods.find({ sellerId: friendId });
      })
    );

    // フォローさんと自分のタイムラインをconcatで統合
    const concatPosts = userPosts.concat(...friendPosts);

    const concatGoods = userGoods.concat(...friendGoods);

    const concatContents = concatPosts.concat(...concatGoods);

    return res.status(200).json(concatContents);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
