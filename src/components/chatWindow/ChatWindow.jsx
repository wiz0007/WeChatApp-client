import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import {
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaTimes,
  FaFileAlt,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import styles from "./ChatWindow.module.scss";

const SOCKET_URL = "https://wechat-server-sorq.onrender.com";
let socket;

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("wechatUser") || "null");
  const token = localStorage.getItem("wechatToken");

  // --- CONNECT SOCKET ---
  useEffect(() => {
    if (!chat || !user) return;

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      auth: { token },
    });

    socket.emit("joinRoom", { chatId: chat._id, userId: user._id });

    socket.on("message", (msg) => {
      if (msg.chatId === chat._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.on("typing", ({ chatId, userId }) => {
      if (chatId === chat._id && userId !== user._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1200);
      }
    });

    // Load chat history
    fetch(`${SOCKET_URL}/api/messages/${chat._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          setMessages(data.messages);
          scrollToBottom();
        }
      })
      .catch((err) => console.error("Load history error", err));

    return () => {
      socket.emit("leaveRoom", { chatId: chat._id, userId: user._id });
      socket.disconnect();
    };
  }, [chat?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- HANDLE TYPING ---
  const handleTyping = (val) => {
    setText(val);
    socket?.emit("typing", { chatId: chat._id, userId: user._id });
  };

  // --- FILE HANDLING ---
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // --- SEND MESSAGE ---
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !file) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append("chatId", chat._id);
    formData.append("senderId", user._id);
    if (text.trim()) formData.append("text", text.trim());
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${SOCKET_URL}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.message) {
        // Show instantly
        setMessages((prev) => [...prev, data.message]);
        socket.emit("sendMessage", data.message);
        setText("");
        removeFile();
        scrollToBottom();
      } else {
        console.error("Send failed:", data);
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.chatWindow}>
      {chat ? (
        <>
          <header className={styles.header}>
            <img
              src={chat.avatar || "/assets/default-avatar.png"}
              alt={chat.name}
              className={styles.avatar}
            />
            <h4>{chat.name}</h4>
          </header>

          <div className={styles.messages}>
            {messages.map((m) => {
              const isMine = m.senderId === user._id;
              const isRead = m.readBy && m.readBy.length > 1;
              const isFile = m.fileUrl;
              const isImage = isFile && m.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i);
              const isVideo = isFile && m.fileUrl.match(/\.(mp4|mov|webm)$/i);

              return (
                <motion.div
                  key={m._id || Math.random()}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`${styles.message} ${isMine ? styles.mine : styles.their}`}
                >
                  {isFile && (
                    <>
                      {isImage && (
                        <img
                          src={m.fileUrl}
                          alt="attachment"
                          className={styles.messageImage}
                        />
                      )}
                      {isVideo && (
                        <video
                          src={m.fileUrl}
                          controls
                          className={styles.messageVideo}
                        />
                      )}
                      {!isImage && !isVideo && (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.fileLink}
                        >
                          <FaFileAlt /> {m.fileName || "Attachment"}
                        </a>
                      )}
                    </>
                  )}
                  {m.text && <div>{m.text}</div>}
                  <div className={styles.time}>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMine && (
                      <span>
                        {isRead ? <FaCheckDouble color="#4fc3f7" /> : <FaCheck />}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {typing && (
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          {file && (
            <div className={styles.filePreviewContainer}>
              {filePreview ? (
                file.type.startsWith("image/") ? (
                  <img src={filePreview} alt="preview" />
                ) : file.type.startsWith("video/") ? (
                  <video src={filePreview} controls />
                ) : (
                  <div className={styles.fileGeneric}>
                    <FaFileAlt /> <span>{file.name}</span>
                  </div>
                )
              ) : (
                <div className={styles.fileGeneric}>
                  <FaFileAlt /> <span>{file.name}</span>
                </div>
              )}
              <button className={styles.removeFileBtn} onClick={removeFile}>
                <FaTimes />
              </button>
            </div>
          )}

          <form className={styles.inputArea} onSubmit={sendMessage}>
            <label className={styles.fileLabel}>
              <FaPaperclip />
              <input type="file" hidden onChange={handleFileSelect} />
            </label>

            <input
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              className={styles.sendButton}
              type="submit"
              disabled={isSending || (!text.trim() && !file)}
            >
              <FaPaperPlane />
            </motion.button>
          </form>
        </>
      ) : (
        <div className={styles.noChatSelected}>Select a user to start chatting</div>
      )}
    </div>
  );
};

export default ChatWindow;
