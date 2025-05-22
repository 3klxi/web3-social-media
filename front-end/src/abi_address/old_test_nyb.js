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
    console.log(`已取消关注 ${targetAddress}`);
  } catch (err) {
    console.error("取消关注失败:", err.message);
  }
}

// 3. 获取我的关注列表
async function getMyFollowing(myAddress) {
  try {
    const followingList = await followContract.getFollowing(myAddress);
    console.log("我的关注列表:", followingList);
    return followingList;
  } catch (err) {
    console.error("获取关注列表失败:", err.message);
  }
}

// 4. 获取我的粉丝列表
async function getMyFollowers(myAddress) {
  try {
    const followersList = await followContract.getFollowers(myAddress);
    console.log("我的粉丝列表:", followersList);
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


// 1. 发布推文（需支付 0.01 MATIC）
async function addTweet(tweetText, tweetImage) {
  try {
    const tx = await tweetsContract.addTweet(tweetText, tweetImage, {
      value: ethers.parseEther("0.01") // 0.01 MATIC
    });
    await tx.wait();
    console.log("推文发布成功！");
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
    return {
      tweeter: tweet[0],
      id: tweet[1],
      text: tweet[2],
      image: tweet[3],
      likeCount: tweet[4]
    };
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
    console.log("操作成功！");
    return tx.hash;
  } catch (err) {
    console.error("操作失败:", err.message);
    throw err;
  }
}

// 4. 检查是否已点赞
async function checkIfLiked(tweetId, userAddress) {
  try {
    return await tweetsContract.checkIfLiked(tweetId, userAddress);
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
    console.log("评论发布成功！");
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

// 8. 提现合约资金（仅Owner）
async function withdrawFunds() {
  try {
    const tx = await tweetsContract.withdrawFunds();
    await tx.wait();
    console.log("提现成功！");
  } catch (err) {
    console.error("提现失败:", err.message);
    throw err;
  }
}

async function mintNFT(tokenURI) {
  try {
    

    // 调用 mint 函数
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

async function getNFTDetails(tokenId) {
  try {
    const owner = await nftContract.ownerOf(tokenId);
    const tokenURI = await nftContract.tokenURI(tokenId);

    return {
      owner,
      tokenURI,
      tokenId
    };
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}

async function getTotalSupply() {
  try {
    return await nftContract.tokenCount();
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}

// 测试账户地址
const TEST_ADDRESS_1 = "0x8942581754DD3fcddf9E7408898be4c75E0eb622"; // 替换为实际测试地址
const TEST_ADDRESS_2 = "0xA598Ad444FE4ae8831A89919cDeC668Ec5cf633D"; // 替换为实际测试地址

// 测试NFT tokenURI
const TEST_TOKEN_URI = "ipfs://Qm..."; // 替换为实际测试tokenURI

// 测试推文内容
const TEST_TWEET_TEXT = "这是一个测试推文";
const TEST_TWEET_IMAGE = "https://example.com/image.jpg";

// 测试评论内容
const TEST_COMMENT_TEXT = "这是一个测试评论";

// 测试关注功能
async function testFunctions() {
  console.log("=== 开始测试关注功能 ===");

  // 测试关注
  const follow = await followUser(TEST_ADDRESS_2);

  // 测试检查是否关注
  const isFollowing = await checkIfFollowing(TEST_ADDRESS_1, TEST_ADDRESS_2);
  console.assert(isFollowing, "关注检查失败");

  // 测试获取关注列表
  const followingList = await getMyFollowing(TEST_ADDRESS_1);
  console.assert(followingList.includes(TEST_ADDRESS_2), "关注列表获取失败");

  // 测试取消关注
  await unfollowUser(TEST_ADDRESS_2);
  const isStillFollowing = await checkIfFollowing(TEST_ADDRESS_1, TEST_ADDRESS_2);
  console.assert(!isStillFollowing, "取消关注失败");

  console.log("=== 关注功能测试完成 ===");
  console.log("=== 开始测试推文功能 ===");

  // 测试发布推文
  const txHash = await addTweet(TEST_TWEET_TEXT, TEST_TWEET_IMAGE);
  console.assert(txHash, "推文发布失败");

  // 假设我们知道最新推文ID是1（实际情况可能需要从事件中获取）
  const TWEET_ID = await tweetsContract.getCounter();

  // 测试获取推文
  const tweet = await getTweet(TWEET_ID);
  console.assert(tweet.text === TEST_TWEET_TEXT, "推文获取失败");

  // 测试点赞
  const likehash = await likeTweet(TWEET_ID);
  const isLiked = await checkIfLiked(TWEET_ID, TEST_ADDRESS_1);
  console.assert(isLiked, "点赞失败");

  // 测试取消点赞
  await likeTweet(TWEET_ID);
  const isStillLiked = await checkIfLiked(TWEET_ID, TEST_ADDRESS_1);
  console.assert(!isStillLiked, "取消点赞失败");

  // 测试评论
  const Comment = await addComment(TWEET_ID, TEST_COMMENT_TEXT);
  const comments = await getComments(TWEET_ID);
  console.assert(comments.length > 0, "评论失败");

  console.log("=== 推文功能测试完成 ===");


  console.log("=== 开始测试NFT功能 ===");

  // 测试铸造NFT
  const NFT = await mintNFT(TEST_TOKEN_URI);
  const tokenId = NFT.tokenId;
  console.assert(tokenId > 0, "NFT铸造失败");

  // 测试获取NFT详情
  const nftDetails = await getNFTDetails(tokenId);
  console.assert(nftDetails.owner === TEST_ADDRESS_1, "NFT详情获取失败");
  console.assert(nftDetails.tokenURI === TEST_TOKEN_URI, "NFT URI不匹配");

  // 测试获取总供应量
  const totalSupply = await getTotalSupply();
  console.assert(totalSupply >= 1, "总供应量查询失败");

  console.log("=== NFT功能测试完成 ===");
  const data = {
    Tweethash: txHash,
    likehash: likehash,
    commenthash: Comment,
    followhash: follow.hash,
    nfthash: NFT.hash,
    tokenId: tokenId,
  }
  console.log(data);
}


// 主测试函数
async function runAllTests() {
  try {
    

    // 运行测试
    
    await testFunctions();

    console.log("=== 所有测试完成 ===");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  }
}

// 运行测试
runAllTests();