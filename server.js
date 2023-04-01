const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const authRoute = require("./routes/auth");
const goodsRoute = require("./routes/goods");
const messagesRoute = require("./routes/messages");
const uploadRoute = require("./routes/upload");
const path = require("path");
const PORT = 5000;
require("dotenv").config();

const cors = require("cors");

app.use(
  cors({
    // 他サーバーのエンドポイントを許可
    // 語尾にスラッシュいらない
    origins: [
      "https://mertwi.vercel.app",
      "https://mertwi-ryotanosuke.vercel.app",
      "https://mertwi-git-main-ryotanosuke.vercel.app",
      "mertwi-c8xhvqht6-ryotanosuke.vercel.app",
    ],
  })
);

// app.use(
//   cors({
//     // 他サーバーのエンドポイントを許可
//     // 語尾にスラッシュいらない
//     origin: "http://localhost:3000",
//   })
// );

//データベース接続
mongoose
  // 隠蔽したパスワード(mongeDB発行のURL)を代入
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DBと接続中・・・");
  })
  // エラーの場合の処理
  .catch((err) => {
    console.log(" データベースと接続できませんでしたaaaaaaaaaaaaaa");
  });

//全てをJsonにする
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/goods", goodsRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/upload", uploadRoute);

//ミドルウェア( 他のファイルを実行 )

// サーバーの起動確認用;
// app.get("/", (req, res) => {
//   res.send("サーバーが起動しました" + process.env.MONGO_URL);
// });

// サーバーの起動確認用
// app.listen(PORT, () => {
//   console.log("サーバーが起動しました");
// });

// サーバーの起動確認用
app.listen(process.env.PORT || 5000, () =>
  console.log("サーバーが起動しました" + process.env.MONGO_URL)
);
