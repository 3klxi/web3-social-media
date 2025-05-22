// src/hooks/useGetTweetLike.js
import { useEffect, useState } from 'react';

const useGetTweetLike = (tweetId) => {
  const [likeCount, setLikeCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tweetId) return;

    const fetchLikeCount = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/tweet/get_tweet_like_count/${tweetId}`);
        const data = await res.json();
        setLikeCount(Number(data.like_count)); // 记得转数字
      } catch (err) {
        console.error("❌ 获取点赞数失败:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikeCount();
  }, [tweetId]);

  return { likeCount, loading, error };
};

export default useGetTweetLike;
