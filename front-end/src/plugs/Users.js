import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then((res) => res.json())
      .then((data) => {
        console.log('用户数据:', data);
        setUsers(data);
      })
      .catch((err) => console.error('❌ 获取用户失败:', err));
  }, []);

  return (
    <div>
      <h2>用户列表</h2>
      <ul> 
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
