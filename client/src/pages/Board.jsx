import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cardDropPosition, reorderLists } from "../boardUtils";
import { avatarColor, boardTheme, listAccent } from "../boardColors";
import ThemeToggle from "../components/ThemeToggle";
import {
  clearCurrentBoard,
  clearInviteMessage,
  createCard,
  createList,
  deleteBoard,
  deleteCard,
  deleteList,
  fetchBoard,
  inviteMember,
  moveCard,
  realtimeBoardUpdated,
  realtimeCardCreated,
  realtimeCardDeleted,
  realtimeCardUpdated,
  realtimeListCreated,
  realtimeListDeleted,
  realtimeListUpdated,
  realtimeMemberAdded,
  realtimeMemberRemoved,
  removeMember,
  reorderBoardLists,
  updateBoard,
  updateCard,
  updateList,
} from "../store/boardsSlice";
import { connectBoardChannel } from "../socket";

function CardItem({ card, onUpdate, onDelete, onDragStart }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setName(card.name);
      setDescription(card.description || "");
    }
  }, [card, editing]);

  async function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onUpdate(card.id, name.trim(), description.trim());
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Удалить карточку?")) return;
    await onDelete(card.id);
  }

  if (editing) {
    return (
      <form className="card-edit" onSubmit={handleSave}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          rows={3}
        />
        <div className="inline-form__actions">
          <button type="submit" disabled={saving}>
            {saving ? "..." : "Сохранить"}
          </button>
          <button type="button" onClick={() => setEditing(false)}>
            Отмена
          </button>
          <button type="button" className="danger-btn" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="card-item-wrap"
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        onDragStart(card);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button type="button" className="card-item" onClick={() => setEditing(true)}>
        <div className="card-item__name">{card.name}</div>
        {card.description && (
          <div className="card-item__desc">{card.description}</div>
        )}
      </button>
    </div>
  );
}

function ListColumn({
  list,
  listIndex,
  dragOver,
  onAddCard,
  onUpdateList,
  onDeleteList,
  onUpdateCard,
  onDeleteCard,
  onListDragStart,
  onListDrop,
  onCardDrop,
  onCardDragStart,
  onDragEnter,
  onDragLeave,
}) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.name);

  useEffect(() => {
    if (!editingTitle) setTitle(list.name);
  }, [list.name, editingTitle]);

  async function handleAdd(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await onAddCard(list.id, name.trim());
    setName("");
    setAdding(false);
  }

  async function handleTitleSave(event) {
    event?.preventDefault();
    if (!title.trim() || title.trim() === list.name) {
      setEditingTitle(false);
      setTitle(list.name);
      return;
    }
    await onUpdateList(list.id, title.trim());
    setEditingTitle(false);
  }

  async function handleDeleteList() {
    if (!window.confirm(`Удалить список «${list.name}» и все карточки?`)) return;
    await onDeleteList(list.id);
  }

  return (
    <div
      className={`list-column ${dragOver ? "is-drag-over" : ""}`}
      style={{ "--list-accent": listAccent(listIndex) }}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter(list.id);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        onListDrop(list.id);
      }}
    >
      <div
        className="list-column__header"
        draggable
        onDragStart={(event) => {
          event.stopPropagation();
          onListDragStart(list.id);
        }}
      >
        {editingTitle ? (
          <form className="list-title-form" onSubmit={handleTitleSave}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setTitle(list.name);
                }
              }}
            />
          </form>
        ) : (
          <button
            type="button"
            className="list-column__title"
            onClick={() => setEditingTitle(true)}
            title="Нажмите, чтобы переименовать"
          >
            {list.name}
          </button>
        )}
        <button
          type="button"
          className="icon-btn"
          onClick={handleDeleteList}
          title="Удалить список"
        >
          ×
        </button>
      </div>

      <div
        className="list-column__cards"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onCardDrop(list.id, null);
        }}
      >
        {(list.cards || []).map((card) => (
          <div
            key={card.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCardDrop(list.id, card.id);
            }}
          >
            <CardItem
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onDragStart={onCardDragStart}
            />
          </div>
        ))}
      </div>

      {adding ? (
        <form className="inline-form" onSubmit={handleAdd}>
          <textarea
            autoFocus
            placeholder="Название карточки"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="inline-form__actions">
            <button type="submit">Добавить</button>
            <button type="button" onClick={() => setAdding(false)}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button className="ghost-btn" onClick={() => setAdding(true)}>
          + Добавить карточку
        </button>
      )}
    </div>
  );
}

