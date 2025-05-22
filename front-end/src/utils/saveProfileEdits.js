export const saveProfileEdits = async ({ saveProfile, username, bio, pfp, image_url }) => {
    try {
      const result = await saveProfile({
        username,
        bio,
        pfp,
        banner: image_url,
      });
  
      if (result.success) {
        alert("保存成功！");
        window.location.reload(); // 可选：如果你希望组件控制刷新，可以移除这个
      } else {
        alert("保存失败：" + result.error);
      }
      
      return result;
  
    } catch (error) {
      alert("发生异常：" + error.message);
      return { success: false, error: error.message };
    }
  };
  