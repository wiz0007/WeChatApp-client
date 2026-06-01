export const buildProfileView = (user) => ({
  _id: "profile-view",
  type: "profile",
  name: user?.name || "Your Profile",
  username: user?.username || "username",
  email: user?.email || "email@example.com",
  avatar: user?.avatar || "",
  about: user?.about || "Available on WeChat",
  isOnline: user?.isOnline ?? true,
  lastSeen: user?.lastSeen || null,
});
