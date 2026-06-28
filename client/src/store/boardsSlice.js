import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { applyCardUpdate, sortCardsInLists, sortLists } from "./boardHelpers";

export const fetchBoards = createAsyncThunk("boards/fetchBoards", async () => {
  return api.getBoards();
});

export const fetchBoard = createAsyncThunk("boards/fetchBoard", async (id) => {
  const data = await api.getBoard(id);
  return data.board;
});

export const createBoard = createAsyncThunk(
  "boards/createBoard",
  async (name, { dispatch }) => {
    const data = await api.createBoard(name);
    dispatch(fetchBoards());
    return data.board;
  }
);

export const updateBoard = createAsyncThunk(
  "boards/updateBoard",
  async ({ id, name }) => {
    const data = await api.updateBoard(id, { name });
    return data.board;
  }
);

export const deleteBoard = createAsyncThunk(
  "boards/deleteBoard",
  async (id, { dispatch }) => {
    await api.deleteBoard(id);
    dispatch(fetchBoards());
    return id;
  }
);

export const inviteMember = createAsyncThunk(
  "boards/inviteMember",
  async ({ boardId, username }) => {
    const data = await api.inviteMember(boardId, username);
    return data.user;
  }
);

export const removeMember = createAsyncThunk(
  "boards/removeMember",
  async ({ boardId, userId }) => {
    await api.removeMember(boardId, userId);
    return userId;
  }
);

export const createList = createAsyncThunk(
  "boards/createList",
  async ({ boardId, name }) => {
    const data = await api.createList(boardId, name);
    return data.list;
  }
);

export const createCard = createAsyncThunk(
  "boards/createCard",
  async ({ listId, name, description = "" }) => {
    const data = await api.createCard(listId, name, description);
    return data.card;
  }
);

export const updateList = createAsyncThunk(
  "boards/updateList",
  async ({ id, ...attrs }) => {
    const data = await api.updateList(id, attrs);
    return data.list;
  }
);

export const deleteList = createAsyncThunk("boards/deleteList", async (id) => {
  await api.deleteList(id);
  return id;
});

export const updateCard = createAsyncThunk(
  "boards/updateCard",
  async ({ id, ...attrs }) => {
    const data = await api.updateCard(id, attrs);
    return data.card;
  }
);

export const deleteCard = createAsyncThunk("boards/deleteCard", async (id) => {
  await api.deleteCard(id);
  return id;
});

export const moveList = createAsyncThunk(
  "boards/moveList",
  async ({ id, position }) => {
    const data = await api.updateList(id, { position });
    return data.list;
  }
);

export const moveCard = createAsyncThunk(
  "boards/moveCard",
  async ({ id, listId, position }) => {
    const data = await api.updateCard(id, { list_id: listId, position });
    return data.card;
  }
);

export const reorderBoardLists = createAsyncThunk(
  "boards/reorderBoardLists",
  async (nextLists, { dispatch, getState }) => {
    const current = getState().boards.current?.lists || [];

    for (let index = 0; index < nextLists.length; index += 1) {
      const list = nextLists[index];
      const original = current.find((item) => item.id === list.id);
      if (original && original.position !== index) {
        await dispatch(moveList({ id: list.id, position: index }));
      }
    }

    return nextLists.map((list, index) => ({ ...list, position: index }));
  }
);

function upsertList(lists, list) {
  const index = lists.findIndex((item) => item.id === list.id);
  if (index === -1) {
    return sortLists([...lists, { ...list, cards: list.cards || [] }]);
  }

  return sortLists(
    lists.map((item, i) =>
      i === index
        ? { ...item, ...list, cards: item.cards || list.cards || [] }
        : item
    )
  );
}

