import { ReadStream } from "node:fs";

import StreamChain from "stream-chain";
import streamJson from "stream-json";
import StreamJsonAssembler from "stream-json/Assembler";
import { Token as StreamJsonToken } from "stream-json/filters/FilterBase";

/**
 * Deserialize JSON data from a stream.
 * This differs from `JSON.parse` in that it rejects duplicate keys.
 * @param stream the data stream to read and deserialize
 * @returns The deserialized JSON object
 */
export default async function deserialize(stream: ReadStream): Promise<object> {
  const parser = new streamJson.Parser();
  const pipeline = StreamChain.chain([stream, parser]);

  let depth = 0;
  const propertyMap = new Map<number, Set<string>>();
  pipeline.on("data", (token: StreamJsonToken) => {
    if (token.name === "keyValue") {
      const key = token.value;
      if (typeof key !== "string") {
        throw new Error("keyValue isn't a string");
      }

      let set = propertyMap.get(depth);
      if (!set) {
        set = new Set();
        propertyMap.set(depth, set);
      }
      if (set.has(key)) {
        throw new Error(`duplicate key: ${key}`);
      }
      set.add(key);
      return;
    }

    if (token.name === "startObject") {
      depth++;
      return;
    }

    if (token.name === "endObject") {
      propertyMap.get(depth)?.clear();
      depth--;
      return;
    }
  });

  const asm = StreamJsonAssembler.connectTo(pipeline);
  return new Promise((resolve, _reject) => {
    asm.on("done", (asm) => {
      resolve(asm.current);
    });
  });
}
