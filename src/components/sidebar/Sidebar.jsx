import React from "react";
import { motion } from "framer-motion";
import {
  FaCommentDots,
  FaUsers,
  FaCog,
  FaCircle,
  FaBell,
} from "react-icons/fa";
import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const icons = [
    { id: 1, icon: <FaCommentDots />, label: "Chats" },
    { id: 2, icon: <FaUsers />, label: "Groups" },
    { id: 3, icon: <FaBell />, label: "Notifications" },
    { id: 4, icon: <FaCog />, label: "Settings" },
  ];

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
      >
        <img src="/assets/avatar.png" alt="profile" />
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
