import React from "react";
import { Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import Rightbar from "./components/Rightbar";
import Profile1 from "./pages/Profile1";
import Following from "./pages/Following";
import More from "./pages/More";


import "./App.css";
import Land from "./pages/Land";
import Hello from "./plugs/Hello";
import Users from "./plugs/Users";

import useAuth from "./hooks/useAuth";
import useUsers from "./hooks/useUsers"
import { useNavigate } from "react-router-dom";
//import { useMoralis } from "react-moralis";
//import { ConnectButton, Icon} from "web3uikit";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
  
  const { authenticated,user } = useAuth();  // 监听会话的状态
  // const {data} = useUsers();
 
  console.log("authenticated:", authenticated?authenticated:false);


  // 注销
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.reload();
    } catch (err) {
      console.error('登出失败', err);
    }
  };


  return (
    <>
      {authenticated ?(
        <div className="page">

            {/*1 侧边栏*/}
            <div className="sideBar">
              <Sidebar />
              <div className="logout"
                onClick={()=>{
                  handleLogout();
                }}> 
                登出
              </div>
            </div>


            {/*2 主界面*/}
            <div className="mainWindow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:profileId" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/following" element={<Following />} />
                <Route path="/more" element={<More />} />
              </Routes>
            </div>

            <ToastContainer
              position="bottom-right"
              autoClose={2500}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
            />
            {/*3 右边栏*/} 
            <div className="rightBar">
              <Rightbar/>
            </div>
        </div>
        ):(
        <Land />
      )}
    </>
  );
};

export default App;
