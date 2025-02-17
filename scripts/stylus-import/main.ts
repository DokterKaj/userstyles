import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import usercssMeta from "usercss-meta";
import { ensureDir, walk } from "@std/fs";

const stylesheets = walk(path.join(REPO_ROOT, "styles"), {
  includeFiles: true,
  includeDirs: false,
  includeSymlinks: false,
  match: [/\.user.css$/],
});

// Recommended settings.
const settings = {
  settings: {
    updateInterval: 24,
    updateOnlyEnabled: true,
    patchCsp: true,
    "editor.linter": "",
  },
};

const data: Record<string, unknown>[] = [settings];

for await (const entry of stylesheets) {
  const content = await Deno.readTextFile(entry.path);
  const { metadata } = usercssMeta.parse(content);

  data.push({
    enabled: true,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    url: metadata.url,
    updateUrl: metadata.updateURL,
    usercssData: metadata,
    sourceCode: content,
  });
}

await ensureDir("dist");
Deno.writeTextFile("dist/import.json", JSON.stringify(data));
