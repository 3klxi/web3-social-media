// src/hooks/useGetTweetCollect.js
import { useEffect, useState } from 'react';

const useGetTweetCollect = (tweetId) => {
  const [collectCount, setCollectCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tweetId) return;

    const fetchCollectCount = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/tweet/get_tweet_collect_count/${tweetId}`);
        const data = await res.json();
        setCollectCount(Number(data.collect_count)); // 👈 假设后端返回字段名是 collect_count
      } catch (err) {
        console.error("❌ 获取收藏数失败:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectCount();
  }, [tweetId]);

  return { collectCount, loading, error };
};

export default useGetTweetCollect;
