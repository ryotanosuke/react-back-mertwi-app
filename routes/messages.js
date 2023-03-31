const router = require("express").Router();
const Message = require("../models/Messages");
const User = require("../models/User");

//トークルーム作成（ No.1 ）
router.post("/", async (req, res) => {
  try {
    const newMessage = new Message({
      contents: [
        {
          userId: "",
          desc: "undefind",
          img: "",
          time: "",
        },
      ],
    });
    const messageRoom = await newMessage.save();

    const talkerUser = await User.findById(req.body.talkercUser);
    const talkedUser = await User.findById(req.body.talkedUser);

    await talkerUser.updateOne({
      $push: {
        talkers: {
          messageId: messageRoom._id,
          userId: talkedUser._id,
        },
      },
    });

    await talkedUser.updateOne({
      $push: {
        talkers: {
          messageId: messageRoom._id,
          userId: talkerUser._id,
        },
      },
    });

    return res.status(200).json(messageRoom);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//メッセージ取得（ No.2 ）
router.get("/get/:messageId", async (req, res) => {
  try {
    const massegeRoom = await Message.findById(req.params.messageId);

    return res.status(200).json(massegeRoom);
  } catch (err) {
    // エラーの場合の処理
    return res.status(500).json(err);
  }
});

//メッセージ更新（ No.3 ）
router.put("/addition/:messageId", async (req, res) => {
  try {
    const messageRoom = await Message.findById(req.params.messageId);
    await messageRoom.updateOne({
      // ここを変更する
      $push: {
        contents: {
          userId: req.body.userId,
          desc: req.body.desc,
          time: req.body.time,
        },
      },
    });

    return res.status(200).json(messageRoom);
  } catch (err) {
    // エラーの場合の処理
    return res.status(500).json(err);
  }
});

//トークルーム削除（ No.4 ）
router.delete("/delete/:messageId", async (req, res) => {
  try {
    const messageRoom = await Message.findById(req.params.messageId);

    const talkerUser = await User.findById(req.body.talkerUserId);
    const talkedUser = await User.findById(req.body.talkedUserId);

    await talkerUser.updateOne({
      $pull: {
        talkers: {
          messageId: messageRoom._id,
          userId: talkedUser._id,
        },
      },
    });

    await talkedUser.updateOne({
      $pull: {
        talkers: {
          messageId: messageRoom._id,
          userId: talkerUser._id,
        },
      },
    });

    await messageRoom.deleteOne();

    return res.status(200).json();
  } catch (err) {
    // エラーの場合の処理
    return res.status(500).json(err);
  }
});

//メッセージ相手取得（ No.5 ）
router.get("/getTalkers/:userId", async (req, res) => {
  try {
    const loginUser = await User.findById(req.params.userId);

    const talkingUser = await Promise.all(
      loginUser.talkers.map((talker) => {
        return User.findById(talker.userId);
      })
    );

    return res.status(200).json(talkingUser);
  } catch (err) {
    // エラーの場合の処理
    return res.status(500).json(err);
  }
});

module.exports = router;
