import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CHAT_TOPICS, type ChatTopic } from "@/features/chat/types";

const VALID_TOPIC_SET = new Set<ChatTopic>(CHAT_TOPICS);

function dedupeTopics(topics: readonly ChatTopic[]): ChatTopic[] {
  const seen = new Set<ChatTopic>();
  const deduped: ChatTopic[] = [];

  for (const topic of topics) {
    if (!VALID_TOPIC_SET.has(topic) || seen.has(topic)) {
      continue;
    }

    seen.add(topic);
    deduped.push(topic);
  }

  return deduped;
}

export interface ChatHistoryState {
  selectedTopics: ChatTopic[];
}

const initialState: ChatHistoryState = {
  selectedTopics: [],
};

export const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState,
  reducers: {
    setChatHistorySelectedTopics(state, action: PayloadAction<ChatTopic[]>) {
      state.selectedTopics = dedupeTopics(action.payload);
    },
    toggleChatHistorySelectedTopic(state, action: PayloadAction<ChatTopic>) {
      const topic = action.payload;
      if (!VALID_TOPIC_SET.has(topic)) {
        return;
      }

      const index = state.selectedTopics.indexOf(topic);
      if (index >= 0) {
        state.selectedTopics.splice(index, 1);
        return;
      }

      state.selectedTopics.push(topic);
    },
    clearChatHistorySelectedTopics(state) {
      state.selectedTopics = [];
    },
  },
});

export const {
  setChatHistorySelectedTopics,
  toggleChatHistorySelectedTopic,
  clearChatHistorySelectedTopics,
} = chatHistorySlice.actions;

export const selectChatHistorySelectedTopics = (state: {
  chatHistory: ChatHistoryState;
}): ChatTopic[] => state.chatHistory.selectedTopics;
