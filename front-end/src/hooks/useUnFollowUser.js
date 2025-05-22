import { useState } from 'react';
import axios from 'axios';

const useUnFollowUser = (followerId, followeeId, { onSuccess, onError } = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(true); // 初始为 true 表示已关注

  const unfollow = async () => {
    if (!followerId || !followeeId) {
      setError('用户信息缺失');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:3001/api/follow/un_follow', {
        follower_id: followerId,
        followee_id: followeeId,
      });

      console.log('✅ 取消关注成功:', res.data);
      setFollowed(false);
      onSuccess?.(); // 如果传了回调，调用它
    } catch (err) {
      console.error('❌ 取消关注失败:', err);
      setError(err?.response?.data?.error || '取消关注失败');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { unfollow, followed, loading, error };
};

export default useUnFollowUser;
