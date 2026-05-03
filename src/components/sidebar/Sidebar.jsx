import React from "react";
import { motion } from "framer-motion";
import {
  FaCommentDots,
  FaUsers,
  FaCog,
  FaCircle,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import styles from "./Sidebar.module.scss";
import api, { getAuthHeaders } from "../../api/axios";

const Sidebar = ({ onSelectBot, onSelectProfile }) => {
  const icons = [
    { id: 1, icon: <FaCommentDots />, label: "Chats" },
    { id: 2, icon: <FaUsers />, label: "Groups" },
    { id: 3, icon: <FaBell />, label: "Notifications" },
    { id: 4, icon: <FaCog />, label: "Settings" },
  ];

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

  return (
    <motion.aside
      className={styles.sidebar}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.logo}>
        <FaCircle className={styles.logoIcon} />
      </div>

      <nav className={styles.nav}>
        {icons.map((item, idx) => (
          <motion.div
            key={item.id}
            className={styles.iconWrapper}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={item.id === 1 ? onSelectBot : undefined}
          >
            {item.icon}
            <span className={styles.tooltip}>{item.label}</span>
          </motion.div>
        ))}
      </nav>

      <motion.div
        className={styles.profile}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        onClick={onSelectProfile}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="profile"
        />
      </motion.div>

      <motion.div
        className={styles.iconWrapper}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        <span className={styles.tooltip}>Logout</span>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
