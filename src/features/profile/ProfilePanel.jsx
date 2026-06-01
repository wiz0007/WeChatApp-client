import React, { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaImage,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaUserEdit,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import api, { API_URL, getAuthHeaders } from "../../api/axios";
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

const ProfilePanel = ({ profile, onProfileUpdated }) => {
  const [form, setForm] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    email: profile?.email || "",
    avatar: profile?.avatar || "",
    about: profile?.about || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      username: profile?.username || "",
      email: profile?.email || "",
      avatar: profile?.avatar || "",
      about: profile?.about || "",
    });
    setAvatarFile(null);
    setAvatarPreview("");
  }, [profile]);

  const cards = [
    {
      icon: <FaUserEdit />,
      title: "Editable Profile",
      text: "Update your identity details here and keep the chat app in sync instantly.",
    },
    {
      icon: <FaBell />,
      title: "Notifications",
      text: "This section can later connect to custom message and mention preferences.",
    },
    {
      icon: <FaLock />,
      title: "Privacy",
      text: "You can grow this into status visibility, blocked users, and contact permissions.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Security",
      text: "A future step can add password change, device history, and session management.",
    },
  ];

  const resolvedAvatar = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (form.avatar?.startsWith("/uploads/")) return `${API_URL}${form.avatar}`;
    if (form.avatar) return form.avatar;
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }, [avatarPreview, form.avatar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("avatar", form.avatar);
      formData.append("about", form.about);
      if (avatarFile) {
        formData.append("avatarFile", avatarFile);
      }

      const res = await api.put("/auth/profile", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data?.message || "Profile updated");
      onProfileUpdated?.(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.profilePanel}>
      <section className={styles.hero}>
        <div className={styles.heroAvatar}>
          <img src={resolvedAvatar} alt={form.name || "Profile"} />
        </div>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Profile</span>
          <h2>{form.name || "Your Profile"}</h2>
          <p>{formatPresence(profile)}</p>
        </div>
      </section>

      <form className={styles.formSection} onSubmit={handleSave}>
        <div className={styles.sectionHeader}>
          <h3>Edit Account</h3>
          <p>Change your visible identity details, upload an avatar image, and save them without leaving the app.</p>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Full Name</span>
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label className={styles.field}>
            <span>Username</span>
            <input name="username" value={form.username} onChange={handleChange} />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </label>
          <label className={styles.field}>
            <span>Avatar URL (optional)</span>
            <input name="avatar" value={form.avatar} onChange={handleChange} />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Upload Avatar</span>
            <label className={styles.uploadBox}>
              <FaImage />
              <span>{avatarFile ? avatarFile.name : "Choose an image file"}</span>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} hidden />
            </label>
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Status / About</span>
            <textarea
              name="about"
              rows={3}
              value={form.about}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={saving}>
            <FaSave />
            <span>{saving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </form>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Account Overview</h3>
          <p>This area can keep growing into a complete settings and identity workspace.</p>
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
