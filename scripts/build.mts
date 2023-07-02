import { cp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chdir } from "node:process";

import * as esbuild from "esbuild";
import { glob } from "glob";
import { mkdirp } from "mkdirp";

import { load as loadReleases } from "~/lib/luatrauma-releases";
import projectRoot from "~/lib/project-root";

chdir(projectRoot);

const srcDir = path.join(projectRoot, "src");
const distDir = path.join(projectRoot, "dist");

await rm(distDir, {
  recursive: true,
  force: true,
});
await mkdirp(distDir);

const functions = await glob(path.join(srcDir, "functions/*.{m,c,}ts"));

for (const file of await glob(path.join(srcDir, "public/*"))) {
  const destination = path.join(distDir, "public", path.basename(file));
  await cp(file, destination, {
    recursive: true,
  });
}

const releases = await loadReleases();

for (const channelName of Object.keys(releases.channels)) {
  const channel = releases.channels[channelName];
  for (const releaseVersion of Object.keys(channel.releases)) {
    const release = channel.releases[releaseVersion];
    if (!release.published) {
      throw new Error("Can't build with unpublished releases.");
    }
  }
}

const API_V1_ROUTE = "api/v1";
await mkdirp(path.join(distDir, "public", API_V1_ROUTE));
await writeFile(
  path.join(distDir, "public", API_V1_ROUTE, "luatrauma-releases"),
  JSON.stringify(releases, null, 2),
);

await esbuild.build({
  absWorkingDir: projectRoot,
  entryPoints: functions,
  bundle: true,
  outdir: path.join(distDir, "functions"),
  format: "esm",
  target: "node16",
  platform: "neutral",
  treeShaking: true,
});
