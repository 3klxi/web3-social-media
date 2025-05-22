import React from "react";
import { useState, useRef} from "react";
import {TextArea, Icon} from "web3uikit";
import{useMoralis,useWeb3ExecuteFunction} from "react-moralis";

import { defaultImgs } from "../defaultimgs";
import TweetInFeed from "../components/TweetInFeed";
import "./Home.css";


import useAuth from "../hooks/useAuth";
import useUsers from "../hooks/useUsers";

import { resolveIpfsUrl } from "../utils/ipfs";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import {mintNFT, getNFTDetails, getTotalSupply} from '../utils/_nftActions';  // nft
import { addTweet } from "../utils/_tweetActions";                            // tweet
import { uploadToIPFS } from "../utils/uploadFileToPinata";


// 组件
const Home = () => {
  const {authenticated,user}  = useAuth();
  const {data} = useUsers();


  //console.log(user);
  const inputFile = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [theFile, setTheFile] = useState();
  const [tweet, setTweet] = useState();

  // 添加图片
  const onImageClick = () => {
    inputFile.current.click();
  };


  // 设置图片
  const changeHandler = (event) => {
    const img = event.target.files[0];
    setTheFile(img);
    setSelectedFile(URL.createObjectURL(img));
  };


  // 保存图片
  async function saveTweet() {
    if (!tweet && !theFile) {
      showErrorToast("内容不能为空");
      return;
    }
  
    try {
      let imageUrl = null;
  
      // 1️⃣ 上传图片到 IPFS（如果有图片）
      if (theFile) {
        const cid = await uploadToIPFS(theFile);
        imageUrl = resolveIpfsUrl(cid);
        console.log("✅ 图片上传成功:", imageUrl);
      }
  
      // 2️⃣ 构造 JSON 请求体
      const res = await fetch("http://localhost:3001/api/tweet", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet,
          image: imageUrl,
          txHash: null, // 普通推文没有 txHash，也可以不传
        }),
      });
  
      const result = await res.json();
      console.log("🟢 发推成功:", result);
      showSuccessToast("推文发布成功！");
  
      // 3️⃣ 清空内容 + 刷新列表
      setTweet('');
      setTheFile(null);
      setSelectedFile(null);
      window.location.reload();
  
    } catch (err) {
      console.error("❌ 发推失败:", err);
      showErrorToast("发推失败，请稍后再试");
    }
  }
  // async function saveTweet() {
  //   if(!tweet && !theFile) return;
  //   const formData = new FormData();
  //   formData.append('tweet', tweet);
  //   if (theFile) {
  //     formData.append('image', theFile);
  //   }
    
  //   try {
  //     const res = await fetch("http://localhost:3001/api/tweet", {
  //       method: "POST",
  //       credentials: "include",
  //       body: formData
  //     });
  
  //     const result = await res.json();
  //     console.log("🟢 发推成功:", result);
  
  //     // 清空内容 + 刷新列表
  //     setTweet('');
  //     setTheFile(null);
  //     setSelectedFile(null);
  //     window.location.reload(); // 或你也可以触发重新加载推文
  //   }catch (err) {
  //     console.error("❌ 发推失败:", err);
  //   }
  // }
  
  
  // 铸造 推文+图片
  async function maticTweet() {
    if (!tweet && !theFile) {
      showErrorToast("内容不能为空");
      return;
    }
  
    let imageUrl = "no img";
  
    try {
      // 1️⃣ 使用封装的 uploadToIPFS 函数上传图片
      if (theFile) {
        const cid = await uploadToIPFS(theFile);
        imageUrl = resolveIpfsUrl(cid); // 拼出完整的 URL
        console.log("✅ 图片上传成功:", imageUrl);
      }
  
      // 2️⃣ 调用链上发布推文
      const txHash = await addTweet(tweet, imageUrl);
      console.log("✅ 链上发推成功! Hash:", txHash);
      showSuccessToast("推文已成功发布上链！");
      
      // 3️⃣ Web2 保存 tweet 数据到数据库
      const formData = new FormData();
      formData.append("tweet", tweet);
      if (theFile) formData.append("image", imageUrl);
      formData.append("txHash", txHash);

      const res = await fetch("http://localhost:3001/api/tweet", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();
      console.log("🟢 数据库保存成功:", result);

      // 4️⃣ 清空输入框 + 刷新页面
      setTweet('');
      setTheFile(null);
      setSelectedFile(null);
      window.location.reload(); // 触发推文刷新
  
    } catch (err) {
      console.error("❌ 链上发推失败:", err.message || err);
      showErrorToast("链上推文失败，请稍后再试");
    }
    // ------------------------------------------------------------ verison 1
    // const result = await mintNFT("ipfs://your-token-uri");
    // console.log(result);

    /*
    if(!tweet) return;

    let img;
    if(theFile){
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      img = file.ipfs();
    }else{
      img="no img"
    }

    const options = {
      contractAddress: "0x8ED4e8226940A8eE0C4f9e584A6F0dda494Bfd71",
      functionName: "addTweet",
      abi: Tweets.abi,
      params: {
        text: tweet,
        img:img,
      },
      msgValue: Moralis.Units.ETH(0.001)
    }

    contractProcessor.fetch{
      params: options,
      onSuccess:()=>{
        saveTweet();  
      },
      onError:(error)=>{
        console.log(error);
      }
    }

    */
    
  }

  return (
    <>
    <div className="pageIdentify">探索一下</div>
      <div className="mainContent">
        <div className="profileTweet">

          {/*头像*/}
          <img
            src={resolveIpfsUrl(data?.pfp) || defaultImgs[1]}
            className="profilePic"
            alt="头像"
          />

           {/*推文框*/}
          <div className="tweetBox">
             {/*正文内容*/}
            <TextArea
              
              label=""
              placeholder="Type here field"
              name="tweetTextArea"
              onBlur={function noRefCheck(){}}
              type="text"
              width="95%"
              onChange={(e) => setTweet(e.target.value)}>
            </TextArea>

             {/*检查是否有图片，有则预览*/}
            {selectedFile && (
              <img src={selectedFile} className="tweetImg"></img>
            )}

           
             {/*图片上传*/  }
            <div className="imgOrTweet">
              <div className="imgDiv" onClick={onImageClick}>
                <input
                    type="file"
                    name="file"
                    ref={inputFile}
                    onChange={changeHandler}
                    style={{ display: "none"}}
                  />
                  <Icon fill="#1DA1F2" size={25} svg="image"></Icon>
                  
              </div>
            
              
              {/*发布推文，普通发送or铸造成NFT*/}
              <div className="tweetOptions">
                {/*发布*/}
                <div className="tweet" onClick={saveTweet } >发布</div>

                  {/*铸造*/}
                  <div className="tweet" onClick={maticTweet} style={{ backgroundColor: "#8247e5" }}>
                    <Icon fill="#ffffff" size={20} svg="matic" />  铸造
                  </div>
              </div>


            </div>
          </div>
        </div>
        <TweetInFeed profile={false} userId={data?.user_id}/>
      </div>
    </>
  );
};

export default Home;
