import { useState } from "react";
import axios from "axios";

const useCollectTweetAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleCollect = async (tweetId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://127.0.0.1:3001/api/tweet/toggle_collect", {
        tweetId,
        userId
      });

      return res.data; // { success: true, collected: true/false }
    } catch (err) {
      
      if (err.response?.status === 409) {
        return { alreadyLiked: true };
    }

      console.error("❌ 收藏失败:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleCollect, loading, error };
};

export default useCollectTweetAction;
