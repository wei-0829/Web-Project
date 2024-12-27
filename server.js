require('dotenv').config();  // 加載 .env 文件

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");  // 用來處理文件路徑

const app = express();
app.use(cors());
app.use(express.json());

// 讓 Express 提供 public 目錄中的靜態文件
app.use(express.static("public"));

// 設置根路徑時返回 index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 其他頁面路由，這裡以 leaderboard.html 為例
app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "leaderboard.html"));
});

// 連接 MongoDB Atlas
const DB_URI = process.env.MONGODB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

// 定義排行榜的資料結構（Schema 和 Model）
const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// 設置 API 路由來處理排行榜資料

// 取得排行榜資料 (GET /api/leaderboard)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboardData = await Leaderboard.find().sort({ score: -1 }); // 根據分數降序排列
    res.json(leaderboardData);
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 更新或新增玩家分數 (POST /api/leaderboard)
app.post("/api/leaderboard", async (req, res) => {
  const { username, score } = req.body;

  // 驗證輸入的資料
  if (!username || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const existingUser = await Leaderboard.findOne({ username });

    if (existingUser) {
      // 如果用戶已經存在，更新分數
      existingUser.score = Math.max(existingUser.score, score); // 確保分數不會變小
      await existingUser.save();
      res.json({ message: "Score updated successfully!" });
    } else {
      // 如果用戶不存在，新增一個用戶
      const newUser = new Leaderboard({ username, score });
      await newUser.save();
      res.json({ message: "New user added with score!" });
    }
  } catch (error) {
    console.error("Failed to update leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
