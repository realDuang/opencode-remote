import { Index, Suspense, createMemo, For } from "solid-js";
import { Part } from "./share/part";
import { messageStore } from "../stores/message";
import type { MessageV2 } from "../types/opencode";

interface MessageListProps {
  sessionID: string;
}

export function MessageList(props: MessageListProps) {
  // Get all messages for this session (sorted by id)
  const messages = createMemo(() => messageStore.message[props.sessionID] || []);

  return (
    <div class="flex flex-col gap-6 py-4">
      <Index each={messages()}>
        {(message, msgIndex) => {
          // Get all parts for this message (sorted by id)
          const parts = createMemo(() => messageStore.part[message().id] || []);

          // Filter parts (consistent with opencode desktop)
          const filteredParts = createMemo(() => {
            const allParts = parts();

            const filtered = allParts.filter((x, index) => {
              // Filter internal states and hidden parts
              if (x.type === "step-start" && index > 0) return false;
              if (x.type === "snapshot") return false;
              if (x.type === "patch") return false;
              if (x.type === "step-finish") return false;
              if (x.type === "text" && x.synthetic === true) return false;
              if (x.type === "tool" && x.tool === "todoread") return false;
              if (x.type === "text" && !x.text) return false;
              if (
                x.type === "tool" &&
                (x.state.status === "pending" || x.state.status === "running")
              )
                return false;
              return true;
            });

            // For assistant messages, reorder: reasoning -> tools -> text
            // This ensures thinking process comes first, final reply last
            if (message().role === "assistant") {
              const reasoning = filtered.filter((p) => p.type === "reasoning");
              const tools = filtered.filter((p) => p.type === "tool");
              const text = filtered.filter((p) => p.type === "text");
              const others = filtered.filter(
                (p) => p.type !== "reasoning" && p.type !== "tool" && p.type !== "text"
              );

              return [...others, ...reasoning, ...tools, ...text];
            }

            return filtered;
          });

          return (
            <div class="flex flex-col gap-2">
              <Suspense>
                <Index each={filteredParts()}>
                  {(part, partIndex) => {
                    // Check if it's the last part of the last message
                    const isLast = createMemo(
                      () =>
                        messages().length === msgIndex + 1 &&
                        filteredParts().length === partIndex + 1,
                    );

                    return (
                      <Part
                        last={isLast()}
                        part={part()}
                        index={partIndex}
                        message={message()}
                      />
                    );
                  }}
                </Index>
              </Suspense>
            </div>
          );
        }}
      </Index>
    </div>
  );
}
