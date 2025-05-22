const { ethers } = require("ethers");
require("dotenv").config({path: __dirname + '/../../.env'});


// 加载私钥
const PRIVATE_KEY = process.env.PRIVATE_KEY_2;


// 全局导入 abi + address
const abis = require('./abi.json');
const addresses = require('./address.json');


// 部分导入 address
const nft_contract_address = addresses.NFT_CONTRACT_ADDRESS;
const tweets_contract_address = addresses.TWEETS_CONTRACT_ADDRESS;
const follow_contract_address = addresses.FOLLOW_CONTRACT_ADDRESS;


// 部分导入 abi
const nft_contract_abi = abis.NFT_abi;
const tweets_contract_abi = abis.TWEETS_abi;
const follow_contract_abi = abis.FOLLOW_abi;


// 1. 初始化provider和signer
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/n2O--FdwnnBiTgmfMhs7sGb3jjHG6A7n`);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);


// NFT合约实例
const nftContract = new ethers.Contract(
    nft_contract_address,
    nft_contract_abi,
    signer
);


// Follow合约实例
const followContract = new ethers.Contract(
  follow_contract_address,
  follow_contract_abi,
  signer
);


// Tweet合约实例
const tweetsContract = new ethers.Contract(
  tweets_contract_address,
  tweets_contract_abi,
  signer
);



// ------------------------------------------关注------------------------------------------
// 1. 关注某人
async function followUser(targetAddress) {
  try {
    const tx = await followContract.follow(targetAddress);
    await tx.wait();
    console.log(`成功关注 ${targetAddress}`);
    return tx;
  } catch (err) {
    console.error("关注失败:", err.message);
  }
}

// 2. 取消关注
async function unfollowUser(targetAddress) {
  try {
    const tx = await followContract.unfollow(targetAddress);
    await tx.wait();
    return tx;
    console.log(`已取消关注 ${targetAddress}`);
  } catch (err) {
    console.error("取消关注失败:", err.message);
  }
}


// 3. 获取我的关注列表
async function getMyFollowing(myAddress) {
  try {
    const followingList = await followContract.getFollowing(myAddress);
    console.log('我的的关注列表: ',followingList);
    return followingList;
  } catch (err) {
    console.error("获取关注列表失败:", err.message);
  }
}

// 4. 获取我的粉丝列表
async function getMyFollowers(myAddress) {
  try {
    const followersList = await followContract.getFollowers(myAddress);
    console.log('我的粉丝列表: ',followersList);
    return followersList;
  } catch (err) {
    console.error("获取粉丝列表失败:", err.message);
  }
}

// 5. 检查是否关注了某人
async function checkIfFollowing(follower, following) {
  try {
    const isFollowing = await followContract.isFollowing(follower, following);
    console.log(`${follower} 是否关注了 ${following}:`, isFollowing);
    return isFollowing;
  } catch (err) {
    console.error("检查失败:", err.message);
  }
}

// ------------------------------------------推文------------------------------------------
// 1. 发布推文（需支付 0.01 MATIC）
async function addTweet(tweetText, tweetImage) {
  try {
    const tx = await tweetsContract.addTweet(tweetText, tweetImage, {
      value: ethers.parseEther("0.01") // 0.01 MATIC
    });
    await tx.wait();
    console.log('✔️ 发布推文成功! 交易哈希: ', tx.hash);
    return tx.hash;
  } catch (err) {
    console.error("发布失败:", err.message);
    throw err;
  }
}

// 2. 获取推文详情
async function getTweet(tweetId) {
  try {
    const tweet = await tweetsContract.getTweet(tweetId);
    const data = {
      tweeter: tweet[0],
      id: tweet[1],
      text: tweet[2],
      image: tweet[3],
      likeCount: tweet[4]
    }

    console.log('推文详情: ',data)
    return { data };
  } catch (err) {
    console.error("获取推文失败:", err.message);
    throw err;
  }
}

// 3. 点赞/取消点赞
async function likeTweet(tweetId) {
  try {
    const tx = await tweetsContract.likeTweet(tweetId);
    await tx.wait();
    console.log('✔️ 操作成功!');
    return tx.hash;
  } catch (err) {
    console.error("操作失败:", err.message);
    throw err;
  }
}

// 4. 检查是否已点赞
async function checkIfLiked(tweetId, userAddress) {
  try {
    const res  = await tweetsContract.checkIfLiked(tweetId, userAddress);
    console.log('✔️  检查操作成功!');
    return res;
  } catch (err) {
    console.error("检查失败:", err.message);
    throw err;
  }
}

// 5. 添加评论
async function addComment(tweetId, commentText) {
  try {
    const tx = await tweetsContract.addComment(tweetId, commentText);
    await tx.wait();
    console.log('向 ',tweetId,' 评论 ', commentText,' 评论成功');
    return tx.hash;
  } catch (err) {
    console.error("评论失败:", err.message);
    throw err;
  }
}

// 6. 获取评论列表
async function getComments(tweetId) {
  try {
    return await tweetsContract.getComments(tweetId);
  } catch (err) {
    console.error("获取评论失败:", err.message);
    throw err;
  }
}


// // 7. 提现合约资金（仅Owner）
// async function withdrawFunds() {
//   try {
//     const tx = await tweetsContract.withdrawFunds();
//     await tx.wait();
//   } catch (err) {
//     console.error("提现失败:", err.message);
//     throw err;
//   }
// }


// ------------------------------------------NFT------------------------------------------
// 1. 铸造NFT
async function mintNFT(tokenURI) {
  try {
    const tx = await nftContract.mint(tokenURI);
    await tx.wait();

    // 从交易日志中提取 tokenId
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const event = receipt.logs[0]; // 假设第一个日志是 Transfer 事件
    const tokenId = parseInt(event.topics[3], 16); // 从事件中解析 tokenId

    console.log(`NFT 铸造成功！TokenID: ${tokenId}`);
    const NFT = {
      tokenId: tokenId,
      hash: tx.hash,
    }
    return NFT;
  } catch (err) {
    console.error("铸造失败:", err.message);
    throw err;
  }
}

// 2. 获取NFT详情
async function getNFTDetails(tokenId) {
  try {
    const owner = await nftContract.ownerOf(tokenId);
    const tokenURI = await nftContract.tokenURI(tokenId);
    // return 
    return { owner, tokenURI, tokenId };
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}

// 3. 获取总的token数量
async function getTotalSupply() {
  try {
    return await nftContract.tokenCount();
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}


module.exports = {
  followUser,
  unfollowUser,
  getMyFollowing,
  getMyFollowers,
  checkIfFollowing,
  addTweet,
  getTweet,
  likeTweet,
  checkIfLiked,
  addComment,
  getComments,
  //withdrawFunds,
  mintNFT,
  getNFTDetails,
  getTotalSupply
};
