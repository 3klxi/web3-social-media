const express = require("express")
const router  = express.Router();
const db = require("../Auth/db");

// 获取当前用户关注的人的列表 /api/follow/following
router.get('/following',async (req,res) =>{
    const user = req.session.user;

    if(!user || !user.address){
        //console.log('你要干什么！查关注?❌');
        return res.status(401).json({ error: '未登录或 session 过期' });
    }

    try{
        const currentUser = await db.query(
            'SELECT id FROM users WHERE address = $1',
            [user.address]
        );

        if(currentUser.rowCount === 0){
            return res.status(404).json({ error: '当前用户不存在' });
        }


        const currentUserId = currentUser.rows[0].id;

        // 2. 查询关注的所有用户（followee_id），并获取其基本信息
        const result = await db.query(`
            SELECT 
            u.username, 
            u.address, 
            u.pfp, 
            u.bio, 
            u.profile_id,
            f.followee_id as uuid
            FROM follows f
            JOIN users u ON f.followee_id = u.id
            WHERE f.follower_id = $1
            ORDER BY f.created_at DESC
        `, [currentUserId]);
    
        res.json(result.rows);
    }catch (err) {
        console.error('❌ 查询关注列表失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
})

// 检查是否已关注某个用户 /api/follow/check_followed
router.post('/check_followed', async (req, res) => {
    //console.log('📦 收到请求体 req.body:', req.body);
    const { follower_id, followee_id } = req.body;


    //console.log('后端接口 🔍 useCheckFollowed: ', follower_id, '->', followee_id);
    
    if (!follower_id || !followee_id) {
        //console.log('你要干什么！查是否关注？❌');
        return res.status(400).json({ error: '缺少 follower_id 或 followee_id' });
    }

    try {
        const result = await db.query(
            'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
            [follower_id, followee_id]
        );
        console.log('🗃️ 查询结果:', result.rows);

        const followed = result.rowCount > 0;
        res.json({ followed });
    } catch (err) {
        console.error('❌ 查询关注状态失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});


// api/follow/go_follow
// 关注某个用户 /api/follow/go_follow
router.post('/go_follow', async (req, res) => {
    const { follower_id, followee_id } = req.body;

    if (!follower_id || !followee_id) {
        console.log('有人试图进行进行关注操作😁');
        return res.status(400).json({ error: '缺少 follower_id 或 followee_id' });
    }

    const followerId = follower_id;
    const followeeId = followee_id;

    try {
        // 检查是否已经关注
        const checkFollow = await db.query(
            'SELECT id FROM follows WHERE follower_id = $1 AND followee_id = $2',
            [followerId, followeeId]
        );

        if (checkFollow.rowCount > 0) {
            return res.status(409).json({ error: '你已经关注了该用户' });
        }

        // 插入关注记录
        await db.query(
            'INSERT INTO follows (follower_id, followee_id, created_at) VALUES ($1, $2, NOW())',
            [followerId, followeeId]
        );

        res.json({ message: '关注成功' });
    } catch (err) {
        console.error('❌ 关注操作失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});



// 取消关注某个用户 /api/follow/un_follow
router.post('/un_follow', async (req, res) => {
    const { follower_id, followee_id } = req.body;

    if (!follower_id || !followee_id) {
        console.log('有人试图进行取消关注操作🤨');
        return res.status(400).json({ error: '缺少 follower_id 或 followee_id' });
    }

    const followerId = follower_id;
    const followeeId = followee_id;

    try {
        // 检查是否已经关注
        const checkFollow = await db.query(
            'SELECT id FROM follows WHERE follower_id = $1 AND followee_id = $2',
            [followerId, followeeId]
        );

        if (checkFollow.rowCount === 0) {
            return res.status(409).json({ error: '你尚未关注该用户' });
        }

        // 删除关注记录
        await db.query(
            'DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2',
            [followerId, followeeId]
        );

        res.json({ message: '取消关注成功' });
    } catch (err) {
        console.error('❌ 取消关注操作失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});



// 获取粉丝数量
router.get('/get_user_followers/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.query(`
        SELECT COUNT(*) AS follower_count
        FROM follows
        WHERE followee_id = $1
      `, [userId]);
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("获取粉丝数量失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
  });


module.exports  = router;