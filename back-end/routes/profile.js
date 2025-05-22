// routes/tweet.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../Auth/db'); // PostgreSQL 连接池


router.get('/profiledata/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const user = req.session.user;
    if(!user || !user.address){
        //console.log("❌ 检测到未授权的用户进行用户信息的检索!");
        return res.status(401).json({ error: '未登录或 session 失效' });
    }
  
    try {
      const result = await db.query(
        `SELECT profile_id, id as user_id, username, bio, pfp, banner, address 
         FROM users WHERE profile_id = $1`,
        [profileId]
      );
  
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: '用户未找到' });
      }
  
      res.json(user);
    } catch (err) {
      console.error('❌ 获取用户信息失败:', err);
      res.status(500).json({ error: '服务器错误' });
    }
});
  

module.exports = router;