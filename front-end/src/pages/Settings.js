import React, { useEffect } from "react";
import axios from 'axios'
import {Input} from "web3uikit";
import { useState, useRef} from "react";

import './Settings.css';
import { defaultImgs } from "../defaultimgs";


// test 环境
// public资源
import pfp1 from "../images/pfp1.png";
import pfp2 from "../images/pfp2.png";
import pfp3 from "../images/pfp3.png";
import pfp4 from "../images/pfp4.png";
import pfp5 from "../images/pfp5.png";


// 钩子
import useUsers from "../hooks/useUsers";
import useSaveProfile from "../hooks/useSaveProfile";
import useGetNfts from "../hooks/useGetNfts";
import { resolveIpfsUrl } from "../utils/ipfs";
import { uploadToIPFS } from "../utils/uploadFileToPinata";


// 组件Seettings
const Settings = () => {
  const [selectedPFP, setSelectedPFP] = useState();
  const [selectedFile, setSelectedFile] = useState(defaultImgs[4]);
  const [theFile, setTheFile] = useState();
  const inputFile = useRef(null);
  const [username, setUsername] = useState();
  const [bio, setBio] = useState();
  

  
  
  // 获取用户信息
  const {data} = useUsers();
  const address = data?.address;

  // 获取nfts
  const {nfts} = useGetNfts(address || null);

  // 调用saveProfile钩子
  const { saveProfile, loading, error } = useSaveProfile();

  // 实际生产时候，const pfps = nfts
  const pfps = [pfp1,pfp2,pfp3,pfp4,pfp5];
  //const pfps = nfts;

  // 选择背景
  const onBannerClick = () => {
    inputFile.current.click();
  };

  
  // // 日志 输出nfts信息
  // useEffect(()=>{
  //   console.log('当前用户的信息:',data);
  //   console.log('当前的用户地址: ',address);
  //   console.log(nfts?nfts:'啥也没有');
  // },[data,address,nfts]);


  // 上传背景图
  const changeHandler = (event) => {
    const img = event.target.files[0];
    setTheFile(img);
    setSelectedFile(URL.createObjectURL(img));
  };
  

  // ------------------------------------------------复用到 /utils/iploadFileToPinata
  // // 上传Banner到ipfs
  // const uploadToIPFS = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  
  //   try {
  //     const res = await fetch("http://localhost:3001/api/upload/uploadFile", {
  //       method: "POST",
  //       body: formData,
  //     });
  
  //     if (!res.ok) {
  //       throw new Error("上传失败");
  //     }
  
  //     const data = await res.json();
  //     console.log("✅ 上传成功 CID:", data.cid);
  //     console.log("👌 图片的Uurl: ",resolveIpfsUrl(data.cid));
  //     return data.cid;
  //   } catch (err) {
  //     console.error("❌ 上传失败", err);
  //     throw err;
  //   }
  // };
  

  // 保存设置
  const saveEdits = async () => {
    let bannerCID = null;
  
    if (theFile) {
      try {
        bannerCID = await uploadToIPFS(theFile);
        console.log("✔️ 上传成功, CID: ", bannerCID);
      } catch (error) {
        console.error("❌ 上传失败:", error);
        alert("❌ 文件上传失败！");
        return; // ⛔️ 阻止继续执行（否则 bannerCID 是 null）
      }
    }
  
    const saveCID = bannerCID ? resolveIpfsUrl(bannerCID) : null;
  
    const result = await saveProfile({
      username,
      bio,
      pfp: selectedPFP,
      banner: saveCID, // ✅ banner 是 IPFS 地址
    });
  
    if (result.success) {
      alert("保存成功！");
      window.location.reload();
    } else {
      alert("保存失败：" + result.error);
    }
  };
  

  return (
    <>
      <div className="pageIdentify">个人设置 </div>

      {/* <div className="grid grid-cols-3 gap-4">
      {nfts.map((url, index) => (
        <img key={index} src={url} alt={`NFT ${index}`} className="rounded-lg" />
      ))}
      </div> */}


      {/*Username*/}
      <div className="settingsPage">
        <Input
          label="Name"
          name="NameChange"
          width="100%"
          labelBgColor="#141d26"
          value={username}
          onChange={(e)=> setUsername(e.target.value)}
        />

        {/*Bio*/}
        <Input
          label="Bio"
          name="bioChange"
          width="100%"
          labelBgColor="#141d26"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />


        {/*NFT头像*/}   {/*在实际的生产中，pfps = nfts，因为我这里的nfts为空，解决方案在集成智能合约后，连接到特定的链上获取nfts*/}
        <div className="pfp">

          个人用户头像(你的NFTs)
          <div className="pfpOptions">
              { 
                pfps.map((e,i)=>{
                  return(
                  <>
                    <img src={e} 
                        className={selectedPFP === e ? "pfpOptionSelected":"pfpOption"} 
                        onClick={()=>setSelectedPFP(pfps[i])}>
                    </img>
                  </>
                  )
                })
              }
          </div>

        </div>
        

        {/*个人用户背景*/}
        <div className="pfp">
          个人用户背景图
            <div className="pfpOptions">
              <img
                src={selectedFile}
                onClick={onBannerClick}
                className="banner"
              ></img>
              <input
                type="file"
                name="file"
                ref={inputFile}
                onChange={changeHandler}
                style={{ display: "none" }}
              />
            </div>
        </div>
        
        
        {/*保存信息*/}
        <div className="save" onClick={()=>saveEdits()}>
          保存
        </div>

      </div>

    </>
  );
};

export default Settings;

