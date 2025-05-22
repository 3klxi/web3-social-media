// routes/tweet.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../Auth/db'); // PostgreSQL 连接池


// 1 获取推文的点赞数量
router.get('/get_tweet_like_count/:tweetId', async (req, res) => {
    const { tweetId } = req.params;
    try {
      const result = await db.query(`
        SELECT COUNT(*) AS like_count
        FROM likes
        WHERE tweet_id = $1
      `, [tweetId]);
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("获取点赞数量失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
});
  
  
  // 2 判断用户是否点赞过某条推文
router.get('/get_user_if_liked/:tweetId/:userId', async (req, res) => {
  const { tweetId, userId } = req.params;
  try {
    const result = await db.query(`
      SELECT 1
      FROM likes
      WHERE tweet_id = $1 AND user_id = $2
    `, [tweetId, userId]);

    res.json({ liked: result.rowCount > 0 });
  } catch (err) {
    console.error("判断用户是否点赞失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 3 点赞一条推文
router.post('/like_tweet_action', async (req, res) => {
  const { tweetId, userId } = req.body;
  
  if (!tweetId || !userId) {
    return res.status(400).json({ error: "tweetId 或 userId 缺失" });
  }

  try {
    const result = await db.query(`
      INSERT INTO likes (tweet_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [tweetId, userId]);

    if (result.rowCount === 0) {
      return res.status(409).json({ message: "用户已经点过赞" });
    }

    res.json({ success: true, like: result.rows[0] });
  } catch (err) {
    console.error("插入点赞失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

module.exports = router;
