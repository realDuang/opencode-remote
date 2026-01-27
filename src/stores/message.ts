import { createStore } from "solid-js/store";
import { MessageV2, Permission } from "../types/opencode";

// Storage structure consistent with opencode desktop
export const [messageStore, setMessageStore] = createStore<{
  message: {
    [sessionID: string]: MessageV2.Info[];  // Grouped by sessionID, array sorted by id
  };
  part: {
    [messageID: string]: MessageV2.Part[];  // Grouped by messageID, array sorted by id
  };
  permission: {
    [sessionID: string]: Permission.Request[];  // Permission request queue grouped by sessionID
  };
  // Collapse/expand state, indexed by partID or special key
  expanded: {
    [key: string]: boolean;
  };
}>({
  message: {},
  part: {},
  permission: {},
  expanded: {},
});

// Helper functions for expanded state management
export function isExpanded(key: string): boolean {
  return messageStore.expanded[key] ?? false;
}

export function setExpanded(key: string, value: boolean): void {
  setMessageStore("expanded", key, value);
}

export function toggleExpanded(key: string): void {
  setMessageStore("expanded", key, !isExpanded(key));
}
