import { basename } from "node:path";

import semver, { SemVer } from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  CHANNELS,
  SCHEMA,
  SIDES,
  load as loadReleases,
  update as updateReleases,
} from "~/lib/luatrauma-releases";

let run: { (): Promise<void> } | undefined;

async function createRelease(args: {
  channel: (typeof CHANNELS)[number];
  version: SemVer;
  displayName?: string;
  steamBuildId?: string;
}): Promise<void> {
  const releases = await loadReleases();
  const channel = releases.channels[args.channel];
  if (!channel) {
    throw new Error(`Channel doesn't exist: ${args.channel}`);
  }

  // It's probably overkill to check the version against all existing releases, but whatever :)
  for (const version of Object.keys(channel.releases).sort(semver.compare)) {
    const ord = args.version.compare(version);
    if (ord === 0) {
      throw new Error(
        `A release already exists for this version: ${args.version}`,
      );
    }
    if (ord !== 1) {
      throw new Error(
        `Can't create a release older than the latest version: ${args.version} < ${version}`,
      );
    }
  }

  channel.releases[args.version.raw] = {
    published: false,
    displayName: args.displayName,
    metadata: {
      steamBuildId: args.steamBuildId,
    },
    artifacts: [],
  };

  updateReleases(releases);
}

async function publishRelease(args: {
  channel: (typeof CHANNELS)[number];
  version: SemVer;
}): Promise<void> {
  const releases = await loadReleases();
  const channel = releases.channels[args.channel];
  if (!channel) {
    throw new Error(`Channel doesn't exist: ${args.channel}`);
  }

  const version = args.version.raw;
  const release = channel.releases[version];
  if (!release) {
    throw new Error(`Release doesn't exist: ${version}`);
  }

  if (release.published) {
    throw new Error(`Release was already published: ${version}`);
  }

  release.published = true;

  updateReleases(releases);
}

async function addArtifact(args: {
  channel: (typeof CHANNELS)[number];
  downloadUrl: string;
  signatureUrl: string;
  target: SCHEMA.DotnetRid;
  side: (typeof SIDES)[number];
  version: SemVer;
  source?: string;
}): Promise<void> {
  const releases = await loadReleases();
  const channel = releases.channels[args.channel];
  if (!channel) {
    throw new Error(`Channel doesn't exist: ${args.channel}`);
  }

  const version = args.version.raw;
  const release = channel.releases[version];
  if (!release) {
    throw new Error(`Release doesn't exist: ${version}`);
  }

  if (release.published) {
    throw new Error(
      `Can't modify a release that was already published: ${version}`,
    );
  }

  release.artifacts.push({
    type:
      args.side === "client"
        ? SCHEMA.ReleaseArtifactType.ClientBuildGzippedTarball
        : SCHEMA.ReleaseArtifactType.ServerBuildGzippedTarball,
    target: args.target,
    source: args.source,
    downloadUrl: args.downloadUrl,
    signatureUrl: args.signatureUrl,
  });

  updateReleases(releases);
}

await yargs(hideBin(process.argv))
  .scriptName(basename(process.argv[1], ".mts"))
  .command(
    "create <channel> <version>",
    "",
    (yargs) => {
      return yargs
        .positional("channel", {
          type: "string",
          choices: CHANNELS,
          demandOption: true,
        })
        .positional("version", {
          type: "string",
          demandOption: true,
        })
        .option("display-name", {
          type: "string",
          requiresArg: true,
        })
        .option("steam-build-id", {
          type: "string",
          requiresArg: true,
        });
    },
    (args) => {
      run = createRelease.bind(undefined, {
        ...args,
        version: new SemVer(args.version),
      });
    },
  )
  .command(
    "publish <channel> <version>",
    "",
    (yargs) => {
      return yargs
        .positional("channel", {
          type: "string",
          choices: CHANNELS,
          demandOption: true,
        })
        .positional("version", {
          type: "string",
          demandOption: true,
        });
    },
    (args) => {
      run = publishRelease.bind(undefined, {
        ...args,
        version: new SemVer(args.version),
      });
    },
  )
  .command(
    "add-artifact <channel> <version> <side> <target>",
    "",
    (yargs) => {
      return yargs
        .positional("channel", {
          type: "string",
          choices: CHANNELS,
          demandOption: true,
        })
        .positional("version", {
          type: "string",
          demandOption: true,
        })
        .positional("side", {
          type: "string",
          choices: SIDES,
          demandOption: true,
        })
        .positional("target", {
          type: "string",
          choices: Object.values(SCHEMA.DotnetRid),
          demandOption: true,
        })
        .option("download-url", {
          type: "string",
          requiresArg: true,
          demandOption: true,
        })
        .option("signature-url", {
          type: "string",
          requiresArg: true,
          demandOption: true,
        })
        .option("source", {
          type: "string",
          requiresArg: true,
        });
    },
    (args) => {
      run = addArtifact.bind(undefined, {
        ...args,
        version: new SemVer(args.version),
      });
    },
  )
  .demandCommand(1, "No subcommand specified")
  .version(false)
  .strict(true)
  .wrap(null)
  .parseAsync();

if (run) {
  await run();
}
