
import { resolveIpfsUrl } from "./ipfs";

export const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await fetch("http://localhost:3001/api/upload/uploadFile", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error("上传失败");
      }
  
      const data = await res.json();
      console.log("✅ 上传成功 CID:", data.cid);
      console.log("👌 图片的Uurl: ",resolveIpfsUrl(data.cid));
      return data.cid;
    } catch (err) {
      console.error("❌ 上传失败", err);
      throw err;
    }
  };



// ------------------------------------------------------------ version 1
// import axios from 'axios'
// import FormData from 'form-data'
// import fs from 'fs'
// import path from 'path'

// require("dotenv").config({ path: __dirname + "/../../.env" });


// const PINATA_API_KEY = process.env.API_KEY;
// const PINATA_API_SECRET = process.env.API_SECRET;

// export const uploadToIPFS = async (file) => {
//     const formData = new FormData()
//     formData.append('file', file)
  
//     try {
//       const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//         maxBodyLength: Infinity,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           pinata_api_key: PINATA_API_KEY,
//           pinata_secret_api_key: PINATA_API_SECRET,
//         },
//       })
  
//       const cid = res.data.IpfsHash
//       console.log('上传成功！CID:', cid)
//       return cid
//     } catch (err) {
//       console.error('上传失败', err)
//       throw err
//     }
// }