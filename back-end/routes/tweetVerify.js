const express = require('express');
const router = express.Router();
const pool = require('../Auth/db');
const axios = require('axios');

// 比对数据库和链上的 tweet 内容是否一致
router.get('/verify/:id', async (req, res) => {
  const tweetId = req.params.id;

  try {
    // 1. 查询数据库中的 tweet
    const dbResult = await pool.query('SELECT id, content, created_at FROM tweet WHERE id = $1', [tweetId]);
    if (dbResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: '数据库中未找到 tweet' });
    }

    const dbTweet = dbResult.rows[0];

    // 2. 请求链上 tweet 数据
    const chainRes = await getTweets(id);
    const chainTweet = chainRes.data;

    // 3. 对比
    const isEqual = (
      dbTweet.content === chainTweet.content &&
      new Date(dbTweet.created_at).toISOString() === new Date(chainTweet.created_at).toISOString()
    );

    return res.json({
      success: true,
      match: isEqual,
      database: dbTweet,
      blockchain: chainTweet
    });

  } catch (err) {
    console.error('❌ 验证 tweet 数据出错:', err.message);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

module.exports = router;
