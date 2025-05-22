const express = require("express");
const router = express.Router();
const axios = require("axios");
require('dotenv').config();
const {resolveIpfsUrl} = require("../utils/ipfs");

const api_key = process.env.MORALIS_API_KEY;

// 函数包装
function fixIPFS(url) {
    return resolveIpfsUrl(url);
}

// 获取数据
router.get('/get_current_address_nfts', async (req, res) => {
    const { current_address } = req.body; 
  
    try {
      // 查询数据库获取当前地址的所有 nft_url
      const result = await db.query(`
        SELECT nft_url 
        FROM nfts 
        WHERE owner_address = $1
      `, [current_address]);

      // 返回结果
      res.json(result.rows.map(row => row.nft_url));
    } catch (err) {
      console.error("加载 NFT URL 失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
});


// 插入数据
router.post('/insert_nft', async (req, res) => {
    const { owner_address, token_id, nft_url } = req.body; 
  
    try {
      // 执行插入语句
      const result = await db.query(`
        INSERT INTO nfts (owner_address, token_id, nft_url, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `, [owner_address, token_id, nft_url]);
  
      // 返回插入的记录
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("插入 NFT 数据失败:", err);
      res.status(500).json({ error: "服务器错误" });
    }
});


// 获取nft
router.get('/get_nfts', async (req, res) => {
    //const address = req.body.session.address;
    const address = req.query.address;
    console.log(address);
    if (!address) {
        return res.status(400).json({ error: "Missing address parameter" });
    }

    const url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=polygon&format=decimal`;

    try {
        const response = await axios.get(url, {
            headers: {
                'X-API-Key': api_key
            }
        });

        const nfts = response.data.result;

        const imageUrls = nfts.map(nft => {
            let metadata;
            try {
                metadata = JSON.parse(nft.metadata);
            } catch {
                metadata = null;
            }
            return fixIPFS(metadata?.image || null);
        }).filter(Boolean);

        res.json({ address, count: imageUrls.length, imageUrls });

    } catch (err) {
        console.error("Error fetching NFTs:", err.message);
        res.status(500).json({ error: "Failed to fetch NFT data" });
    }
});




module.exports = router;
