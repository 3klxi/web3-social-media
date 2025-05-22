// routes/upload.js
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


const router = express.Router();

const upload = multer({ dest: 'uploads/' });


// 上传文件
router.post('/uploadFile', upload.single('file'), async (req, res) => {
  console.log('👍 准备上传到IPFS');
  const filePath = req.file.path;
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET,
        },
      }
    );
    const cid = response.data.IpfsHash;
    res.json({ cid });
  } catch (err) {
    console.error('上传失败', err);
    res.status(500).json({ error: '上传失败' });
  }
});

module.exports = router;