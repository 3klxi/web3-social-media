import { useState, useEffect } from "react";


const useProfileTweets = (profileId) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    if (!profileId){
      console.warn("⚠ 未提供 profileId, 无法加载推文");
      return;
    }

    setTweets([]);  // 清空旧推文
    
    const fetchTweets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/tweet/profile/${profileId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("获取失败");

        const data = await res.json();
        setTweets(data);
      } catch (err) {
        setError(err);
        console.error("加载推文失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [profileId]);

  return { tweets, loading, error };
};

export default useProfileTweets;
