import { createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { client } from "../lib/opencode-client";

export default function Settings() {
  const navigate = useNavigate();
  const [serverUrl, setServerUrl] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [checking, setChecking] = createSignal(false);
  const [saveStatus, setSaveStatus] = createSignal<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  onMount(() => {
    // Load current server URL
    setServerUrl(client.getServerUrl());
  });

  const checkConnection = async (url: string) => {
    setChecking(true);
    try {
      // 尝试调用一个简单的 API 来验证连接
      // 使用 listSessions 可能会因为鉴权问题失败，但至少说明连接通了
      // 或者使用一个更基础的 endpoint 如果有的话。
      // 这里我们暂时尝试请求 session 列表，如果返回 401/403 也说明服务是通的
      // 或者直接用 fetch 探测
      
      const testUrl = `${url}/session`; 
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      try {
        const response = await fetch(testUrl, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok || response.status === 401 || response.status === 403) {
            // 连接成功 (即使鉴权失败也算连接成功)
            return true;
        } else {
            throw new Error(`服务器返回错误: ${response.status}`);
        }
      } catch (e: any) {
         clearTimeout(timeoutId);
         throw e;
      }

    } catch (error: any) {
      console.error("[Settings] Connection check failed:", error);
      throw new Error(`无法连接到服务器: ${error.message}`);
    } finally {
      setChecking(false);
    }
  };

  const handleTestConnection = async () => {
      setSaveStatus(null);
      let url = serverUrl().trim();
      if (!url) {
        setSaveStatus({ type: "error", message: "服务器地址不能为空" });
        return;
      }
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }
      
      try {
          await checkConnection(url);
          setSaveStatus({ type: "success", message: "连接测试成功！" });
      } catch (error: any) {
          setSaveStatus({ type: "error", message: error.message });
      }
  }

  const handleSave = async () => {
    console.log("[Settings] Saving configuration");
    setSaving(true);
    setSaveStatus(null);

    try {
      let url = serverUrl().trim();
      
      // Basic validation and formatting
      if (!url) {
        throw new Error("服务器地址不能为空");
      }
      
      // Remove trailing slash if present
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }

      // Test connection before saving
      await checkConnection(url);

      // Save to client and localStorage
      client.setServerUrl(url);

      setSaveStatus({ type: "success", message: "服务器地址已更新" });

      // Return to chat after a short delay
      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (error: any) {
      console.error("[Settings] Failed to save config:", error);
      setSaveStatus({ 
        type: "error", 
        message: error.message || "保存失败，请检查地址格式" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/chat");
  };

  return (
    <div class="flex h-screen bg-gray-50 dark:bg-zinc-900">
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header class="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-800 border-b dark:border-zinc-700">
          <div class="flex items-center gap-4">
            <button
              onClick={handleCancel}
              class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              ← 返回
            </button>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">
              连接设置
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-2xl mx-auto px-6 py-8">
            <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border dark:border-zinc-700 p-6 mb-6">
              <label class="block">
                <span class="text-lg font-semibold text-gray-800 dark:text-white mb-2 block">
                  OpenCode 服务器地址
                </span>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  请输入你要连接的 OpenCode 服务地址 (例如: http://localhost:4096)
                </p>

                <div class="flex gap-2">
                    <input
                    type="text"
                    value={serverUrl()}
                    onInput={(e) => setServerUrl(e.currentTarget.value)}
                    placeholder="http://localhost:4096"
                    class="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                    />
                    <button
                        onClick={handleTestConnection}
                        disabled={checking() || saving() || !serverUrl()}
                        class="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-zinc-600 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {checking() ? "测试中..." : "测试连接"}
                    </button>
                </div>
              </label>
            </div>

            {/* Save Status */}
            <Show when={saveStatus()}>
              <div
                class={`p-4 rounded-lg mb-6 ${
                  saveStatus()?.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                }`}
              >
                {saveStatus()?.message}
              </div>
            </Show>

            {/* Action Buttons */}
            <div class="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving() || checking() || !serverUrl()}
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {saving() ? "保存中..." : "保存并连接"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving() || checking()}
                class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>

            {/* Info Box */}
            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 class="text-blue-800 dark:text-blue-200 font-semibold mb-2 text-sm">
                💡 说明
              </h3>
              <ul class="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• 默认地址通常为 /opencode-api (指向本地代理)</li>
                <li>• 如果连接远程服务器，请确保网络可达</li>
                <li>• 更改地址后，聊天记录和会话列表将从新服务器加载</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
