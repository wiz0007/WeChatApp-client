export const buildSocialView = (tab = "discover") => ({
  _id: `social-${tab}`,
  type: "social",
  tab,
  name: "Social Hub",
  avatar: "",
});
