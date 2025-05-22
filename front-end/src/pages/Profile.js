import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import './Profile.css';
import { defaultImgs } from "../defaultimgs";
import TweetInFeed from "../components/TweetInFeed";

import useUsers from "../hooks/useUsers";
import useMyTweets from "../hooks/useMyTweets";
import useProfileData from "../hooks/useProfileData";
import useProfileTweets from "../hooks/useProfileTweets";
import useCheckFollowed  from "../hooks/useCheckFollowed";
import useCheckLiked from "../hooks/useCheckLiked";

import { resolveIpfsUrl } from "../utils/ipfs";
import { showSuccessToast, showErrorToast } from "../utils/toast";

import { followUser } from "../utils/_followActions";


// 用户个人资料页面
const Profile = () => {

  const { profileId } = useParams();
  // 当前用户
  const {data: currentUser} = useUsers();
  const {myTweets} = useMyTweets();

  // 判断是否点击了其他用户的页面
  const isMyProfile = !profileId || profileId === currentUser?.profile_id;
  
  // 获取当前profile_id下的用户信息和推文
  const profileRes = useProfileData(profileId);
  const tweetsRes = useProfileTweets(profileId);

  // 根据是否是个人主页显示不同的信息
  const showUser = isMyProfile ? currentUser : profileRes.profile;
  const showTweets = isMyProfile ? myTweets : tweetsRes.tweets;

  // 加载和错误
  const loading = !isMyProfile && (profileRes.loading || tweetsRes.loading);
  const error = !isMyProfile && profileRes.error;
  // // ✅ 关注状态

  // 检查关注状态
  const [isFollowing, setIsFollowing] = useState(false);

  //获取到两个user_id再进行查询
  const followerId = currentUser?.user_id;
  const followeeId = showUser?.user_id;

  const { followed} = useCheckFollowed(followerId, followeeId);

  // 处理关注动作
  const [followLoading, setFollowLoading] = useState(false);

  // 当前用户对于其他用户是否已经关注
  useEffect(() => {

    if (!isMyProfile && profileId) {
      setIsFollowing(followed);
    }
  }, [followed, profileId, isMyProfile]);
  

  // 关注
  const handleFollow = async () => {
    if (!currentUser?.user_id || !showUser?.user_id) return;
  
    setFollowLoading(true);
    
    try {
      // 1️⃣ 先 Web2 写入数据库
      const web2Res = await axios.post("http://127.0.0.1:3001/api/follow/go_follow", {
        follower_id: currentUser.user_id,
        followee_id: showUser.user_id,
      });
      
      console.log("✅ Web2 数据已存入:", web2Res.data);
      setIsFollowing(true); // 提前更新 UI
      showSuccessToast("关注成功！（正在链上同步...）");
  
      // 2️⃣ 再发起链上交易
      const txHash = await followUser(showUser.address);
      console.log("✅ 链上关注成功:", txHash);
      showSuccessToast("链上同步成功! ");
  
    } catch (err) {
      console.error("❌ 链上关注失败，开始回滚 Web2:", err.message);
  
      // 3️⃣ 如果链上失败，调用 Web2 接口撤销
      try {
        await axios.post("http://127.0.0.1:3001/api/follow/un_follow", {
          follower_id: currentUser.user_id,
          followee_id: showUser.user_id,
        });
  
        console.log("🔁 Web2 回滚成功");
        setIsFollowing(false);
        showSuccessToast("链上失败，已撤销关注");
  
      } catch (rollbackErr) {
        console.error("❌ 回滚失败:", rollbackErr?.response?.data || rollbackErr.message);
        showErrorToast("链上失败，且本地记录回滚失败，请手动处理");
      }
  
    } finally {
      setFollowLoading(false);
    }

  //------------------------------------------------------------------------ version2
  // // 处理关注函数
  // const handleFollow = async () => {
  //   if (!currentUser?.user_id || !showUser?.user_id) return;
  
  //   setFollowLoading(true);

  //   try {
  //     // 1. 调用链上关注
  //     const txHash = await followUser(showUser.address);
  //     console.log("✅ 链上关注成功:", txHash);
  
  //     setIsFollowing(true); // 更新前端状态
  //     showSuccessToast("关注成功！");
  
  //     // 2. 同步 Web2 数据（例如记录在 PostgreSQL 或 MongoDB）
  //     await axios.post("http://127.0.0.1:3001/api/follow/go_follow", {
  //       follower_id: currentUser.user_id,
  //       followee_id: showUser.user_id,
  //       tx_hash: txHash, // 可选传给后端保存
  //     });
      
  //     console.log("✅ Web2 记录同步成功");
  
  //   } catch (err) {
  //     console.error("❌ 出错了:", err?.response?.data || err.message);
  
  //     // 如果是 Web2 返回已关注（409），也照样设置状态
  //     if (err?.response?.status === 409) {
  //       setIsFollowing(true);
  //     }
  
  //   } finally {
  //     setFollowLoading(false);
  //   }

    //------------------------------------------------------------------------------------- version 1
    // try {
    //   const res = await axios.post('http://127.0.0.1:3001/api/follow/go_follow', {
    //     follower_id: followerId,
    //     followee_id: followeeId,
    //   });
  
    //   console.log('✅ 关注成功:', res.data);
    //   setIsFollowing(true); // 更新状态
      
    //   showSuccessToast('关注成功！');

    // } catch (err) {
    //   console.error('❌ 关注失败:', err?.response?.data || err);
  
    //   if (err?.response?.status === 409) {
    //     // 已经关注了
    //     setIsFollowing(true);
        
    //   }
    // } finally {
    //   setFollowLoading(false);
    // }
  };
  

  
  if (loading) return <p>加载中...</p>;
  if (!showUser) return <p>未找到用户信息</p>;
  if (error) return <p>加载用户资料失败：{error.message}</p>;


  return (
    <>
      <div className="pageIdentify">个人主页 </div>
      {/* Banner背景图 */}
      <img
        className="profileBanner"
        src={resolveIpfsUrl(showUser?.banner) || defaultImgs[4]}
        onError={(e) => {
          e.target.src = defaultImgs[4];
          console.error('Banner 加载失败:', showUser.banner);
        }}
        alt="Banner"
      />
      
      <div className="pfpContainner">
        {/* 头像 */}
        <img
          className="profilePFP"
          src={resolveIpfsUrl(showUser?.pfp) || defaultImgs[0]}
          alt="头像"
        />

        {/* 用户名 */}
        <div className="profileName">{showUser?.username || "web3"}</div>

        {/* 钱包地址 */}
        <div className="profileWallet">
          {showUser?.address
            ? `${showUser.address.slice(0, 6)}...${showUser.address.slice(-4)}`
            : "0x000...0000"}
        </div>

        {/* 简介 */}
        <div className="profileBio">{showUser?.bio || "这个用户很神秘..."}</div>

        
        {isMyProfile ? (
          <Link to="/settings">
            <div className="profileEdit">编辑个人资料</div>
          </Link>
        ) : (
          isFollowing ? (
            <button className="profileFollow followed" disabled>
              已关注
            </button>
          ) : (
            <button className="profileFollow" onClick={handleFollow}>
              关注
            </button>
          )
        )}


        {/* 推文 Tabs */}
        <div className="profileTabs">
          <div className="profileTab">{isMyProfile ? "你的推文" : "TA的推文"}</div>
        </div>

        {/* 推文列表 */}
        <TweetInFeed tweets={showTweets} />
      </div>
      
    </>
  );
};

export default Profile;