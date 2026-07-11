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
import { resolveAvatarUrl } from "../../utils/avatar";

const Sidebar = ({
  currentUser,
  onSelectBot,
  onSelectProfile,
  onOpenDiscover,
  onOpenRequests,
  onOpenPrivacy,
}) => {
  const icons = [
    { id: 1, icon: <FaCommentDots />, label: "Helper", onClick: onSelectBot },
    { id: 2, icon: <FaUsers />, label: "Discover", onClick: onOpenDiscover },
    { id: 3, icon: <FaBell />, label: "Requests", onClick: onOpenRequests },
    { id: 4, icon: <FaCog />, label: "Privacy", onClick: onOpenPrivacy },
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
        {icons.map((item) => (
          <motion.div
            key={item.id}
            className={styles.iconWrapper}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={item.onClick}
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
          src={resolveAvatarUrl(currentUser?.avatar)}
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
