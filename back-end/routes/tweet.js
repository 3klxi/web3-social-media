// routes/tweet.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../Auth/db'); // PostgreSQL 连接池


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // 上传目录
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// /api/tweet/
// 上传图像，并存储这个帖子的内容到数据库中
router.post('/', upload.single('image'), async (req, res) => {
  const { tweet, image, txHash} = req.body;
  const user = req.session.user;

  if (!user || !tweet) {
    return res.status(400).json({ error: "用户未登录或内容为空" });
  }

  //const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const imagePath = image;
  try {
    // 查找该用户在 users 表中的 id（主键）
    const userRes = await db.query(
      'SELECT id FROM users WHERE address = $1',
      [user.address]
    );

    const user_id = userRes.rows[0]?.id;
    if (!user_id) {
      return res.status(404).json({ error: '用户未注册或不存在' });
    }
    console.log('😁 有人在进行push操作!');
    const result = await db.query(`
      INSERT INTO tweets (tweet_text, image_url, user_id, tx_hash, created_at )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *`,
      [tweet, imagePath, user_id, txHash]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("💥 发推失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 个人帖子 /api/tweet/my
router.get('/my', async (req, res) => {
  const user = req.session.user;

  if (!user || !user.address) {
    return res.status(401).json({ error: '未登录或 session 失效' });
  }

  try {
    // 查找当前用户 id
    const userRes = await db.query(
      'SELECT id FROM users WHERE address = $1',
      [user.address]
    );

    const userId = userRes.rows[0]?.id;
    if (!userId) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = await db.query(`
      SELECT tweets.*, users.profile_id, users.username, users.pfp, users.address
      FROM tweets
      JOIN users ON tweets.user_id = users.id
      WHERE tweets.user_id = $1
      ORDER BY tweets.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 获取当前用户 tweet 失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 根据 profile_id 获取该用户的推文 /api/tweet/profile/:profile_id
router.get('/profile/:profileId', async (req, res) => {

  // 检查session，去掉这个检查，任何用户都能查询数据
  const user = req.session.user;

  if(!user || !user.address){
    console.log("❌ 检测到未授权的用户进行推文的检索!");
    return res.status(401).json({ error: '未登录或 session 失效' });
  }

  const { profileId } = req.params;
  console.log('👌 This profileId:',profileId, "进行了一次查询尝试!");

  try {
    // 先查找用户 id
    const userRes = await db.query(
      'SELECT id FROM users WHERE profile_id = $1',
      [profileId]
    );

    const userId = userRes.rows[0]?.id;
    if (!userId) {
      return res.status(404).json({ error: '该用户不存在' });
    }

    // 查找该用户的所有推文
    const tweetRes = await db.query(`
      SELECT tweets.*, users.profile_id, users.id as uid, users.username, users.pfp, users.address
      FROM tweets
      JOIN users ON tweets.user_id = users.id
      WHERE tweets.user_id = $1
      ORDER BY tweets.created_at DESC
    `, [userId]);

    res.json(tweetRes.rows);
  } catch (err) {
    console.error("❌ 获取用户推文失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// api/tweet/get_all_tweets
// routes/tweet.js 
router.get('/get_all_tweets', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tweets.*, users.profile_id, users.id as uid, users.username, users.pfp, users.address
      FROM tweets 
      JOIN users ON tweets.user_id = users.id 
      ORDER BY tweets.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("加载 tweet 失败:", err);
    res.status(500).json({ error: "服务器错误" });
  }
});





module.exports = router;
