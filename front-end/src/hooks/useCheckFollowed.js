import { useState, useEffect } from 'react';
import axios from 'axios';


// 检查
const  useCheckFollowed = (followerId,followeeId) => {
  const [followed, setFollowed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    
  useEffect(() => {
    if (!followerId || !followeeId) return;
    console.log('Hook 🔍 useCheckFollowed: ', followerId, '->', followeeId);

    const checkFollowStatus = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:3001/api/follow/check_followed', {
          follower_id: Number(followerId),
          followee_id: Number(followeeId),
        });
        console.log('✅ 后端返回:', res.data);
        setFollowed(res.data.followed);
        setError(null);
      } catch (err) {
        console.error('❌ 查询关注状态失败:', err);
        setError(err?.response?.data?.error || '查询失败');
        setFollowed(null);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [followerId,followeeId]);

  return { followed, loading, error };
}


export default useCheckFollowed;