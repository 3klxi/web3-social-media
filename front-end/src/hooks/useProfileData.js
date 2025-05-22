import { useEffect, useState } from "react";

const useProfileData = (profileId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/user/profiledata/${profileId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("获取失败");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err);
        console.error("❌ 获取用户资料失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  return { profile, loading, error };
};

export default useProfileData;
