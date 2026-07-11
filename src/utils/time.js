const presenceDateFormatter = new Intl.DateTimeFormat([], {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatLastSeen = (value) => {
  if (!value) return "Offline";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Offline";

  return `Last seen ${presenceDateFormatter.format(date)}`;
};
