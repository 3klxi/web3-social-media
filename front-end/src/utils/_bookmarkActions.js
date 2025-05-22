import { getBookmarkContract } from "./web3";
import { ethers } from "ethers";



// 1. 检查推文是否已收藏
export async function checkIfBookmarked(userAddress, tweetId) {
  const contract = getBookmarkContract();
  const isBookmarked = await contract.isBookmarked(userAddress, tweetId);
  console.log(`推文 ${tweetId} 是否已收藏: ${isBookmarked}`);
  return isBookmarked;
}

// 2. 收藏推文
export async function bookmarkTweet(tweetId) {
  const contract = getBookmarkContract();
  const tx = await contract.bookmarkTweet(tweetId, {
    value: ethers.parseEther("0.0101"),
  });
  console.log(`交易已发送，哈希: ${tx.hash}`);
  await tx.wait();
  console.log("交易已确认，推文已收藏");
  return tx;
}

// 3. 获取用户所有收藏
export async function getUserBookmarks(userAddress) {
  const contract = getBookmarkContract();
  const userBookmarks = await contract.getUserBookmarks(userAddress);
  console.log(`用户的收藏IDs: ${userBookmarks.toString()}`);
  return userBookmarks;
}

// 4. 获取收藏详情
export async function getBookmarkDetails(bookmarkId) {
  const contract = getBookmarkContract();
  const bookmarkDetails = await contract.getBookmarkDetails(bookmarkId);
  const formattedDetails = {
    bookmarker: bookmarkDetails.bookmarker,
    tweetId: bookmarkDetails.tweetId.toString(),
    timestamp: new Date(Number(bookmarkDetails.timestamp) * 1000),
  };
  console.log(`收藏详情 (ID: ${bookmarkId.toString()}):`, formattedDetails);
  return formattedDetails;
}

// 5. 获取推文的所有收藏
export async function getTweetBookmarks(tweetId) {
  const contract = getBookmarkContract();
  const tweetBookmarksList = await contract.getTweetBookmarks(tweetId);
  console.log(`推文 ${tweetId} 的所有收藏IDs: ${tweetBookmarksList}`);
  return tweetBookmarksList;
}

// 6. 移除收藏
export async function removeBookmark(tweetId) {
  const contract = getBookmarkContract();
  const removeTx = await contract.removeBookmark(tweetId);
  console.log(`移除交易已发送，哈希: ${removeTx.hash}`);
  await removeTx.wait();
  console.log("移除交易已确认");
  return removeTx;
}
