import { useState } from "react";

const useSaveProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = async ({ username, bio, pfp, banner }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/api/auth/update_profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          bio,
          pfp,
          banner
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更新失败");
      }

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    saveProfile,
    loading,
    error
  };
};

export default useSaveProfile;
