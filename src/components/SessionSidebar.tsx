import { For, Show, createSignal, createMemo } from "solid-js";
import { SessionInfo, sessionStore, setSessionStore } from "../stores/session";
import { useI18n, formatMessage } from "../lib/i18n";

interface SessionSidebarProps {
  sessions: SessionInfo[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

// Project grouping data structure
interface ProjectGroup {
  directory: string;
  name: string;
  sessions: SessionInfo[];
}

export function SessionSidebar(props: SessionSidebarProps) {
  const { t, locale } = useI18n();
  const [hoveredProject, setHoveredProject] = createSignal<string | null>(null);

  // Get project name from directory path
  const getProjectName = (directory: string): string => {
    if (!directory) return t().common.unknownProject;
    const parts = directory.split("/").filter(Boolean);
    return parts[parts.length - 1] || t().common.unknownProject;
  };

  // Group sessions by project
  const projectGroups = createMemo((): ProjectGroup[] => {
    const groups: Map<string, SessionInfo[]> = new Map();

    // Filter out sub-sessions (show root sessions only)
    const rootSessions = props.sessions.filter((s) => !s.parentID);

    // Group by directory
    for (const session of rootSessions) {
      const dir = session.directory || "";
      if (!groups.has(dir)) {
        groups.set(dir, []);
      }
      groups.get(dir)!.push(session);
    }

    // Convert to array and sort by latest updated time
    const result: ProjectGroup[] = [];
    for (const [directory, sessions] of groups) {
      // Sort sessions within each project by update time
      const sortedSessions = sessions.slice().sort((a, b) => {
        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();
        return bTime - aTime;
      });

      result.push({
        directory,
        name: getProjectName(directory),
        sessions: sortedSessions,
      });
    }

    // Sort projects by their latest session's update time
    result.sort((a, b) => {
      const aLatest = a.sessions[0]
        ? new Date(a.sessions[0].updatedAt).getTime()
        : 0;
      const bLatest = b.sessions[0]
        ? new Date(b.sessions[0].updatedAt).getTime()
        : 0;
      return bLatest - aLatest;
    });

    return result;
  });

  // Check if project is expanded
  const isProjectExpanded = (directory: string): boolean => {
    // Expanded by default
    return sessionStore.projectExpanded[directory] !== false;
  };

  // Toggle project expansion
  const toggleProjectExpanded = (directory: string) => {
    const currentState = isProjectExpanded(directory);
    setSessionStore("projectExpanded", directory, !currentState);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t().sidebar.justNow;
    if (diffMins < 60) return formatMessage(t().sidebar.minutesAgo, { count: diffMins });
    if (diffHours < 24) return formatMessage(t().sidebar.hoursAgo, { count: diffHours });
    if (diffDays < 7) return formatMessage(t().sidebar.daysAgo, { count: diffDays });

    return date.toLocaleDateString(locale() === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get project initial or icon
  const getProjectInitial = (name: string): string => {
    if (!name) return "?";
    // For English, take first initial
    const firstChar = name.charAt(0);
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase();
    }
    // For other characters, take the first one
    return firstChar;
  };

  // Generate color based on project name
  const getProjectColor = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div class="w-full bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-full">
      {/* Session List */}
      <div class="flex-1 overflow-y-auto px-2 py-2">
        <Show
          when={projectGroups().length > 0}
          fallback={
            <div class="p-8 text-center">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 mb-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{t().sidebar.noSessions}</p>
            </div>
          }
        >
          <For each={projectGroups()}>
            {(project) => {
              const isHovered = () => hoveredProject() === project.directory;
              const isExpanded = () => isProjectExpanded(project.directory);

              return (
                <div class="mb-2">
                  {/* Project Header */}
                  <div
                    class="group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                    onMouseEnter={() => setHoveredProject(project.directory)}
                    onMouseLeave={() => setHoveredProject(null)}
                    onClick={() => toggleProjectExpanded(project.directory)}
                  >
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      {/* Expand/Collapse Arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class={`text-gray-400 transition-transform flex-shrink-0 ${
                          isExpanded() ? "rotate-90" : ""
                        }`}
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>

                      {/* Project Icon */}
                      <div
                        class={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getProjectColor(project.name)}`}
                      >
                        {getProjectInitial(project.name)}
                      </div>

                      {/* Project Name */}
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {project.name}
                      </span>
                    </div>

                    {/* New session button on hover */}
                    <button
                      class={`p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-all ${
                        isHovered() ? "opacity-100" : "opacity-0"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onNewSession();
                      }}
                      title={t().sidebar.newSession}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                  </div>

                  {/* Session List (Collapsible) */}
                  <Show when={isExpanded()}>
                    <div class="ml-4 mt-1">
                      <For each={project.sessions}>
                        {(session) => {
                          const isActive = () =>
                            session.id === props.currentSessionId;

                          return (
                            <div
                              class={`group relative px-3 py-2 mb-0.5 rounded-md cursor-pointer transition-all duration-150 ${
                                isActive()
                                  ? "bg-white dark:bg-zinc-800 shadow-sm"
                                  : "hover:bg-gray-100 dark:hover:bg-zinc-900"
                              }`}
                              onClick={() => props.onSelectSession(session.id)}
                            >
                              <div class="flex items-center justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                  <div class="flex items-center gap-2">
                                    <div
                                      class={`text-sm truncate ${
                                        isActive()
                                          ? "text-gray-900 dark:text-gray-100 font-medium"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {session.title || t().sidebar.newSession}
                                    </div>
                                    <span class="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                                      {formatDate(session.updatedAt)}
                                    </span>
                                  </div>

                                  {/* Change Statistics */}
                                  <Show when={session.summary}>
                                    <div class="flex items-center gap-2 mt-0.5">
                                      <span class="text-[10px] text-gray-400">
                                        {formatMessage(t().sidebar.files, { count: session.summary!.files })}
                                      </span>
                                      <Show when={session.summary!.additions > 0}>
                                        <span class="text-[10px] text-green-500">
                                          +{session.summary!.additions}
                                        </span>
                                      </Show>
                                      <Show when={session.summary!.deletions > 0}>
                                        <span class="text-[10px] text-red-500">
                                          -{session.summary!.deletions}
                                        </span>
                                      </Show>
                                    </div>
                                  </Show>
                                </div>

                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const confirmed = window.confirm(t().sidebar.deleteConfirm);
                                    if (confirmed) {
                                      props.onDeleteSession(session.id);
                                    }
                                  }}
                                  class="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                  title={t().sidebar.deleteSession}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
}
