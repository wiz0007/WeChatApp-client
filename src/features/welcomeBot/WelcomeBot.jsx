import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import styles from "./WelcomeBot.module.scss";

const FAQS = [
  {
    label: "How do I start a chat?",
    reply: "Choose any signed-in user from the left panel. A chat room opens automatically the first time you click them.",
  },
  {
    label: "Who appears in the list?",
    reply: "Only users who are currently signed in are shown here, plus this helper bot for quick guidance.",
  },
  {
    label: "How do I send files?",
    reply: "Open a user chat, use the paperclip button, choose a file, and then send it like a normal message.",
  },
  {
    label: "I forgot my password",
    reply: "Go back to the login page, open Forgot Password, and use the reset link sent to your email.",
  },
];

const findReply = (input) => {
  const lower = input.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello. I can help with chats, sign-in flow, file sending, and password recovery.";
  }

  if (lower.includes("register") || lower.includes("signup") || lower.includes("sign up")) {
    return "Register with your name, username, email, and password. After signup, you can log in directly.";
  }

  if (lower.includes("login") || lower.includes("sign in")) {
    return "Use your verified email and password on the login page. Once signed in, you will appear in the signed-in users list.";
  }

  if (lower.includes("file") || lower.includes("image") || lower.includes("attachment")) {
    return "Inside a chat, click the paperclip icon, choose your file, and press send.";
  }

  if (lower.includes("password") || lower.includes("reset") || lower.includes("forgot")) {
    return "Use Forgot Password from the login screen. The app will email you a secure reset link.";
  }

  if (lower.includes("logout") || lower.includes("sign out")) {
    return "Use the logout button in the sidebar. That also removes you from the signed-in users list.";
  }

  if (lower.includes("user") || lower.includes("online") || lower.includes("signed in")) {
    return "The chat list shows users who are currently signed in, so you can quickly start conversations with active people.";
  }

  return "I can answer basic questions about login, registration, password reset, file sharing, logout, and starting chats.";
};

const WelcomeBot = () => {
  const starterMessages = useMemo(
    () => [
      { from: "bot", text: "Hi, I am WeChat Helper." },
      { from: "bot", text: "Ask me about login, registration, password reset, or chatting with signed-in users." },
    ],
    []
  );

  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");

  const sendBotMessage = (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: cleanQuestion },
      { from: "bot", text: findReply(cleanQuestion) },
    ]);
    setInput("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatBox}>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.from}-${index}`}
            className={`${styles.message} ${
              message.from === "user" ? styles.user : styles.bot
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {message.text}
          </motion.div>
        ))}
      </div>

      <div className={styles.inputBar}>
        <input
          type="text"
          placeholder="Ask a quick question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendBotMessage(input);
            }
          }}
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendBotMessage(input)}>
          Send
        </motion.button>
      </div>

      <div className={styles.chatBox}>
        {FAQS.map((faq) => (
          <motion.button
            key={faq.label}
            whileTap={{ scale: 0.98 }}
            className={styles.message}
            onClick={() => sendBotMessage(faq.label)}
          >
            {faq.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeBot;
