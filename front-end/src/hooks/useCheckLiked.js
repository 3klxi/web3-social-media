import { useState, useEffect } from 'react';
import axios from 'axios';


// 检查
const  useCheckLiked = (tweetId, userId) => {
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] =  useState(true);
    const [error, setError] =  useState(null);


    useEffect(()=>{
        if(!tweetId || !userId){
            return;
        }

        const fetchLikedStatus = async() =>{
            try{
                const res = await fetch(`http://127.0.0.1:3001/api/tweet/get_user_if_liked/${tweetId}/${userId}`);
                const data = await res.json();
                setIsLiked(data.liked);
            }catch(err){
                console.log("❌ 获取是否点赞失败: ",err);
                setError(err);
            }finally{
                setLoading(false);
            }
        };

        fetchLikedStatus();
    },[tweetId,userId]);


    return {isLiked : loading ? null : isLiked,
            loading,
            error};
    
}

export default useCheckLiked;