const eventHandlers = {
  list_created: realtimeListCreated,
  list_updated: realtimeListUpdated,
  list_deleted: realtimeListDeleted,
  card_created: realtimeCardCreated,
  card_updated: realtimeCardUpdated,
  card_deleted: realtimeCardDeleted,
  member_added: realtimeMemberAdded,
  member_removed: realtimeMemberRemoved,
};

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const board = useSelector((state) => state.boards.current);
  const inviteMessage = useSelector((state) => state.boards.inviteMessage);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const loading = useSelector((state) => state.boards.loading);
  const [listName, setListName] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [draggingListId, setDraggingListId] = useState(null);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);

  const isOwner = user?.id === board?.user_id;
  const theme = board ? boardTheme(board.id, darkMode) : boardTheme(0, darkMode);
  const members = board?.members || [];

  useEffect(() => {
    if (board?.name) setBoardTitle(board.name);
  }, [board?.name]);

  useEffect(() => {
    dispatch(fetchBoard(id));
    return () => dispatch(clearCurrentBoard());
  }, [dispatch, id]);

  useEffect(() => {
    const disconnect = connectBoardChannel(id, {
      onEvent: (event, payload) => {
        if (event === "board_updated") {
          dispatch(realtimeBoardUpdated(payload.board));
          return;
        }

        const action = eventHandlers[event];
        if (!action) return;

        if (event.endsWith("_deleted") || event === "member_removed") {
          dispatch(action(payload));
        } else if (event === "member_added") {
          dispatch(action(payload.member));
        } else {
          const key = event.split("_")[0];
          dispatch(action(payload[key]));
        }
      },
      onPresence: setOnlineUsers,
    });

    return disconnect;
  }, [dispatch, id]);

  async function handleAddList(event) {
    event.preventDefault();
    if (!listName.trim()) return;
    await dispatch(createList({ boardId: id, name: listName.trim() }));
    setListName("");
    setAddingList(false);
  }

  async function handleBoardTitleSave(event) {
    event?.preventDefault();
    if (!boardTitle.trim() || boardTitle.trim() === board.name) {
      setEditingBoardTitle(false);
      setBoardTitle(board.name);
      return;
    }
    await dispatch(updateBoard({ id: board.id, name: boardTitle.trim() }));
    setEditingBoardTitle(false);
  }

  async function handleDeleteBoard() {
    if (!window.confirm(`Удалить доску «${board.name}»?`)) return;
    await dispatch(deleteBoard(board.id));
    navigate("/");
  }

  async function handleInvite(event) {
    event.preventDefault();
    if (!inviteUsername.trim()) return;
    dispatch(clearInviteMessage());
    await dispatch(inviteMember({ boardId: board.id, username: inviteUsername.trim() }));
    setInviteUsername("");
  }

  async function handleRemoveMember(member) {
    if (!window.confirm(`Удалить ${member.username} с доски?`)) return;
    dispatch(clearInviteMessage());
    await dispatch(removeMember({ boardId: board.id, userId: member.id }));
  }

  function handleListDrop(targetListId) {
    if (draggingListId) {
      if (draggingListId !== targetListId) {
        const reordered = reorderLists(board.lists, draggingListId, targetListId);
        dispatch(reorderBoardLists(reordered));
      }
      setDraggingListId(null);
      setDragOverListId(null);
      return;
    }

    if (draggingCard) {
      handleCardDrop(targetListId, null);
    }
  }

  function handleCardDrop(listId, targetCardId) {
    if (!draggingCard) return;
    const list = board.lists.find((item) => item.id === listId);
    if (!list) return;

    const position = cardDropPosition(list, draggingCard.id, targetCardId);
    dispatch(
      moveCard({
        id: draggingCard.id,
        listId,
        position,
      })
    );
    setDraggingCard(null);
    setDragOverListId(null);
  }

  if (loading || !board) {
    return <div className="loading-screen">Загрузка доски...</div>;
  }

  return (
    <div
      className="board-page"
      style={{
        "--board-header": theme.header,
        "--board-surface": theme.surface,
        "--board-accent": theme.accent,
        "--board-text": theme.text,
      }}
    >
      <header className="board-header">
        <div className="board-header__left">
          <Link to="/" className="board-header__back">
            ← Доски
          </Link>
          {editingBoardTitle ? (
            <form className="board-title-form" onSubmit={handleBoardTitleSave}>
              <input
                autoFocus
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={handleBoardTitleSave}
              />
            </form>
          ) : (
            <button
              type="button"
              className="board-header__title"
              onClick={() => setEditingBoardTitle(true)}
            >
              {board.name}
            </button>
          )}
          {isOwner && (
            <button type="button" className="header-action-btn" onClick={handleDeleteBoard}>
              Удалить доску
            </button>
          )}
        </div>

        <div className="board-header__right">
          <ThemeToggle className="theme-toggle--board" />
          {members.length > 0 && (
            <div className="board-members">
              <span className="board-members__label">Участники</span>
              <div className="board-members__list">
                {members.map((member) => (
                  <span
                    key={member.id}
                    className={`member-chip member-chip--${member.role}`}
                    style={{ "--chip-color": avatarColor(member.id) }}
                  >
                    <span className="member-chip__avatar">
                      {member.username.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="member-chip__name">{member.username}</span>
                    {member.role === "owner" && (
                      <span className="member-chip__role">владелец</span>
                    )}
                    {isOwner && member.role === "member" && (
                      <button
                        type="button"
                        className="member-chip__remove"
                        title={`Удалить ${member.username}`}
                        onClick={() => handleRemoveMember(member)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          {isOwner && (
            <form className="invite-form" onSubmit={handleInvite}>
              <input
                placeholder="Пригласить пользователя"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
              <button type="submit">Пригласить</button>
            </form>
          )}
          {onlineUsers.length > 0 && (
            <div className="board-header__presence">
              <span className="board-header__presence-label">Онлайн</span>
              {onlineUsers.map((onlineUser) => (
                <span
                  key={onlineUser.id}
                  className="presence-badge"
                  style={{ "--chip-color": avatarColor(onlineUser.id) }}
                >
                  {onlineUser.username}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {inviteMessage && <div className="board-toast">{inviteMessage}</div>}

      <div className="board-canvas">
        {(board.lists || []).map((list, index) => (
          <ListColumn
            key={list.id}
            list={list}
            listIndex={index}
            dragOver={dragOverListId === list.id}
            onAddCard={(listId, name) => dispatch(createCard({ listId, name }))}
            onUpdateList={(listId, name) => dispatch(updateList({ id: listId, name }))}
            onDeleteList={(listId) => dispatch(deleteList(listId))}
            onUpdateCard={(cardId, name, description) =>
              dispatch(updateCard({ id: cardId, name, description }))
            }
            onDeleteCard={(cardId) => dispatch(deleteCard(cardId))}
            onListDragStart={setDraggingListId}
            onListDrop={handleListDrop}
            onCardDrop={handleCardDrop}
            onCardDragStart={setDraggingCard}
            onDragEnter={setDragOverListId}
            onDragLeave={() => setDragOverListId(null)}
          />
        ))}

        {addingList ? (
          <form className="list-create" onSubmit={handleAddList}>
            <input
              autoFocus
              placeholder="Название списка"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <div className="inline-form__actions">
              <button type="submit">Добавить список</button>
              <button type="button" onClick={() => setAddingList(false)}>
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <button className="list-add-btn" onClick={() => setAddingList(true)}>
            + Добавить список
          </button>
        )}
      </div>
    </div>
  );
}
