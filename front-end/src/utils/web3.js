import { ethers } from "ethers";
import abis from "../abi_address/abi.json";
import addresses from "../abi_address/address.json";

// 获取singer
export async function getSigner() {
  if (!window.ethereum) throw new Error("请安装 Metamask");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
}

// tweet 合约实例
export async function getTweetContract() {
  const signer = await getSigner();
  return new ethers.Contract(addresses.TWEETS_CONTRACT_ADDRESS, abis.TWEETS_abi, signer);
}


// follow 合约实例
export async function getFollowContract() {
  const signer = await getSigner();
  return new ethers.Contract(addresses.FOLLOW_CONTRACT_ADDRESS, abis.FOLLOW_abi, signer);
}


// nft 合约实例
export async function getNFTContract() {
  const signer = await getSigner();
  return new ethers.Contract(addresses.NFT_CONTRACT_ADDRESS, abis.NFT_abi, signer);
}

//bookmark 合约实例
export async function getBookmarkContract() {
  const signer = await getSigner();
  return new ethers.Contract(addresses.BOOKMARK_CONTRACT_ADDRESS, abis.BOOKMARK_abi, signer);
}

//listener 合约实例
export async function getListenerContract() {
  const signer = await getSigner();
  return new ethers.Contract(addresses.LISTENER_CONTRACT_ADDRESS, abis.LISTENER_abi, signer);
}