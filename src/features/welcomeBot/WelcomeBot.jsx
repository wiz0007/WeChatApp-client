import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./WelcomeBot.module.scss";

const WelcomeBot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi there! I’m WeChat Assistant." },
    { from: "bot", text: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulated bot responses
    setTimeout(() => {
      let reply = "I'm not sure what you mean 🤔";
      const lower = input.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi"))
        reply = "Hello there! 👋 How’s your day going?";
      else if (lower.includes("help"))
        reply = "I can help you get started — try selecting a chat from the left panel 💬";
      else if (lower.includes("thanks"))
        reply = "You’re welcome! 😊";
      else if (lower.includes("bye"))
        reply = "Goodbye! Have a great day 👋";

      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            className={`${styles.message} ${
              msg.from === "user" ? styles.user : styles.bot
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className={styles.inputBar}>
        <input
          type="text"
          placeholder="Type something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}>
          Send
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomeBot;
