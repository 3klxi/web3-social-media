// components/UserAvatar.js
import { useNavigate } from "react-router-dom";

const UserAvatar = ({ user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user?.profile_id) return;
    navigate(`/profile/${user.profile_id}`);
  };

  return (
    <img
      className="avatar"
      src={user.pfp}
      alt="avatar"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    />
  );
};

export default UserAvatar;
