// api/Auth/users.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');


// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log("📡 接收到 POST /login 请求");
  const address = req.body.address?.toLowerCase();
  if (!address) return res.status(400).json({ error: '缺少 address 参数' });

  try {

    
    // 1. 检查用户是否已存在
    const checkUser = await db.query('SELECT * FROM users WHERE address = $1', [address]);

    if (checkUser.rows.length > 0) {
      // 已存在，返回已有 profile_id
      return res.status(200).json({ profileID: checkUser.rows[0].profile_id });
    }

    // 2. 新用户，生成 profileID
    const profileID = uuidv4(); // 或你自定义算法

    // 3. 插入新用户
    await db.query(
      'INSERT INTO users (profile_id, address) VALUES ($1, $2)',
      [profileID, address]
    );

    return res.status(201).json({ profileID });
  } catch (err) {
    console.error('登录/存储用户信息失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});


// GET /api/auth/me获取当前用户信息
router.get('/me', async (req, res) => {
  console.log('正在获取当前用户...');

  // 从session中读取用户地址
  const address = req.session?.user?.address;
  console.log('👤 当前用户 session 地址:', address);

  // session中没有address说明没有登录或者session过期
  if (!address) {
    return res.status(401).json({ error: '未登录或 session 过期' });
  }
  
  try {
    // 数据库中 查询这个 用户 address $ 绑定参数   能够防止SQL注入
    const result = await db.query(
      //'SELECT profile_id, address, created_at, username FROM users WHERE address = $1',
      'SELECT id as user_id, profile_id,  address, username, pfp, bio FROM users WHERE address = $1',
      [address]
    );

    // 用户不存在
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 返回查询的用户信息
    const user = result.rows[0];
    return res.json(user);

  } catch (err) {
    console.error('❌ 查询用户信息失败:', err);
    return res.status(500).json({ error: '服务器错误' });
  }
});


// 更新个人用户资料
// /api/auth/update_profile
router.post('/update_profile', async (req, res) => {
  const user = req.session.user;
  const { username, bio, pfp, banner } = req.body;

  if (!user) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const result = await db.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           bio = COALESCE($2, bio),
           pfp = COALESCE($3, pfp),
           banner = COALESCE($4, banner)
       WHERE address = $5
       RETURNING *`,
      [username, bio, pfp, banner, user.address]
    );

    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("❌ 更新用户资料失败:", err);
    return res.status(500).json({ error: "服务器错误" });
  }
});

module.exports = router;