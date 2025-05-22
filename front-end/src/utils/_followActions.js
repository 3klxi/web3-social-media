import { getFollowContract } from "./web3";
import { ethers } from "ethers";

export async function followUser(targetAddress) {
    try {
      const contract = await getFollowContract();
      const tx = await contract.follow(targetAddress);
      await tx.wait();
      console.log(`✅ 成功关注 ${targetAddress}`);
      return tx.hash;
    } catch (err) {
      console.error("关注失败:", err.message);
      throw err;
    }
  }
  
  // 2. 取消关注
  export async function unfollowUser(targetAddress) {
    try {
      const contract = await getFollowContract();
      const tx = await contract.unfollow(targetAddress);
      await tx.wait();
      console.log(`✅ 已取消关注 ${targetAddress}`);
      return tx.hash;
    } catch (err) {
      console.error("取消关注失败:", err.message);
      throw err;
    }
  }
  
  // 3. 获取我的关注列表
  export async function getMyFollowing(myAddress) {
    try {
      const contract = await getFollowContract();
      const list = await contract.getFollowing(myAddress);
      console.log("我的关注列表:", list);
      return list;
    } catch (err) {
      console.error("获取关注列表失败:", err.message);
      throw err;
    }
  }
  
  // 4. 获取我的粉丝列表
  export async function getMyFollowers(myAddress) {
    try {
      const contract = await getFollowContract();
      const list = await contract.getFollowers(myAddress);
      console.log("我的粉丝列表:", list);
      return list;
    } catch (err) {
      console.error("获取粉丝列表失败:", err.message);
      throw err;
    }
  }
  
  // 5. 检查是否关注了某人
  export async function checkIfFollowing(follower, following) {
    try {
      const contract = await getFollowContract();
      const res = await contract.isFollowing(follower, following);
      console.log(`${follower} 是否关注了 ${following}:`, res);
      return res;
    } catch (err) {
      console.error("检查关注状态失败:", err.message);
      throw err;
    }
  }