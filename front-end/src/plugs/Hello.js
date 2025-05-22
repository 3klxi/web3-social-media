import { useEffect, useState } from 'react';
import './Hello.css'; // 自定义样式

function Hello() {
  const [data, setData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {

    // 获取数据库服务器时间
    // fetch('http://localhost:3001/api/time')
    //   .then((res) => res.json())
    //   .then((result) => {
    //     setData(result);
    //   })
    //   .catch((err) => {
    //     console.error('❌ 请求失败：', err);
    //   });

    // 获取当前用户信息
    fetch('http://localhost:3001/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((user) => {
        setUserInfo(user);
      })
      .catch((err) => {
        console.error('❌ 获取用户信息失败:', err);
      });
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.reload();
    } catch (err) {
      console.error('登出失败', err);
    }
  };

  return (
    <div className="hello-container">
      <h1>Hello PostgreSQL 👋</h1>

      {data ? (
        <p>✅ 数据库连接成功！服务器时间：{data.server_time.now}</p>
      ) : (
        <p>正在连接数据库...</p>
      )}

      {userInfo ? (
        <div className="user-info">
          <h2>🧑 当前用户信息</h2>
          <p><strong>地址:</strong> {userInfo.address}</p>
          <p><strong>Profile ID:</strong> {userInfo.profile_id}</p>
          <p><strong>注册时间:</strong> {new Date(userInfo.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <p>⏳ 正在加载用户信息...</p>
      )}

      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}

export default Hello;
