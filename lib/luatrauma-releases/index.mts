import { ReadStream, WriteStream } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as jsonSchema from "jsonschema";

import deserialize from "~/lib/deserialize";
import projectRoot from "~/lib/project-root";

import type * as SCHEMA from "./luatrauma-releases.schema";

export * as SCHEMA from "./luatrauma-releases.schema";

const dir = fileURLToPath(new URL(".", import.meta.url));

export const LUATRAUMA_RELEASES_JSON = "luatrauma-releases.json";
const LUATRAUMA_RELEASES_SCHEMA_JSON = "luatrauma-releases.schema.json";

export const CHANNELS = ["main", "testing"] as const;
export const SIDES = ["client", "server"] as const;

function createReadStream(): ReadStream {
  const srcDir = path.join(projectRoot, "src");
  return fs.createReadStream(path.join(srcDir, LUATRAUMA_RELEASES_JSON));
}

function createWriteStream(): WriteStream {
  const srcDir = path.join(projectRoot, "src");
  return fs.createWriteStream(path.join(srcDir, LUATRAUMA_RELEASES_JSON));
}

export async function load(): Promise<SCHEMA.LuatraumaReleases> {
  const releases = await deserialize(createReadStream());
  validate(releases);
  return releases;
}

export function update(releases: object): void {
  validate(releases);

  const writeStream = createWriteStream();
  writeStream.write(JSON.stringify(releases, null, 2));
  writeStream.write("\n");
  writeStream.end();
}

export function validate(
  data: object,
): asserts data is SCHEMA.LuatraumaReleases {
  const schema = JSON.parse(
    fs.readFileSync(path.join(dir, LUATRAUMA_RELEASES_SCHEMA_JSON), {
      encoding: "utf8",
    }),
  ) as jsonSchema.Schema;

  const validator = new jsonSchema.Validator();
  const validationResult = validator.validate(data, schema, {
    nestedErrors: true,
  });
  if (!validationResult.valid) {
    const lines = ["invalid releases JSON:"];
    for (const error of validationResult.errors) {
      lines.push("\n");
      lines.push(`- ${error}`);
    }
    throw new Error(lines.join(""));
  }
}