const boardsSlice = createSlice({
  name: "boards",
  initialState: {
    owned: [],
    member: [],
    current: null,
    loading: false,
    error: null,
    inviteMessage: null,
  },
  reducers: {
    clearCurrentBoard(state) {
      state.current = null;
      state.inviteMessage = null;
    },
    clearInviteMessage(state) {
      state.inviteMessage = null;
    },
    realtimeBoardUpdated(state, action) {
      if (!state.current || state.current.id !== action.payload.id) return;
      state.current = { ...state.current, ...action.payload };
    },
    realtimeListCreated(state, action) {
      if (!state.current) return;
      state.current.lists = upsertList(state.current.lists || [], action.payload);
    },
    realtimeListUpdated(state, action) {
      if (!state.current) return;
      state.current.lists = upsertList(state.current.lists || [], action.payload);
    },
    realtimeListDeleted(state, action) {
      if (!state.current) return;
      state.current.lists = (state.current.lists || []).filter(
        (list) => list.id !== action.payload.id
      );
    },
    realtimeCardCreated(state, action) {
      if (!state.current) return;
      state.current.lists = sortCardsInLists(
        applyCardUpdate(state.current.lists || [], action.payload)
      );
    },
    realtimeCardUpdated(state, action) {
      if (!state.current) return;
      state.current.lists = sortCardsInLists(
        applyCardUpdate(state.current.lists || [], action.payload)
      );
    },
    realtimeCardDeleted(state, action) {
      if (!state.current) return;
      state.current.lists = (state.current.lists || []).map((list) =>
        list.id === action.payload.list_id
          ? {
              ...list,
              cards: (list.cards || []).filter(
                (card) => card.id !== action.payload.id
              ),
            }
          : list
      );
    },
    realtimeMemberAdded(state, action) {
      if (!state.current) return;
      const members = state.current.members || [];
      if (members.some((member) => member.id === action.payload.id)) return;
      state.current.members = [...members, action.payload];
    },
    realtimeMemberRemoved(state, action) {
      if (!state.current) return;
      state.current.members = (state.current.members || []).filter(
        (member) => member.id !== action.payload.user_id
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.owned = action.payload.owned_boards;
        state.member = action.payload.member_boards;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.current = {
          ...action.payload,
          lists: sortCardsInLists(sortLists(action.payload.lists || [])),
        };
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        if (!state.current || state.current.id !== action.payload.id) return;
        state.current = {
          ...state.current,
          ...action.payload,
          lists: state.current.lists,
        };
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.inviteMessage = `${action.payload.username} добавлен на доску`;
        if (!state.current) return;
        const members = state.current.members || [];
        if (!members.some((member) => member.id === action.payload.id)) {
          state.current.members = [
            ...members,
            { id: action.payload.id, username: action.payload.username, role: "member" },
          ];
        }
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.inviteMessage = action.error.message;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.members = (state.current.members || []).filter(
          (member) => member.id !== action.payload
        );
        state.inviteMessage = "Участник удалён с доски";
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.inviteMessage = action.error.message;
      })
      .addCase(createList.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = upsertList(state.current.lists || [], action.payload);
      })
      .addCase(createCard.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = sortCardsInLists(
          applyCardUpdate(state.current.lists || [], action.payload)
        );
      })
      .addCase(updateList.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = upsertList(state.current.lists || [], action.payload);
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = (state.current.lists || []).filter(
          (list) => list.id !== action.payload
        );
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = sortCardsInLists(
          applyCardUpdate(state.current.lists || [], action.payload)
        );
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = sortCardsInLists(
          applyCardUpdate(state.current.lists || [], action.payload)
        );
      })
      .addCase(moveList.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = upsertList(state.current.lists || [], action.payload);
      })
      .addCase(reorderBoardLists.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = sortCardsInLists(action.payload);
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        if (!state.current) return;
        state.current.lists = (state.current.lists || []).map((list) => ({
          ...list,
          cards: (list.cards || []).filter((card) => card.id !== action.payload),
        }));
      });
  },
});

export const {
  clearCurrentBoard,
  clearInviteMessage,
  realtimeBoardUpdated,
  realtimeListCreated,
  realtimeListUpdated,
  realtimeListDeleted,
  realtimeCardCreated,
  realtimeCardUpdated,
  realtimeCardDeleted,
  realtimeMemberAdded,
  realtimeMemberRemoved,
} = boardsSlice.actions;

export default boardsSlice.reducer;
