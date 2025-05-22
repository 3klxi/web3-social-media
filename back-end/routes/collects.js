const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../Auth/db'); // PostgreSQL 连接池

// 1 获取推文的收藏数量
router.get('/get_tweet_collect_count/:tweetId', async (req, res) => {
    const { tweetId } = req.params;
    try {
      const result = await db.query(`
        SELECT COUNT(*) AS collect_count
        FROM collects
        WHERE tweet_id = $1
      `, [tweetId]);
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("获取收藏数量失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
  });

// 2 判断用户是否收藏了某条推文
router.get('/get_user_if_collected/:tweetId/:userId', async (req, res) => {
    const { tweetId, userId } = req.params;
    try {
      const result = await db.query(`
        SELECT 1
        FROM collects
        WHERE tweet_id = $1 AND user_id = $2
      `, [tweetId, userId]);
  
      res.json({ collected: result.rowCount > 0 });
    } catch (err) {
      console.error("判断是否收藏失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
  });

// 3 点赞一条推文
router.post('/toggle_collect', async (req, res) => {
  const { tweetId, userId } = req.body;
  
  if (!tweetId || !userId) {
    return res.status(400).json({ error: "tweetId 或 userId 缺失" });
  }

  try {
    const result = await db.query(`
      INSERT INTO collects (tweet_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
    `, [tweetId, userId]);

    if (result.rowCount === 0) {
      return res.status(409).json({ message: "用户已经收藏过了" });
    }

    res.json({ success: true, like: result.rows[0] });
  } catch (err) {
    console.error("收藏失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});

  


// // POST /api/tweet/toggle_collect
// router.post('/toggle_collect', async (req, res) => {
//   const { tweetId, userId } = req.body;

//   if (!tweetId || !userId) {
//     return res.status(400).json({ success: false, message: '缺少参数' });
//   }

//   try {
//     const check = await db.query(`
//       SELECT 1 FROM collects WHERE tweet_id = $1 AND user_id = $2
//     `, [tweetId, userId]);

//     if (check.rowCount > 0) {
//       // 已收藏 => 取消
//       await db.query(`DELETE FROM collects WHERE tweet_id = $1 AND user_id = $2`, [tweetId, userId]);
//       return res.json({ success: true, collected: false });
//     } else {
//       // 未收藏 => 收藏
//       await db.query(`INSERT INTO collects (tweet_id, user_id) VALUES ($1, $2)`, [tweetId, userId]);
//       return res.json({ success: true, collected: true });
//     }
//   } catch (err) {
//     console.error("❌ 收藏操作失败:", err);
//     res.status(500).json({ success: false, message: '服务器错误' });
//   }
// });

module.exports = router;
