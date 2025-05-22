
const express = require('express');
const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');
const session = require('express-session');
const cors = require('cors');
const bodyParser =  require('body-parser');
const {SiweMessage} = require('siwe');

const pool = require('./Auth/db');

//const usersRoutes = require('./Auth/users');
const app = express();

// 中间件配置
app.use(express.json());

// 会话配置 
app.use(session({
  secret: process.env.SESSION_PRIVATE_KEY, 
  resave: false,
  saveUninitialized: true,
  cookie: { 
    // secure: process.env.NODE_ENV === 'production', // 生产环境中使用HTTPS
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));


// 跨域请求
app.use(cors({
  origin: 'http://localhost:3000', // 前端URL
  //origin: '*',
  
  origin: (origin, callback) => {
    callback(null, origin); // 动态允许任何 origin
  },
  credentials: true
}));

// 路由配置
app.use('/api/auth', require('./Auth/users'));     //   /api/auth/login、me、update_profile_data
app.use('/api/tweet', require('./routes/tweet'));
app.use('/api/follow', require('./follow/following'));
app.use('/api/user', require('./routes/profile'));
app.use('/api/web3/nft', require('./web3/getNFTs'));
app.use('/api/upload/', require('./routes/upload'));
app.use('/api/tweet/', require('./routes/likes'));
app.use('/api/tweet/', require('./routes/collects'));

// 存储用户nonce的临时对象 (在生产环境中应使用Redis或数据库)
const userNonces = {};


// 获取当前时间
app.get('/api/time', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'PostgreSQL connected!', server_time: result.rows[0] ,unknow:"请求hello?"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 仅仅为了测试数据库获取用户信息，实际生产时候，要删除。
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // 返回用户数据
  } catch (err) {
    console.error('❌ 查询用户失败', err);
    res.status(500).json({ error: '数据库查询失败' });
  }
});


// 返回随机数
app.get('/api/auth/nonce', (req, res) => {
  console.log("🔥 收到 nonce 请求, address:", req.query.address);
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: '需要提供钱包地址' });
  }

  // 创建随机nonce
  const nonce = crypto.randomBytes(16).toString('hex');
  userNonces[address.toLowerCase()] = nonce;
  console.log("地址:",address," 获取了随机数: ",nonce);

  // 只返回 nonce，让前端自行构建标准化 SIWE 消息
  res.json({ nonce });
});


// 验证
app.post('/api/auth/verify', async (req, res) => {
  const { message, signature } = req.body;

  if (!message || !signature) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });

    if (result.success) {
      req.session.user = {
        address: result.data.address.toLowerCase(),
        authenticated: true,
        loginTime: new Date()
      };
      return res.json({
        success: true,
        message: '登录成功',
        user: {
          address: result.data.address.toLowerCase()
        }
      });
    } else {
      return res.status(401).json({ success: false, message: '签名无效' });
    }
  } catch (err) {
    console.error('验证出错:', err);
    return res.status(500).json({ success: false, message: '验证失败' });
  }
});


// 3. 获取当前会话信息
app.get('/api/auth/session', (req, res) => {
  console.log("当前会话:", req.session);

  if (req.session && req.session.user) {
    return res.json({
      authenticated: true,
      address: req.session.user.address
    });
  } else {
    return res.json({
      authenticated: false
    });
  }
});


// 4. 登出接口
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '登出失败' });
    }
    
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: '登出成功' });
  });
});



// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});