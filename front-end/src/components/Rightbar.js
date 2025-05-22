import React from "react";
import './Rightbar.css';
import spaceshooter from "../images/spaceshooter.jpeg";
import netflix from "../images/netflix.jpeg";
import academy from "../images/academy.png";
import youtube from "../images/youtube.png";
import js from "../images/js.png";
import nftStorage from "../images/nftStorage.jpg";
import web3Storage from "../images/web3Storage.png";
import filecoinHK from "../images/filecoinHk.png";
import {Input} from "web3uikit"

const Rightbar = () => {
  const trends = [
    {
      img: filecoinHK,
      text: "Your data,your call, coding with Fileeconi.",
      link: "https://www.hackathon.city/",
    },
    {
      img: nftStorage,
      text: "Free decentralized storage for NFTs on IPFS and Filecoin.",
      link: "https://nft.storage/",
    },
    {
      img: web3Storage,
      text: "The easiest way to store data on the decentralized web.",
      link: "https://web3.storage/",
    },
    {
      img: spaceshooter,
      text: "Learn how to build a Web3 FPS game using unity...",
      link: "https://moralis.io/moralis-projects-learn-to-build-a-web3-space-fps-game/",
    },
    {
      img: netflix,
      text: "The fisrt Moralis Project! Let's Netflix and chill...",
      link: "https://moralis.io/moralis-projects-learn-to-build-a-web3-netflix-clone/",
    },
    {
      img: academy,
      text: "Master DeFi in 2022. Start  at the Moralis Academy...",
      link: "https://academy.moralis.io/courses/defi-101",
    },
    {
      img: youtube,
      text: "Best youtube channel to learn about Web3...",
      link: "https://www.youtube.com/channel/UCgWS9Q3P5AxCWyQLT2kQhBw",
    },
  ];

  return (
    <>
    <div className="rightbarContent">
      <Input
        label="搜索"
        name ="Search Photo"
        prefixIcon="search"
        labelBgColor="#141d26">
      </Input>
      
      <div className="trends">
        新闻
        {trends.map((e,index) => {
            return(
              <>
              <div className="trend" key={index} onClick={() => window.open(e.link)}>
                <img src={e.img} className="trendImg"></img>
                <div className="trendText">{e.text}</div>
              </div>
              </>
            )
        })}
      </div>

    </div>
    </>
  );
};

export default Rightbar;

