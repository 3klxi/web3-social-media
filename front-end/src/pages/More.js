import React, { useEffect, useState } from "react";
import useUsers from "../hooks/useUsers";
import { resolveIpfsUrl } from "../utils/ipfs";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import useCheckLiked from "../hooks/useCheckLiked";

import useGetTweetLike from "../hooks/useGetTweetLike";
import useLikeTweetAction from "../hooks/useLikeTweetAction";


import {getEventCounts,getRecentEvents} from "../utils/_listenerActions";

const TweetLikeDisplay = ({tweetId}) => {
    const {likeCount, loading, error} = useGetTweetLike(tweetId);
    
    if (loading) return <p>加载中...</p>;
    if (error) return <p>出错了！</p>;

    return <p>❤️ 点赞数：{likeCount}</p>;
} 

function f(id){
    showSuccessToast("你干嘛?",id);
    getEventCounts();

    getRecentEvents('Follow').then(events => {
    console.log("🔥 最近的事件:", events);
  }).catch(err => {
    console.error("❌ 获取事件失败", err);
  });
}

// 监听组件
const More = () => {
    const {likeTweet} = useLikeTweetAction();
    
    const handleLikeClick = async () => {
        try {
            const res = await likeTweet(1, 1); // 👈 这里改成动态 tweetId 和 userId
        
            if (res.alreadyLiked) {
              showErrorToast("你已经点过赞啦！");
            } else {
              showSuccessToast("👍 点赞成功！");
            }
          } catch {
            showErrorToast("点赞失败！");
          }
      };


    return (
        <>
            <div className="pageIdentify">更多 </div>
            <div className="save" onClick={()=>f(1)}> 点个赞 </div>

            <TweetLikeDisplay tweetId={28} />
        </>
    );
};

export default More;
