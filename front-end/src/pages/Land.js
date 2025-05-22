import React, { useState, useEffect, useRef } from 'react'
import RINGS from 'vanta/dist/vanta.rings.min'
//import { ConnectButton } from 'web3uikit'
import {BrowserProvider} from 'ethers'
import { SiweMessage } from 'siwe'
import "./Land.css"
import * as THREE from "three";


const Land = () => {
    
    const [vantaEffect, setVantaEffect] = useState(0);
    const [walletAddress, setWalletAddress] = useState(null)
    const vantaRef = useRef(null);

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                RINGS({
                    el: vantaRef.current,
                    THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    backgroundColor: 0x2,
                    color: 0xd40000
                }));
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy()
        }
    }, [vantaEffect])


    const fetchNonce = async (address) => {
        const res = await fetch(`http://localhost:3001/api/auth/nonce?address=${address}`,{
            credentials: "include",
        });
        const data = await res.json();
        return data.nonce;
    };


    // 创建Siwe信息
    const createSiweMessage = (address, statement,nonce) => {
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to Web3",
          uri: window.location.origin,
          version: '1',
          chainId: 137,
          nonce,
          issuedAt: new Date().toISOString(),
        });
        return message.prepareMessage();
      };



    // 登录
    const handleLogin = async () => {

        if (!window.ethereum) {
            alert("请安装MetaMask");
            return;
        }
    
        try {
            console.log("开始连接钱包...");
            const provider = new BrowserProvider(window.ethereum);
            //const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            console.log("钱包地址:", address);

            setWalletAddress(address);
            
            console.log("准备请求后端 nonce...");
            const nonce = await fetchNonce(address);
            console.log("收到后端 nonce:", nonce);


            // 构造SIWE消息
            const message = createSiweMessage(
                address,
                "Sign in with Ethereum to My web3 social app",
                nonce
            );

            console.log("准备签名消息:", message);
            const signature = await signer.signMessage(message);
            console.log("签名成功:", signature);

            // 发送给后端进行验证
            const res = await fetch("http://localhost:3001/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message, signature }),
            });


            const data  = await res.json();
            console.log("后端返回：", data);

            if (data.success) {
                alert("登录成功! 🎉");
                try {
                    const res2 = await fetch("http://localhost:3001/api/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ address }),
                    });
                    // console.log("🛰️ login 响应状态码:", res2.status);
                    const data2 = await res2.json();
                    // console.log("📦 login 响应内容:", data2);
                    
                    // 你可以将 profileID 存入 localStorage 或状态管理
                    localStorage.setItem("profileID", data2.profileID);
            
                } catch (e) {
                    console.error("⚠️ 存储用户信息失败:", e);
                }
            
                window.location.reload();
                
            } else {
                alert("❌ 登录失败!");
            }
    
        } catch (error) {
            console.error("🚨 登录失败:", error);
            
            alert("登录失败，请查看控制台报错");
        }
    };



    // {walletAddress && <p>当前地址：{walletAddress}</p>}
    // <ConnectButton />
    return <div className="container" ref={vantaRef}>
        <div className="cd">
            <button className="login-button" onClick={handleLogin}>
                    一键签名登录
            </button>
            
        </div>
    </div>

}

export default Land;