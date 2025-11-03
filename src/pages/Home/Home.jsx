import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../../components/sidebar/Sidebar";
import ChatList from "../../components/chatList/ChatList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import WelcomeBot from "../../features/welcomeBot/Welcomebot";// 👈 new import
import styles from "./Home.module.scss";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className={styles.homeWrapper}>
      <motion.div
        className={styles.sidebarContainer}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Sidebar />
      </motion.div>

      <motion.div
        className={styles.chatListContainer}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <ChatList onSelectChat={setSelectedChat} />
      </motion.div>

      <motion.div
        className={styles.chatWindowContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <WelcomeBot /> // 👈 new default view
        )}
      </motion.div>
    </div>
  );
};

export default Home;
