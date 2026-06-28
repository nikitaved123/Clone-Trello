import { Socket, Presence } from "phoenix";

export function connectBoardChannel(boardId, { onEvent, onPresence }) {
  const socket = new Socket("/socket", {});

  socket.connect();

  const channel = socket.channel(`board:${boardId}`, {});

  channel
    .join()
    .receive("ok", () => {})
    .receive("error", () => {
      console.error("Unable to join board channel");
    });

  const presence = new Presence(channel);

  presence.onSync(() => {
    const users = [];
    presence.list((id, { metas }) => {
      users.push({
        id: Number(id),
        username: metas[0]?.username,
      });
    });
    onPresence(users);
  });

  const events = [
    "board_updated",
    "list_created",
    "list_updated",
    "list_deleted",
    "card_created",
    "card_updated",
    "card_deleted",
  ];

  events.forEach((event) => {
    channel.on(event, (payload) => onEvent(event, payload));
  });

  return () => {
    channel.leave();
    socket.disconnect();
  };
}
