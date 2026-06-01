import React, { useEffect, useMemo, useState } from "react";
import {
  FaCog,
  FaQuestionCircle,
  FaSearch,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import styles from "./ChatList.module.scss";
import api, { getAuthHeaders } from "../../api/axios";
import { HELP_BOT_CHAT } from "../../features/welcomeBot/helpBotConfig";
import { resolveAvatarUrl } from "../../utils/avatar";

const formatStatus = (user) => {
  if (user.type === "bot") return "Helper";
  if (user.isOnline) return "Online";
  if (!user.lastSeen) return "Offline";

  const date = new Date(user.lastSeen);
  return `Last seen ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ChatList = ({
  currentUser,
  onSelectChat,
  isMobile = false,
  onOpenHelper,
  onOpenProfile,
}) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem("wechatToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/chat/users", {
        headers: getAuthHeaders(),
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectUser = async (user) => {
    setShowMobileMenu(false);

    if (user.type === "bot") {
      onSelectChat?.(user);
      return;
    }

    try {
      const res = await api.post(
        "/chat/access",
        { userId: user._id },
        { headers: getAuthHeaders() }
      );
      onSelectChat?.(res.data);
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { headers: getAuthHeaders() });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("wechatToken");
      localStorage.removeItem("wechatUser");
      window.location.href = "/";
    }
  };

  const normalizedSearch = search.toLowerCase();
  const displayItems = useMemo(() => {
    const filteredUsers = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.username?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch)
    );

    return HELP_BOT_CHAT.name.toLowerCase().includes(normalizedSearch) ||
      HELP_BOT_CHAT.email.toLowerCase().includes(normalizedSearch) ||
      normalizedSearch === ""
      ? [HELP_BOT_CHAT, ...filteredUsers]
      : filteredUsers;
  }, [normalizedSearch, users]);

  return (
    <div className={styles.chatListWrapper}>
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button
            type="button"
            className={styles.mobileProfile}
            onClick={onOpenProfile}
          >
            <img src={resolveAvatarUrl(currentUser?.avatar)} alt="profile" />
          </button>
          <button
            type="button"
            className={styles.mobileBrand}
            onClick={onOpenHelper}
          >
            WeChat
          </button>
          <button
            type="button"
            className={styles.mobileSettings}
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            <FaCog />
          </button>
        </div>
      )}

      {isMobile && showMobileMenu && (
        <div className={styles.mobileMenu}>
          <button
            type="button"
            onClick={() => {
              setShowMobileMenu(false);
              onOpenHelper?.();
            }}
          >
            <FaQuestionCircle />
            <span>Open Helper</span>
          </button>
          <button type="button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      )}

      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.chatContainer}>
        {loading ? (
          <p className={styles.noUsers}>Loading chats...</p>
        ) : displayItems.length > 0 ? (
          displayItems.map((user) => (
            <div
              key={user._id}
              className={styles.chatCard}
              onClick={() => handleSelectUser(user)}
            >
              <img
                src={resolveAvatarUrl(user.avatar)}
                alt={user.name}
              />
              <div className={styles.chatDetails}>
                <div className={styles.topRow}>
                  <h4>{user.name || user.username}</h4>
                  <span
                    className={`${styles.time} ${
                      user.type === "bot"
                        ? styles.helperBadge
                        : user.isOnline
                        ? styles.onlineBadge
                        : styles.offlineBadge
                    }`}
                  >
                    {user.type === "bot"
                      ? "Helper"
                      : user.isOnline
                      ? "Online"
                      : "Offline"}
                  </span>
                </div>
                <div className={styles.bottomRow}>
                  <p>{user.type === "bot" ? user.email : formatStatus(user)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noUsers}>No users found.</p>
        )}
      </div>

      {isMobile && (
        <div className={styles.mobileFooter}>
          <button
            type="button"
            className={styles.footerItem}
            onClick={onOpenProfile}
          >
            <FaUserCircle />
            <span>{currentUser?.username || "Profile"}</span>
          </button>
          <button
            type="button"
            className={`${styles.footerItem} ${styles.footerBrand}`}
            onClick={onOpenHelper}
          >
            <span>WeChat</span>
          </button>
          <button
            type="button"
            className={styles.footerItem}
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatList;
