import { useState, useEffect } from "react";

const useMyTweets = () => {
  const [myTweets, setMyTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/tweet/my", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("获取失败");

        const data = await res.json();
        setMyTweets(data);
      } catch (err) {
        setError(err);
        console.error("加载推文失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  return { myTweets, loading, error };
};

export default useMyTweets;
