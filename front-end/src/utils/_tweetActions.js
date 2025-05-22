import { getTweetContract } from "./web3";
import { ethers } from "ethers";

// 1. 发布推文（需支付 0.01 MATIC）
export async function addTweet(tweetText, tweetImage) {
  try {
    const contract = await getTweetContract();
    const tx = await contract.addTweet(tweetText, tweetImage, {
      value: ethers.parseEther("0.01")
    });
    await tx.wait();
    console.log("✔️ 发布推文成功! 交易哈希:", tx.hash);
    return tx.hash;
  } catch (err) {
    console.error("发布失败:", err.message);
    throw err;
  }
}

// 2. 获取推文详情
export async function getTweet(tweetId) {
  try {
    const contract = await getTweetContract();
    const tweet = await contract.getTweet(tweetId);
    const data = {
      tweeter: tweet[0],
      id: tweet[1],
      text: tweet[2],
      image: tweet[3],
      likeCount: tweet[4]
    };
    console.log("推文详情:", data);
    return { data };
  } catch (err) {
    console.error("获取推文失败:", err.message);
    throw err;
  }
}

// 3. 点赞/取消点赞
export async function likeTweet(tweetId) {
  try {
    const contract = await getTweetContract();
    const tx = await contract.likeTweet(tweetId);
    await tx.wait();
    console.log("✔️ 点赞/取消点赞成功! 哈希:", tx.hash);
    return tx.hash;
  } catch (err) {
    console.error("操作失败:", err.message);
    throw err;
  }
}

// 4. 检查是否已点赞
export async function checkIfLiked(tweetId, userAddress) {
  try {
    const contract = await getTweetContract();
    const res = await contract.checkIfLiked(tweetId, userAddress);
    console.log("✔️ 检查点赞状态成功:", res);
    return res;
  } catch (err) {
    console.error("检查失败:", err.message);
    throw err;
  }
}

// 5. 添加评论
export async function addComment(tweetId, commentText) {
  try {
    const contract = await getTweetContract();
    const tx = await contract.addComment(tweetId, commentText);
    await tx.wait();
    console.log(`✔️ 向推文 ${tweetId} 添加评论成功: ${commentText}`);
    return tx.hash;
  } catch (err) {
    console.error("评论失败:", err.message);
    throw err;
  }
}

// 6. 获取评论列表
export async function getComments(tweetId) {
  try {
    const contract = await getTweetContract();
    const comments = await contract.getComments(tweetId);
    return comments;
  } catch (err) {
    console.error("获取评论失败:", err.message);
    throw err;
  }
}
