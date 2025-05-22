import { useEffect,useState} from "react";


const useUsers = () => {

    const [data,setData]  = useState(null);

    useEffect(()=>{
        const checkUsers = async ()=>{

            try{
                // 获取用户的信息 profile_id, address, username, bio, banna
                const res = await fetch("http://localhost:3001/api/auth/me",{
                    credentials : "include",
                });
                
                const data  = await res.json();
                setData(data);
                // console.log("api/auth/me 获取的数据: ",data);
            }catch(err){
                console.error("检查登录状态失败", err);
                setData(null);
            }

        };


        checkUsers();
    },[]);
    return { data };
};


export default useUsers;