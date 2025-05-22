import { useState } from 'react';
import axios from 'axios';

const useFollowUser = (followerId, followeeId, { onSuccess, onError } = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);

  const follow = async () => {
    if (!followerId || !followeeId) {
      setError('用户信息缺失');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:3001/api/follow/go_follow', {
        follower_id: followerId,
        followee_id: followeeId,
      });

      console.log('✅ 关注成功:', res.data);
      setFollowed(true);
      onSuccess?.(); // 如果外部传了回调，就执行
    } catch (err) {
      console.error('❌ 关注失败:', err);
      setError(err?.response?.data?.error || '关注失败');

      if (err?.response?.status === 409) {
        setFollowed(true); // 已经关注也可以设置为 true
      }

      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { follow, followed, loading, error };
};

export default useFollowUser;
