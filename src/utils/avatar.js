import { API_URL } from "../api/axios";

export const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export const resolveAvatarUrl = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR;

  if (
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:") ||
    avatar.startsWith("http://") ||
    avatar.startsWith("https://")
  ) {
    return avatar;
  }

  if (avatar.startsWith("/uploads/")) {
    return `${API_URL}${avatar}`;
  }

  if (avatar.startsWith("uploads/")) {
    return `${API_URL}/${avatar}`;
  }

  return avatar;
};
