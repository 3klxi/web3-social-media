import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import "./TweetInFeed.css";
import filecoinOrbit from "../images/filecoinOrbit.jpeg";
import canoe from "../images/canoe.jpeg";
import { defaultImgs } from "../defaultimgs";
import pfp4 from "../images/pfp4.png";
import pfp5 from "../images/pfp5.png";
import { Icon } from "web3uikit";
import { FaHeart,FaLink } from 'react-icons/fa';

import useAuth from "../hooks/useAuth";
import useGetTweetLike from "../hooks/useGetTweetLike";
import useGetTweetCollect from "../hooks/useGetTweetCollect";
import useToggleCollect from "../hooks/useCollectTweetAction";
import useLikeTweetAction from "../hooks/useLikeTweetAction";
import useCollectTweetAction from "../hooks/useCollectTweetAction";
import useUsers from "../hooks/useUsers";
import {UserAvatar} from "./UserAvatar"

import {resolveIpfsUrl} from "../utils/ipfs"
import { showErrorToast,showSuccessToast } from "../utils/toast";

// 帖子展示组件
const TweetInFeed = ({ tweets: propTweets = null, userId}) => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  
  const {likeTweet} = useLikeTweetAction();
  const {toggleCollect} = useCollectTweetAction();
  
  // const {data} = useUsers();

  // const user_id = data.user_id;

  const handleLikeClick = async (tweet_id,user_id) => {
      try {
          const res = await likeTweet(tweet_id, user_id); // 👈 这里改成动态 tweetId 和 userId
      
          if (res.alreadyLiked) {
            showErrorToast("你已经点过赞啦！");
          } else {
            showSuccessToast("👍 点赞成功！");
          }
        } catch {
          showErrorToast("点赞失败！");
        }
  };

  const handleCollectClick = async (tweet_id,user_id) => {
    try {
        const res = await toggleCollect(tweet_id, user_id); // 👈 这里改成动态 tweetId 和 userId
    
        if (res.alreadyLiked) {
          showErrorToast("你已经收藏过啦！");
        } else {
          showSuccessToast("👍 收藏成功！");
        }
      } catch {
        showErrorToast("收藏失败！");
      }
};

  // likes
  const LikeCount = ({ tweetId }) => {
    const { likeCount, loading } = useGetTweetLike(tweetId);
    return <span>{loading ? "..." : likeCount}</span>;
  };


  // collects
  const CollectCount = ({ tweetId }) => {
    const { collectCount, loading } = useGetTweetCollect(tweetId);
    return <span>{loading ? "..." : collectCount}</span>;
  };


  // const InteractionButton = ({ icon, onClick, count, active = false }) => {
  //   return (
  //     <div
  //       className="interactionNums"
  //       onClick={onClick}
  //       style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
  //     >
  //       <Icon
  //         fill={active ? "#1DA1F2" : "#3f3f3f"}
  //         size={20}
  //         svg={icon}
  //         style={{ marginRight: 4 }}
  //       />
  //       {count ?? "..."}
  //     </div>
  //   );
  // };
  
  
  useEffect(() => {
    if (propTweets) {
      setTweets(propTweets); // 👈 父组件传入的（比如 Profile 页）
    } else {
      // 👇 如果没传入，就自动拉取全部
      fetch("http://localhost:3001/api/tweet/get_all_tweets")
        .then(res => res.json())
        .then(data => setTweets(data))
        .catch(err => console.error("加载推文失败", err));
    }
  }, [propTweets]);

  

  const tweetItems = tweets.map((tweet, index) => {
    // console.log("当前 tweet 👉", tweet.profile_id);

    return (
      <div key={index} className="feedTweet">
        {/*头像*/}
        <img
          src={resolveIpfsUrl(tweet.pfp) || defaultImgs[0]}
          className="profilePic"
          alt="pfp"
          style={{ cursor: "pointer" }}
          onClick={() => {
            console.log("你点到我了！");
            navigate(`/profile/${tweet.profile_id || ""}`);
          }}
        />

        {/*基本信息*/}
        <div className="completeTweet">
          {/*昵称，地址，发布时间*/}
          <div className="who">
            {tweet.username || "匿名"}
            <div className="accWhen">
              {tweet.address.slice(0, 6)}...{tweet.address.slice(-4)} ·{" "}
              {new Date(tweet.created_at).toLocaleTimeString()}
            </div>
          </div>

          {/*帖子内容*/}
          <div className="tweetContent">
            {/*文字*/}
            {tweet.tweet_text}

            {/*图片*/}
            {tweet.image_url && (
              <img
                src={resolveIpfsUrl(tweet.image_url)}
                className="tweetImg"
                alt="TweetImage"
              />
            )}
          </div>

          {/*点赞，收藏，铸造NFT*/}
          <div className="interactions">
            
            <div className="interactionNums" onClick={()=>handleLikeClick(tweet.id,userId)}>
              <Icon fill="#3f3f3f" size={20} svg="star" /> <LikeCount tweetId={tweet.id} />
            </div>

            <div className="interactionNums">
              <Icon fill="#3f3f3f" size={20} svg="messageCircle" />  <LikeCount tweetId={tweet.id} />
            </div>
            <div className="interactionNums" onClick={()=>handleCollectClick(tweet.id,userId)}>
              <Icon fill="#3f3f3f" size={20} svg="matic" /> <CollectCount tweetId={tweet.id} />
            </div>



          </div>
        </div>
      </div>
    );
  });

  return <>{tweetItems}</>;

};

export default TweetInFeed;

