import { useEffect,useState} from "react";


const useAuth = () => {
    const [authenticated,setAuthenticated] = useState(null);
    const [user,setUser]  = useState(null);

    useEffect(()=>{
        const checkAuth = async ()=>{

            try{
                const res = await fetch("http://localhost:3001/api/auth/session",{
                    credentials : "include",
                });

                const data  = await res.json();
                setAuthenticated(data.authenticated);
                setUser(data.address);
            }catch(err){
                console.error("检查登录状态失败", err);
                setAuthenticated(false);
            }

        };


        checkAuth();
    },[]);
    return { authenticated,user };
};


export default useAuth;