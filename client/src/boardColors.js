export const BOARD_PALETTE = [
  { surface: "#ffffff", tile: "#0079bf", accent: "#0079bf" },
  { surface: "#ffffff", tile: "#d29034", accent: "#d29034" },
  { surface: "#ffffff", tile: "#519839", accent: "#519839" },
  { surface: "#ffffff", tile: "#b04632", accent: "#b04632" },
  { surface: "#ffffff", tile: "#89609e", accent: "#89609e" },
  { surface: "#ffffff", tile: "#cd5a91", accent: "#cd5a91" },
  { surface: "#ffffff", tile: "#00aecc", accent: "#00aecc" },
  { surface: "#ffffff", tile: "#61bd4f", accent: "#519839" },
];

export const AVATAR_COLORS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#00aecc",
  "#61bd4f",
  "#ff991f",
  "#6554c0",
];

export function boardTheme(id, dark = false) {
  const index = Math.abs(Number(id) || 0) % BOARD_PALETTE.length;
  const theme = BOARD_PALETTE[index];

  return {
    ...theme,
    header: theme.accent,
    surface: dark ? "#1d2125" : theme.surface,
    text: dark ? "#ffffff" : "#ffffff",
  };
}

export function avatarColor(id) {
  const index = Math.abs(Number(id) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function listAccent(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
