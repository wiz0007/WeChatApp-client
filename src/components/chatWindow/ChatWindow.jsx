import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaPaperclip,
  FaTimes,
  FaFileAlt,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import styles from "./ChatWindow.module.scss";
import { API_URL, getAuthHeaders } from "../../api/axios";
import WelcomeBot from "../../features/welcomeBot/WelcomeBot";
import ProfilePanel from "../../features/profile/ProfilePanel";

const SOCKET_URL = API_URL;
let socket;

const formatPresence = (participant) => {
  if (!participant) return "";
  if (participant.isOnline) return "online";
  if (!participant.lastSeen) return "offline";

  const date = new Date(participant.lastSeen);
  return `last seen ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ChatWindow = ({ chat, isMobile = false, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("wechatUser") || "null");
  const token = localStorage.getItem("wechatToken");
  const otherParticipant = chat?.participants?.find(
    (participant) => participant._id !== user?._id
  );
  const chatName = otherParticipant?.name || chat?.name || "Chat";
  const presenceText = chat?.type === "bot" ? "help assistant" : formatPresence(otherParticipant);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const mergeReadReceipts = (updatedIds, readByUserId) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (!updatedIds.includes(message._id)) return message;

        const alreadyRead = (message.readBy || []).some((reader) => {
          const id = typeof reader === "object" ? reader?._id : reader;
          return String(id) === String(readByUserId);
        });

        if (alreadyRead) return message;

        return {
          ...message,
          readBy: [...(message.readBy || []), readByUserId],
        };
      })
    );
  };

  const mergeDeliveryReceipts = (updatedIds, deliveredToUserId) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (!updatedIds.includes(message._id)) return message;

        const alreadyDelivered = (message.deliveredTo || []).some((reader) => {
          const id = typeof reader === "object" ? reader?._id : reader;
          return String(id) === String(deliveredToUserId);
        });

        if (alreadyDelivered) return message;

        return {
          ...message,
          deliveredTo: [...(message.deliveredTo || []), deliveredToUserId],
        };
      })
    );
  };

  const markCurrentChatAsDelivered = async (chatId) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/messages/${chatId}/delivered`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (data.success && data.updatedIds?.length) {
        mergeDeliveryReceipts(data.updatedIds, data.deliveredToUserId);
        socket?.emit("messagesDelivered", {
          chatId,
          updatedIds: data.updatedIds,
          deliveredToUserId: data.deliveredToUserId,
        });
      }
    } catch (err) {
      console.error("Delivery receipt sync error:", err);
    }
  };

  const markCurrentChatAsRead = async (chatId) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/messages/${chatId}/read`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (data.success && data.updatedIds?.length) {
        mergeReadReceipts(data.updatedIds, data.readByUserId);
        socket?.emit("messagesRead", {
          chatId,
          updatedIds: data.updatedIds,
          readByUserId: data.readByUserId,
        });
      }
    } catch (err) {
      console.error("Read receipt sync error:", err);
    }
  };

  useEffect(() => {
    if (chat?.type === "bot") {
      return;
    }

    if (!chat?._id || !user || !token) return;

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      auth: { token },
    });

    socket.emit("joinRoom", { chatId: chat._id, userId: user._id });

    socket.on("message", (message) => {
      if (message.chatId === chat._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        setTimeout(() => {
          markCurrentChatAsDelivered(chat._id);
          markCurrentChatAsRead(chat._id);
        }, 50);
      }
    });

    socket.on("typing", ({ chatId, userId }) => {
      if (chatId === chat._id && userId !== user._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1200);
      }
    });

    socket.on("messagesRead", ({ chatId, updatedIds, readByUserId }) => {
      if (chatId === chat._id) {
        mergeReadReceipts(updatedIds, readByUserId);
      }
    });

    socket.on("messagesDelivered", ({ chatId, updatedIds, deliveredToUserId }) => {
      if (chatId === chat._id) {
        mergeDeliveryReceipts(updatedIds, deliveredToUserId);
      }
    });

    fetch(`${SOCKET_URL}/api/messages/${chat._id}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 50);
          setTimeout(() => {
            markCurrentChatAsDelivered(chat._id);
            markCurrentChatAsRead(chat._id);
          }, 80);
        }
      })
      .catch((err) => console.error("Load history error", err));

    return () => {
      socket.emit("leaveRoom", { chatId: chat._id, userId: user._id });
      socket.disconnect();
      setMessages([]);
      setText("");
      setFile(null);
      setFilePreview(null);
    };
  }, [chat?._id, chat?.type, token, user?._id]);

  const handleTyping = (value) => {
    setText(value);
    socket?.emit("typing", { chatId: chat._id, userId: user._id });
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    if (
      selectedFile.type.startsWith("image/") ||
      selectedFile.type.startsWith("video/")
    ) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !file) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append("chatId", chat._id);
    if (text.trim()) formData.append("text", text.trim());
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${SOCKET_URL}/api/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.message) {
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

  if (!chat) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.noChatSelected}>Select a user to start chatting</div>
      </div>
    );
  }

  if (chat?.type === "bot") {
    return (
      <div className={styles.chatWindow}>
        <header className={styles.header}>
          {isMobile && (
            <button className={styles.backButton} onClick={onBack} type="button">
              <FaArrowLeft />
            </button>
          )}
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt={chat.name}
            className={styles.avatar}
          />
          <div className={styles.headerCopy}>
            <h4>{chat.name}</h4>
            <p>{presenceText}</p>
          </div>
        </header>
        <WelcomeBot />
      </div>
    );
  }

  if (chat?.type === "profile") {
    return (
      <div className={styles.chatWindow}>
        <header className={styles.header}>
          {isMobile && (
            <button className={styles.backButton} onClick={onBack} type="button">
              <FaArrowLeft />
            </button>
          )}
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt={chat.name}
            className={styles.avatar}
          />
          <div className={styles.headerCopy}>
            <h4>{chat.name}</h4>
            <p>account section</p>
          </div>
        </header>
        <ProfilePanel profile={chat} />
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      <header className={styles.header}>
        {isMobile && (
          <button className={styles.backButton} onClick={onBack} type="button">
            <FaArrowLeft />
          </button>
        )}
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt={chatName}
          className={styles.avatar}
        />
        <div className={styles.headerCopy}>
          <h4>{chatName}</h4>
          <p>{presenceText}</p>
        </div>
      </header>

      <div className={styles.messages}>
        {messages.map((message) => {
          const senderId =
            typeof message.senderId === "object"
              ? message.senderId?._id
              : message.senderId;
          const isMine = senderId === user._id;
          const isDelivered =
            (message.deliveredTo || []).filter((reader) => {
              const id = typeof reader === "object" ? reader?._id : reader;
              return String(id) !== String(user._id);
            }).length > 0;
          const isRead = message.readBy && message.readBy.length > 1;
          const isFile = Boolean(message.fileUrl);
          const attachmentUrl = isFile ? `${SOCKET_URL}${message.fileUrl}` : null;
          const isImage =
            isFile && message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const isVideo =
            isFile && message.fileUrl.match(/\.(mp4|mov|webm|mkv)$/i);

          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`${styles.message} ${isMine ? styles.mine : styles.their}`}
            >
              {isFile && (
                <>
                  {isImage && (
                    <img
                      src={attachmentUrl}
                      alt="attachment"
                      className={styles.messageImage}
                    />
                  )}
                  {isVideo && (
                    <video
                      src={attachmentUrl}
                      controls
                      className={styles.messageVideo}
                    />
                  )}
                  {!isImage && !isVideo && (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.fileLink}
                    >
                      <FaFileAlt /> {message.fileName || "Attachment"}
                    </a>
                  )}
                </>
              )}

              {message.text && <div>{message.text}</div>}

              <div className={styles.time}>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {isMine && (
                  <span className={styles.receipt}>
                    {isRead ? (
                      <FaCheckDouble color="#7bdff2" />
                    ) : isDelivered ? (
                      <FaCheckDouble />
                    ) : (
                      <FaCheck />
                    )}
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
    </div>
  );
};

export default ChatWindow;
