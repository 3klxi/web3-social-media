import { getListenerContract } from "./web3";
import { ethers } from "ethers";


// 1. 获取所有事件计数
export async function getEventCounts() {
  const contract = await getListenerContract();
  const [
    tweetEventsCount,
    likeEventsCount,
    commentEventsCount,
    followEventsCount,
    bookmarkEventsCount
  ] = await Promise.all([
    contract.getTweetEventsCount(),
    contract.getLikeEventsCount(),
    contract.getCommentEventsCount(),
    contract.getFollowEventsCount(),
    contract.getBookmarkEventsCount()
  ]);

  const counts = {
    tweets: tweetEventsCount,
    likes: likeEventsCount,
    comments: commentEventsCount,
    follows: followEventsCount,
    bookmarks: bookmarkEventsCount
  };

  console.log("Event counts:", counts);
  return counts;
}

// 2. 获取最近的事件记录（通用函数）
export async function getRecentEvents( eventType, count = 5) {
  const contract = await getListenerContract();
  const allEvents = await contract[`getAll${eventType}Events`]();
  const recentEvents = allEvents.slice(-count);
  console.log(`Recent ${eventType.toLowerCase()} events:`, recentEvents);
  return recentEvents;
}

// 3. 获取监听合约地址
export async function getTrackedContractAddresses() {
  const contract = await getListenerContract();
  const [
    tweetsAddress,
    followAddress,
    bookmarkAddress
  ] = await Promise.all([
    contract.tweetsContractAddress(),
    contract.followContractAddress(),
    contract.bookmarkContractAddress()
  ]);

  const addresses = {
    tweets: tweetsAddress,
    follow: followAddress,
    bookmark: bookmarkAddress
  };

  console.log("Listener tracking contracts:", addresses);
  return addresses;
}
