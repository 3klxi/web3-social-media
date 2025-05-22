import React from "react";
import './Sidebar.css';
import {Link} from 'react-router-dom';
import {Logo, Icon} from "web3uikit";
import ipfsLogo from "../images/ipfs-logo.png";
import { defaultImgs } from "../defaultimgs";

//import{useMoralis} from "react-moralis";
import useAuth from "../hooks/useAuth";
import useUsers from "../hooks/useUsers";

import {resolveIpfsUrl} from "../utils/ipfs"

const Sidebar = () => {
  const {data} = useUsers();
  //console.log(data?.user_id);
  const shortenAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  return (
    <>
     <div className="siderContent">
      <div className="menu">
        <div className="details">
          <img src={ipfsLogo} className="profilePic"></img>
          <Icon fill="#000000" size={40} svg="fil"/>
          <Logo theme="icon" color="blue" size="regular"/> 
        </div> 

        {/*主页*/}
        <Link to="/" className="link">
          <div className="menuItems">
            <Icon fill="#ffffff" size={33} svg="list" />
            探索一下
          </div>
        </Link>

        {/*个人资料*/}
        <Link to="/profile" className="link">
          <div className="menuItems">
            <Icon fill="#ffffff" size={33} svg="user" />
            个人主页
          </div>
        </Link>


        {/*设置*/}
        <Link to="/settings" className="link">
          <div className="menuItems">
            <Icon fill="#ffffff" size={33} svg="cog" />
            个人设置
          </div>
        </Link>

        {/*关注*/}
        <Link to="/following" className="link">
          <div className="menuItems">
            <Icon fill="#ffffff" size={33} svg="user" />
            我的关注
          </div>
        </Link>


        {/*更多*/}
        <Link to="/more" className="link">
          <div className="menuItems">
            <Icon fill="#ffffff" size={33} svg="link" />
            更多
          </div>
        </Link>
      </div>
    

      {/*个人的简洁信息*/}
      <div className="details">
          {/*<img src={defaultImgs[0]} className="profilePic"></img>*/}
          
          {/*头像*/}
          <img
            src={resolveIpfsUrl(data?.pfp) || defaultImgs[1]}
            //src={defaultImgs[1]}
            className="profilePic"
            alt="头像"
          />


          {/**/}
          <div className="profile">

             {/*Username*/}
            <div className="who">
            {data?.username || "web3 用户"}
            </div>

            {/*Address*/}
            <div className="accWhen">
            {shortenAddress(data?.address)}
            </div>

          </div>

          
      </div>

     </div>
    </>
  );
};

export default Sidebar;

