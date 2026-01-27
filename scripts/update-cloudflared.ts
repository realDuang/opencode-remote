#!/usr/bin/env bun
/**
 * Cloudflared binary update script
 * Download the latest cloudflared binary from Cloudflare official releases
 *
 * Usage: bun scripts/update-cloudflared.ts
 */

import { existsSync, mkdirSync, chmodSync } from "fs";
import { join } from "path";

const RESOURCES_DIR = join(import.meta.dir, "..", "resources", "cloudflared");

interface Platform {
  name: string;
  arch: string;
  url: string;
  binaryName: string;
}

// Cloudflare official download links
// Reference: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
const PLATFORMS: Platform[] = [
  {
    name: "darwin",
    arch: "arm64",
    url: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz",
    binaryName: "cloudflared",
  },
  {
    name: "darwin",
    arch: "x64",
    url: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz",
    binaryName: "cloudflared",
  },
  {
    name: "win32",
    arch: "x64",
    url: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe",
    binaryName: "cloudflared.exe",
  },
];

async function downloadFile(url: string, destPath: string): Promise<void> {
  console.log(`  Downloading from: ${url}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "opencode-remote-updater" },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await Bun.write(destPath, arrayBuffer);
  console.log(`  Saved to: ${destPath}`);
}

async function extractTgz(tgzPath: string, destDir: string, binaryName: string): Promise<void> {
  const proc = Bun.spawn(["tar", "-xzf", tgzPath, "-C", destDir], {
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;

  // Clean up tgz file
  await Bun.write(tgzPath, "");
  const fs = await import("fs/promises");
  await fs.unlink(tgzPath);
}

async function updateCloudflared(): Promise<void> {
  console.log("🔍 Downloading latest Cloudflared binaries...");

  try {
    for (const platform of PLATFORMS) {
      const dirPath = join(RESOURCES_DIR, `${platform.name}-${platform.arch}`);

      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }

      console.log(`\n📥 Downloading for ${platform.name}-${platform.arch}...`);

      const destPath = join(dirPath, platform.binaryName);

      if (platform.url.endsWith(".tgz")) {
        // macOS: Download tgz and extract
        const tgzPath = join(dirPath, "cloudflared.tgz");
        await downloadFile(platform.url, tgzPath);
        await extractTgz(tgzPath, dirPath, platform.binaryName);
      } else {
        // Windows: Download exe directly
        await downloadFile(platform.url, destPath);
      }

      // Set executable permission (Unix)
      if (platform.name !== "win32" && existsSync(destPath)) {
        chmodSync(destPath, 0o755);
        console.log("   Set executable permission");
      }
    }

    console.log("\n✅ Cloudflared binaries updated successfully!");
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  }
}

updateCloudflared();