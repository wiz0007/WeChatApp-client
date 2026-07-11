import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaBell,
  FaCheck,
  FaGlobe,
  FaLock,
  FaPaperPlane,
  FaSearch,
  FaTimes,
  FaUserFriends,
  FaUserPlus,
  FaShieldAlt,
} from "react-icons/fa";
import {
  blockUser,
  getChatRequests,
  getBlockedUsers,
  getConnections,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  reportUser,
  respondToChatRequest,
  respondToConnection,
  searchUsersByUsername,
  sendChatRequest,
  sendConnectionRequest,
  unblockUser,
  updatePrivacySettings,
} from "../../api/socialApi";
import { resolveAvatarUrl } from "../../utils/avatar";
import { formatLastSeen } from "../../utils/time";
import styles from "./SocialHub.module.scss";

const TABS = [
  { id: "discover", label: "Discover", icon: <FaSearch /> },
  { id: "connections", label: "Connections", icon: <FaUserFriends /> },
  { id: "requests", label: "Requests", icon: <FaBell /> },
  { id: "notifications", label: "Alerts", icon: <FaBell /> },
  { id: "privacy", label: "Privacy", icon: <FaLock /> },
  { id: "safety", label: "Safety", icon: <FaShieldAlt /> },
];

const relationshipText = {
  none: "Not connected",
  connected: "Connected",
  self: "You",
  connection_request_sent: "Connection request sent",
  connection_request_received: "Wants to connect",
  rejected: "Request rejected",
  removed: "Removed",
};

const defaultPrivacy = {
  profileVisibility: "public",
  showAvatarTo: "everyone",
  showAboutTo: "everyone",
  showOnlineStatusTo: "connections",
  showLastSeenTo: "connections",
  allowConnectionRequestsFrom: "everyone",
  allowChatRequestsFrom: "everyone",
};

const UserCard = ({ user, actionSlot }) => (
  <article className={styles.userCard}>
    <img src={resolveAvatarUrl(user.avatar)} alt={user.name || user.username} />
    <div className={styles.userMain}>
      <div className={styles.userTop}>
        <div>
          <h3>{user.name || user.username}</h3>
          <p>@{user.username}</p>
        </div>
        <span className={`${styles.badge} ${styles[user.profileVisibility || "public"]}`}>
          {user.profileVisibility === "private" ? <FaLock /> : <FaGlobe />}
          {user.profileVisibility || "public"}
        </span>
      </div>
      {user.headline && <p className={styles.headline}>{user.headline}</p>}
      {user.about && <p className={styles.about}>{user.about}</p>}
      <div className={styles.metaRow}>
        <span>{relationshipText[user.relationshipStatus] || user.relationshipStatus}</span>
        <span>{user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}</span>
      </div>
      {actionSlot && <div className={styles.actions}>{actionSlot}</div>}
    </div>
  </article>
);

const RequestCard = ({ request, type, onAccept, onDecline }) => (
  <article className={styles.requestCard}>
    <img src={resolveAvatarUrl(request.user?.avatar)} alt={request.user?.name || "User"} />
    <div>
      <h3>{request.user?.name || request.user?.username}</h3>
      <p>@{request.user?.username}</p>
      {request.messagePreview && <p className={styles.preview}>{request.messagePreview}</p>}
      <span className={styles.statusLine}>{request.status}</span>
    </div>
    {request.status === "pending" && (
      <div className={styles.requestActions}>
        <button type="button" onClick={() => onAccept(request._id)}>
          <FaCheck />
        </button>
        <button type="button" onClick={() => onDecline(request._id)}>
          <FaTimes />
        </button>
      </div>
    )}
    {type === "sent" && <span className={styles.sentLabel}>Sent</span>}
  </article>
);

