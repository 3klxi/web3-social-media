import { useState,useEffect } from "react";
import axios from "axios";



const useLikeTweetAction = () =>{
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const likeTweet = async(tweetId,userId) =>{
        setLoading(true);
        setError(null);

        try{
            const res = await axios.post('http://127.0.0.1:3001/api/tweet/like_tweet_action',{tweetId,userId});
            return res.data;
        }catch(err){
            if (err.response?.status === 409) {
                // 用户已经点过赞，不抛错
                return { alreadyLiked: true };
            }

            console.log("❌ 点赞失败: ",err);
            setError(err);
            throw err;
        }finally{
            setLoading(false);
        }
    };

    return {likeTweet,loading,error};
}



export default useLikeTweetAction;