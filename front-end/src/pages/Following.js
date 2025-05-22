import React, { useEffect, useState } from "react";
import "./Following.css";
import { defaultImgs } from "../defaultimgs";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import { resolveIpfsUrl } from "../utils/ipfs";
import { showSuccessToast, showErrorToast } from "../utils/toast";

import { unfollowUser } from "../utils/_followActions";
import axios from "axios";

const Following = () => {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [unfollowingId, setUnfollowingId] = useState(null); // 当前正在取消的那个用户 ID
  const navigate = useNavigate();
  const { data } = useUsers(); // 当前登录用户信息

  // 获取关注列表
  useEffect(() => {
    fetch("http://localhost:3001/api/follow/following", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setFollowingUsers(data))
      .catch((err) => console.error("加载关注列表失败", err));
  }, []);


  const handleUnfollow = async (followee_id, followee_address) => {
    if (!data?.user_id || !followee_id || !followee_address) return;
  
    setUnfollowingId(followee_id); // 设置当前正在操作的 followee
  
    try {
      // 1️⃣ Web2 - 先调用数据库取消关注
      const web2Res = await axios.post("http://127.0.0.1:3001/api/follow/un_follow", {
        follower_id: data.user_id,
        followee_id,
      });
  
      console.log("✅ Web2 取消关注成功:", web2Res.data);
  
      // 2️⃣ 更新前端 UI
      setFollowingUsers((prev) =>
        prev.filter((user) => user.user_id !== followee_id)
      );
  
      showSuccessToast("取消关注成功！（同步链上中...）");
  
      // 3️⃣ 链上调用取消关注（合约）
      const txHash = await unfollowUser(followee_address);
      console.log("✅ 链上取消关注成功:", txHash);
      showSuccessToast("链上取关成功!");
    
    } catch (err) {
      console.error("❌ 链上取消关注失败:", err?.message || err);
  
      // 4️⃣ 回滚 Web2：重新发起 go_follow
      try {
        const rollbackRes = await axios.post("http://127.0.0.1:3001/api/follow/go_follow", {
          follower_id: data.user_id,
          followee_id,
        });
  
        console.log("🔁 Web2 回滚成功:", rollbackRes.data);
  
        // 添加回去 UI 列表（只补回最基础字段）
        setFollowingUsers((prev) => [
          ...prev,
          {
            user_id: followee_id,
            address: followee_address,
            username: "未知用户",
            pfp: "", // 你可以补全
          },
        ]);
  
        showErrorToast("链上取消失败，已回滚关注");
      } catch (rollbackErr) {
        console.error("❌ Web2 回滚失败:", rollbackErr?.message || rollbackErr);
        showErrorToast("链上失败且数据恢复失败，请刷新页面确认状态");
      }
    } finally {
      setUnfollowingId(null); // 重置 loading 状态
    }
  };

  // ----------------------------------------------------------------------------------- version 2
  // 处理取关
  // const handleUnfollow = async (followee_id,followee_address) => {
  //   if (!data?.user_id || !followee_id) return;

  //   setUnfollowingId(followee_id); // 设置当前正在操作的 followee
  //   try {
  //     // 1. 调用链上合约取消关注
  //     const txHash = await unfollowUser(followee_address);
  //     console.log("✅ 链上取消关注成功:", txHash);
  
  //     // 2. 同步 Web2 数据
  //     const res = await axios.post("http://127.0.0.1:3001/api/follow/un_follow", {
  //       follower_id: data.user_id,
  //       followee_id,
  //       tx_hash: txHash, // 可选：传到后端做记录
  //     });
  
  //     console.log("✅ Web2 同步成功:", res.data);
  
  //     // 3. 更新前端状态
  //     setFollowingUsers((prev) =>
  //       prev.filter((user) => user.user_id !== followee_id)
  //     );
  
  //     showSuccessToast("取消关注成功！");
  //   } catch (err) {
  //     console.error("❌ 取消关注失败:", err?.response?.data || err.message);
  
  //     if (err?.response?.status === 409) {
  //       showSuccessToast("你并未关注该用户");
  //     }
  //   } finally {
  //     setUnfollowingId(null);
  //   }
    // ----------------------------------------------------------------------------------- version 1
    // try {
    //   const res = await axios.post("http://127.0.0.1:3001/api/follow/un_follow", {
    //     follower_id: data.user_id,
    //     followee_id,
    //   });

    //   console.log("✅ 取消关注成功:", res.data);
    //   setFollowingUsers((prev) =>
    //     prev.filter((user) => user.user_id !== followee_id)
    //   );
    //   showSuccessToast("取消关注成功！");
    //   //navigate(0);
    // } catch (err) {
    //   console.error("❌ 取消关注失败:", err?.response?.data || err);
    //   if (err?.response?.status === 409) {
    //     showSuccessToast("你并未关注该用户");
    //   }
    // } finally {
    //   setUnfollowingId(null); // 重置 loading 状态
    // }
  // };

  return (
    <div className="followingPage">
      <h2>你关注的人</h2>

      {followingUsers.length === 0 && <p>你还没有关注任何人。</p>}

      <div className="followingList">
        {followingUsers.map((user, idx) => (
          <div className="followCard" key={idx}>
            <img
              className="followAvatar"
              src={resolveIpfsUrl(user.pfp) || defaultImgs[0]}
              alt="pfp"
              onClick={() => navigate(`/profile/${user.address}`)}
            />

            <div className="followInfo">
              <div className="followName">{user.username || "匿名用户"}</div>
              <div className="followAddress">
                {user.address.slice(0, 6)}...{user.address.slice(-4)}
              </div>
            </div>

            <button
              onClick={() => handleUnfollow(user.uuid,user.address)} // 👈 你数据库里的是 user_id
              disabled={unfollowingId === user.uuid}
              className="unfollowBtn"
            >
              {unfollowingId === user.uuid ? "取消中..." : "取消关注"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Following;
