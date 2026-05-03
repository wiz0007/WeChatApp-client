import React from "react";
import {
  FaBell,
  FaLock,
  FaShieldAlt,
  FaUserCircle,
  FaUserEdit,
} from "react-icons/fa";
import styles from "./ProfilePanel.module.scss";

const formatPresence = (profile) => {
  if (profile?.isOnline) return "Online now";
  if (!profile?.lastSeen) return "Offline";

  const date = new Date(profile.lastSeen);
  return `Last seen ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ProfilePanel = ({ profile }) => {
  const cards = [
    {
      icon: <FaUserEdit />,
      title: "Personal Info",
      text: "Keep your display name and username recognizable for chats and contact search.",
    },
    {
      icon: <FaBell />,
      title: "Notifications",
      text: "Control how your account responds to new messages, mentions, and activity.",
    },
    {
      icon: <FaLock />,
      title: "Privacy",
      text: "Review profile visibility, presence details, and who can reach you.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Security",
      text: "Maintain account protection with strong credentials and recovery options.",
    },
  ];

  return (
    <div className={styles.profilePanel}>
      <section className={styles.hero}>
        <div className={styles.heroAvatar}>
          <FaUserCircle />
        </div>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Profile</span>
          <h2>{profile?.name}</h2>
          <p>{formatPresence(profile)}</p>
        </div>
      </section>

      <section className={styles.detailsGrid}>
        <article className={styles.detailCard}>
          <span className={styles.label}>Full Name</span>
          <strong>{profile?.name}</strong>
        </article>
        <article className={styles.detailCard}>
          <span className={styles.label}>Username</span>
          <strong>@{profile?.username}</strong>
        </article>
        <article className={styles.detailCard}>
          <span className={styles.label}>Email</span>
          <strong>{profile?.email}</strong>
        </article>
        <article className={styles.detailCard}>
          <span className={styles.label}>Presence</span>
          <strong>{formatPresence(profile)}</strong>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Account Overview</h3>
          <p>Your profile section acts like a clean settings hub for identity, privacy, and security.</p>
        </div>

        <div className={styles.cards}>
          {cards.map((card) => (
            <article key={card.title} className={styles.infoCard}>
              <div className={styles.iconWrap}>{card.icon}</div>
              <div>
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePanel;
