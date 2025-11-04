import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./ChatList.module.scss";

const ChatList = ({ onSelectChat }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users (shared logic)
  const fetchUsers = async () => {
    const token = localStorage.getItem("wechatToken");
    if (!token) {
      console.error("❌ No token found — user might not be logged in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://wechat-server-sorq.onrender.com/api/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Fetch failed with status:", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const currentUser = JSON.parse(localStorage.getItem("wechatUser") || "{}");

      const filtered = Array.isArray(data)
        ? data.filter((u) => u._id !== currentUser?._id)
        : [];

      setUsers(filtered);
      setFilteredUsers(
        filtered.filter(
          (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        )
      );
    } catch (err) {
      console.error("⚠️ Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch once on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // 30s interval

    return () => clearInterval(interval); // cleanup on unmount
  }, [search]);

  // ✅ Handle search locally
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(value) ||
          u.username?.toLowerCase().includes(value) ||
          u.email?.toLowerCase().includes(value)
      )
    );
  };

  return (
    <div className={styles.chatListWrapper}>
      {/* 🔍 Search Bar */}
      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search or start a new chat"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* 💬 Chat List */}
      <div className={styles.chatContainer}>
        {loading ? (
          <p className={styles.noUsers}>Loading users...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className={styles.chatCard}
              onClick={() => onSelectChat?.(user)}
            >
              <img
                src={
                  user.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={user.name}
              />
              <div className={styles.chatDetails}>
                <div className={styles.topRow}>
                  <h4>{user.name || user.username}</h4>
                  <span className={styles.time}>Online</span>
                </div>
                <div className={styles.bottomRow}>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noUsers}>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
