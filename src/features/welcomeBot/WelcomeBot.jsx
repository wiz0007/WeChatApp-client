import React, { useMemo, useRef, useState } from "react";
import {
  FaBolt,
  FaLock,
  FaPaperPlane,
  FaPaperclip,
  FaQuestionCircle,
  FaUserPlus,
} from "react-icons/fa";
import styles from "./WelcomeBot.module.scss";

const FAQS = [
  {
    icon: <FaUserPlus />,
    label: "How do I start a chat?",
    reply: "Open Discover, search the person by unique username, then send a chat request or connection request. A chat opens after the request is accepted.",
  },
  {
    icon: <FaBolt />,
    label: "Who appears in the list?",
    reply: "The chat list shows approved people only: accepted connections or accepted chat requests.",
  },
  {
    icon: <FaPaperclip />,
    label: "How do I send files?",
    reply: "Open a user chat, use the paperclip button, choose a file, and then send it like a normal message.",
  },
  {
    icon: <FaLock />,
    label: "I forgot my password",
    reply: "Go back to the login page, open Forgot Password, and use the reset link sent to your email.",
  },
];

const findReply = (input) => {
  const lower = input.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello. I can help you start chats, understand online status, send attachments, recover your password, or update your profile.";
  }

  if (lower.includes("register") || lower.includes("signup") || lower.includes("sign up")) {
    return "Register with your name, username, email, and password. After signup, use the same email and password to log in.";
  }

  if (lower.includes("login") || lower.includes("sign in")) {
    return "Use your registered email and password on the login page. Once signed in, your status changes to online for other users.";
  }

  if (lower.includes("file") || lower.includes("image") || lower.includes("attachment")) {
    return "Inside a chat, click the paperclip icon, choose an attachment, preview it, and press send.";
  }

  if (lower.includes("password") || lower.includes("reset") || lower.includes("forgot")) {
    return "Use Forgot Password from the login screen. The app will email you a secure reset link.";
  }

  if (lower.includes("logout") || lower.includes("sign out")) {
    return "Use the logout button in the sidebar. That also removes you from the signed-in users list.";
  }

  if (lower.includes("profile") || lower.includes("avatar") || lower.includes("about")) {
    return "Open your profile from the sidebar avatar. You can update your name, username, email, avatar, and about text there.";
  }

  if (lower.includes("discover") || lower.includes("search") || lower.includes("username")) {
    return "Use Discover to search people by unique username. Public profiles show more details, while private profiles reveal only what their privacy settings allow.";
  }

  if (lower.includes("connection") || lower.includes("request")) {
    return "A connection request builds your trusted network. A chat request asks permission to start messaging without making a full connection.";
  }

  if (lower.includes("user") || lower.includes("online") || lower.includes("signed in")) {
    return "The list shows verified users and their current presence. Offline users show their last seen date and time.";
  }

  return "I can help with Discover, username search, chat requests, connections, privacy, files, profile updates, logout, status, and password reset.";
};

const WelcomeBot = () => {
  const inputRef = useRef(null);
  const starterMessages = useMemo(
    () => [
      { from: "bot", text: "Hi, I am WeChat Helper. What would you like to do?" },
      { from: "bot", text: "Try a quick action below, or ask about Discover, chat requests, connections, privacy, files, profile, status, or password reset." },
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
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.assistantPanel}>
        <div className={styles.helperIntro}>
          <div className={styles.helperIcon}>
            <FaQuestionCircle />
          </div>
          <div>
            <span>Quick Help</span>
            <p>Ask anything about using this chat app.</p>
          </div>
        </div>

        <div className={styles.chatBox}>
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              className={`${styles.message} ${
                message.from === "user" ? styles.user : styles.bot
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.helperDock}>
        <div className={styles.quickActions}>
          {FAQS.map((faq) => (
            <button
              key={faq.label}
              className={styles.quickAction}
              type="button"
              onClick={() => sendBotMessage(faq.label)}
            >
              <span>{faq.icon}</span>
              {faq.label}
            </button>
          ))}
        </div>

        <div className={styles.inputBar}>
          <input
            ref={inputRef}
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
          <button
            onClick={() => sendBotMessage(input)}
            type="button"
            aria-label="Send helper message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBot;
