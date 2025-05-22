export const resolveIpfsUrl = (url) => {
  if (!url) return null;

  // ipfs://CID/xxx => https://gateway/ipfs/CID/xxx
  if (url.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${url.slice(7)}`;
  }

  // 纯 CID 或 CID 开头路径
  const isCidLike = /^[a-zA-Z0-9]{46,}$/.test(url); // 粗略 CID 检查（46位以上）
  if (isCidLike) {
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  }

  // 正常 HTTP 链接
  return url;
};
