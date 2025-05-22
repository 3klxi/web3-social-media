import { getNFTContract } from "./web3";
import { ethers } from "ethers";

// 1. 铸造 NFT
export async function mintNFT(tokenURI) {
  try {
    const contract = await getNFTContract();
    const tx = await contract.mint(tokenURI);
    await tx.wait();

    // 获取交易回执并解析 tokenId（Transfer 事件）
    const receipt = await contract.runner.provider.getTransactionReceipt(tx.hash);
    const event = receipt.logs[0]; // 默认第一个事件是 Transfer
    const tokenId = parseInt(event.topics[3], 16);

    console.log(`✅ NFT 铸造成功，TokenID: ${tokenId}`);
    return {
      tokenId,
      hash: tx.hash,
    };
  } catch (err) {
    console.error("铸造失败:", err.message);
    throw err;
  }
}


// 2. 查询 NFT 详情
export async function getNFTDetails(tokenId) {
  try {
    const contract = await getNFTContract();
    const owner = await contract.ownerOf(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);

    return {
      tokenId,
      owner,
      tokenURI,
    };
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}

// 3. 获取总 NFT 数量（tokenCount）
export async function getTotalSupply() {
  try {
    const contract = await getNFTContract();
    const count = await contract.tokenCount();
    return count;
  } catch (err) {
    console.error("查询失败:", err.message);
    throw err;
  }
}
