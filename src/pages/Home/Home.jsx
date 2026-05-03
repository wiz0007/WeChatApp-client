import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../../components/sidebar/Sidebar";
import ChatList from "../../components/chatList/ChatList";
import ChatWindow from "../../components/chatWindow/ChatWindow";
import { HELP_BOT_CHAT } from "../../features/welcomeBot/helpBotConfig";
import { buildProfileView } from "../../features/profile/profileView";
import styles from "./Home.module.scss";

const MOBILE_BREAKPOINT = 900;

const Home = () => {
  const currentUser = JSON.parse(localStorage.getItem("wechatUser") || "null");
  const profileView = buildProfileView(currentUser);
  const initialIsMobile =
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false;
  const [selectedChat, setSelectedChat] = useState(HELP_BOT_CHAT);
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  useEffect(() => {
    if (initialIsMobile) {
      setSelectedChat(null);
    }
  }, [initialIsMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showListOnMobile = isMobile && !selectedChat;
  const showChatOnMobile = isMobile && Boolean(selectedChat);

  return (
    <div className={styles.homeWrapper}>
      <motion.div
        className={`${styles.sidebarContainer} ${
          showChatOnMobile ? styles.sidebarCollapsed : ""
        }`}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Sidebar
          onSelectBot={() => setSelectedChat(HELP_BOT_CHAT)}
          onSelectProfile={() => setSelectedChat(profileView)}
        />
      </motion.div>

      <motion.div
        className={`${styles.chatListContainer} ${
          showChatOnMobile ? styles.mobileHidden : ""
        }`}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <ChatList
          onSelectChat={setSelectedChat}
          isMobile={isMobile}
          onOpenHelper={() => setSelectedChat(HELP_BOT_CHAT)}
          onOpenProfile={() => setSelectedChat(profileView)}
        />
      </motion.div>

      <motion.div
        className={`${styles.chatWindowContainer} ${
          showListOnMobile ? styles.mobileHidden : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <ChatWindow
          chat={selectedChat}
          isMobile={isMobile}
          onBack={() => setSelectedChat(null)}
        />
      </motion.div>
    </div>
  );
};

export default Home;