const SocialHub = ({ initialTab = "discover", currentUser }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [chatInbox, setChatInbox] = useState([]);
  const [chatSent, setChatSent] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [privacy, setPrivacy] = useState(defaultPrivacy);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!currentUser) return;
    setPrivacy({
      ...defaultPrivacy,
      profileVisibility: currentUser.profileVisibility || defaultPrivacy.profileVisibility,
      ...(currentUser.privacy || {}),
    });
  }, [currentUser]);

  const fetchConnections = async () => {
    const [accepted, pending] = await Promise.all([
      getConnections("accepted"),
      getConnections("pending"),
    ]);
    setConnections(accepted.data.connections || []);
    setConnectionRequests(
      (pending.data.connections || []).filter((item) => item.direction === "received")
    );
  };

  const fetchChatRequests = async () => {
    const [inbox, sent] = await Promise.all([
      getChatRequests("inbox"),
      getChatRequests("sent"),
    ]);
    setChatInbox(inbox.data.requests || []);
    setChatSent(sent.data.requests || []);
  };

  const fetchBlockedUsers = async () => {
    const res = await getBlockedUsers();
    setBlockedUsers(res.data.blocks || []);
  };

  const fetchNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data.notifications || []);
    setUnreadCount(res.data.unreadCount || 0);
  };

  useEffect(() => {
    if (activeTab === "connections") {
      fetchConnections().catch(() => toast.error("Failed to load connections"));
    }
    if (activeTab === "requests") {
      Promise.all([fetchConnections(), fetchChatRequests()]).catch(() =>
        toast.error("Failed to load requests")
      );
    }
    if (activeTab === "safety") {
      fetchBlockedUsers().catch(() => toast.error("Failed to load blocked users"));
    }
    if (activeTab === "notifications") {
      fetchNotifications().catch(() => toast.error("Failed to load notifications"));
    }
  }, [activeTab]);

  const handleSearch = async (event) => {
    event?.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      toast.error("Enter at least 2 username characters");
      return;
    }

    try {
      setSearching(true);
      const res = await searchUsersByUsername(cleanQuery);
      setSearchResults(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleConnectionRequest = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      toast.success("Connection request sent");
      handleSearch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send request");
    }
  };

  const handleChatRequest = async (userId) => {
    try {
      await sendChatRequest(userId, "Hi, I would like to chat with you.");
      toast.success("Chat request sent");
      handleSearch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send chat request");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      toast.success("User blocked");
      setSearchResults((prev) => prev.filter((user) => user._id !== userId));
      fetchBlockedUsers().catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      toast.success("User unblocked");
      fetchBlockedUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not unblock user");
    }
  };

  const handleReportUser = async (userId) => {
    try {
      await reportUser(userId, "other", "Reported from Social Hub");
      toast.success("Report submitted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit report");
    }
  };

  const handleConnectionResponse = async (connectionId, action) => {
    try {
      await respondToConnection(connectionId, action);
      toast.success(action === "accept" ? "Connection accepted" : "Connection rejected");
      fetchConnections();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update connection");
    }
  };

  const handleChatResponse = async (requestId, action) => {
    try {
      await respondToChatRequest(requestId, action);
      toast.success(action === "accept" ? "Chat request accepted" : "Chat request declined");
      fetchChatRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update chat request");
    }
  };

  const savePrivacy = async () => {
    try {
      setSavingPrivacy(true);
      await updatePrivacySettings(privacy);
      toast.success("Privacy settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save privacy");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const markOneNotificationRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update notification");
    }
  };

  const markNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update notifications");
    }
  };

  const requestCount = useMemo(
    () =>
      connectionRequests.filter((item) => item.status === "pending").length +
      chatInbox.filter((item) => item.status === "pending").length,
    [connectionRequests, chatInbox]
  );

  return (
    <div className={styles.socialHub}>
      <header className={styles.header}>
        <div>
          <span>Social Network</span>
          <h2>Discover, connect, and request chats</h2>
        </div>
        <div className={styles.headerPill}>
          {requestCount} pending · {unreadCount} unread
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? styles.activeTab : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {activeTab === "discover" && (
          <section className={styles.panel}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <FaSearch />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search unique username"
              />
              <button type="submit" disabled={searching}>
                {searching ? "Searching" : "Search"}
              </button>
            </form>

            <div className={styles.resultList}>
              {searchResults.length === 0 ? (
                <div className={styles.emptyState}>Search by username to find people.</div>
              ) : (
                searchResults.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    actionSlot={
                      <>
                        {user.canSendConnectionRequest && (
                          <button type="button" onClick={() => handleConnectionRequest(user._id)}>
                            <FaUserPlus />
                            Connect
                          </button>
                        )}
                        {user.canSendChatRequest && (
                          <button type="button" onClick={() => handleChatRequest(user._id)}>
                            <FaPaperPlane />
                            Chat request
                          </button>
                        )}
                        <button type="button" onClick={() => handleReportUser(user._id)}>
                          <FaShieldAlt />
                          Report
                        </button>
                        <button type="button" onClick={() => handleBlockUser(user._id)}>
                          <FaLock />
                          Block
                        </button>
                      </>
                    }
                  />
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "connections" && (
          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <h3>Your Connections</h3>
              <p>Accepted relationships unlock private profile details and direct trust.</p>
            </div>
            <div className={styles.resultList}>
              {connections.length === 0 ? (
                <div className={styles.emptyState}>No accepted connections yet.</div>
              ) : (
                connections.map((connection) => (
                  <UserCard key={connection._id} user={connection.user} />
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "requests" && (
          <section className={styles.requestGrid}>
            <div className={styles.panel}>
              <div className={styles.sectionHeader}>
                <h3>Connection Requests</h3>
                <p>Accept people into your trusted network.</p>
              </div>
              <div className={styles.resultList}>
                {connectionRequests.length === 0 ? (
                  <div className={styles.emptyState}>No connection requests.</div>
                ) : (
                  connectionRequests.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      onAccept={(id) => handleConnectionResponse(id, "accept")}
                      onDecline={(id) => handleConnectionResponse(id, "reject")}
                    />
                  ))
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.sectionHeader}>
                <h3>Chat Requests</h3>
                <p>Approve conversations before they enter your inbox.</p>
              </div>
              <div className={styles.resultList}>
                {chatInbox.length === 0 ? (
                  <div className={styles.emptyState}>No chat requests.</div>
                ) : (
                  chatInbox.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      onAccept={(id) => handleChatResponse(id, "accept")}
                      onDecline={(id) => handleChatResponse(id, "decline")}
                    />
                  ))
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.sectionHeader}>
                <h3>Sent Chat Requests</h3>
                <p>Track pending outreach.</p>
              </div>
              <div className={styles.resultList}>
                {chatSent.length === 0 ? (
                  <div className={styles.emptyState}>No sent chat requests.</div>
                ) : (
                  chatSent.map((request) => (
                    <RequestCard key={request._id} request={request} type="sent" />
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "privacy" && (
          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <h3>Visibility Controls</h3>
              <p>Choose who can discover details, see presence, and request access.</p>
            </div>
            <div className={styles.privacyGrid}>
              <label>
                Profile visibility
                <select
                  value={privacy.profileVisibility}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, profileVisibility: event.target.value }))
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
              <label>
                Avatar visible to
                <select
                  value={privacy.showAvatarTo}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, showAvatarTo: event.target.value }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections</option>
                  <option value="none">No one</option>
                </select>
              </label>
              <label>
                About visible to
                <select
                  value={privacy.showAboutTo}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, showAboutTo: event.target.value }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections</option>
                  <option value="none">No one</option>
                </select>
              </label>
              <label>
                Online status visible to
                <select
                  value={privacy.showOnlineStatusTo}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, showOnlineStatusTo: event.target.value }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections</option>
                  <option value="none">No one</option>
                </select>
              </label>
              <label>
                Last seen visible to
                <select
                  value={privacy.showLastSeenTo}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, showLastSeenTo: event.target.value }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections</option>
                  <option value="none">No one</option>
                </select>
              </label>
              <label>
                Connection requests from
                <select
                  value={privacy.allowConnectionRequestsFrom}
                  onChange={(event) =>
                    setPrivacy((prev) => ({
                      ...prev,
                      allowConnectionRequestsFrom: event.target.value,
                    }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="none">No one</option>
                </select>
              </label>
              <label>
                Chat requests from
                <select
                  value={privacy.allowChatRequestsFrom}
                  onChange={(event) =>
                    setPrivacy((prev) => ({ ...prev, allowChatRequestsFrom: event.target.value }))
                  }
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections</option>
                  <option value="none">No one</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className={styles.saveButton}
              onClick={savePrivacy}
              disabled={savingPrivacy}
            >
              {savingPrivacy ? "Saving..." : "Save privacy"}
            </button>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className={styles.panel}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.sectionHeader}>
                <h3>Notifications</h3>
                <p>Track requests, approvals, and relationship changes.</p>
              </div>
              <button type="button" onClick={markNotificationsRead}>
                Mark all read
              </button>
            </div>
            <div className={styles.resultList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>No notifications yet.</div>
              ) : (
                notifications.map((notification) => (
                  <article
                    key={notification._id}
                    className={`${styles.notificationCard} ${
                      notification.isRead ? styles.readNotification : ""
                    }`}
                  >
                    <img
                      src={resolveAvatarUrl(notification.actorId?.avatar)}
                      alt={notification.actorId?.name || "Notification"}
                    />
                    <div>
                      <h3>{notification.title}</h3>
                      <p>{notification.body}</p>
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markOneNotificationRead(notification._id)}
                      >
                        Read
                      </button>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "safety" && (
          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <h3>Blocked Users</h3>
              <p>Blocked users cannot discover you, request access, or continue chats.</p>
            </div>
            <div className={styles.resultList}>
              {blockedUsers.length === 0 ? (
                <div className={styles.emptyState}>No blocked users.</div>
              ) : (
                blockedUsers.map((block) => (
                  <UserCard
                    key={block._id}
                    user={block.user}
                    actionSlot={
                      <button type="button" onClick={() => handleUnblockUser(block.user._id)}>
                        <FaCheck />
                        Unblock
                      </button>
                    }
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SocialHub;
