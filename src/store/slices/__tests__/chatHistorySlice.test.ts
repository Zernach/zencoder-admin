import {
  chatHistorySlice,
  setChatHistorySelectedTopics,
  toggleChatHistorySelectedTopic,
  clearChatHistorySelectedTopics,
  selectChatHistorySelectedTopics,
  type ChatHistoryState,
} from "../chatHistorySlice";

describe("chatHistorySlice", () => {
  it("starts with no selected topics", () => {
    const state = chatHistorySlice.reducer(undefined, { type: "unknown" });
    expect(state.selectedTopics).toEqual([]);
  });

  it("sets selected topics and deduplicates values", () => {
    const state = chatHistorySlice.reducer(
      undefined,
      setChatHistorySelectedTopics(["Agents", "Costs", "Agents"]),
    );

    expect(state.selectedTopics).toEqual(["Agents", "Costs"]);
  });

  it("toggles selected topics on and off", () => {
    const withAgents = chatHistorySlice.reducer(
      undefined,
      toggleChatHistorySelectedTopic("Agents"),
    );
    expect(withAgents.selectedTopics).toEqual(["Agents"]);

    const withoutAgents = chatHistorySlice.reducer(
      withAgents,
      toggleChatHistorySelectedTopic("Agents"),
    );
    expect(withoutAgents.selectedTopics).toEqual([]);
  });

  it("clears selected topics", () => {
    const populated = chatHistorySlice.reducer(
      undefined,
      setChatHistorySelectedTopics(["Agents", "Governance"]),
    );
    const cleared = chatHistorySlice.reducer(
      populated,
      clearChatHistorySelectedTopics(),
    );

    expect(cleared.selectedTopics).toEqual([]);
  });

  it("selects chat history topics from state", () => {
    const chatHistory: ChatHistoryState = {
      selectedTopics: ["Support"],
    };

    expect(selectChatHistorySelectedTopics({ chatHistory })).toEqual(["Support"]);
  });
});
