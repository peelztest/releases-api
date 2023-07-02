#!/usr/bin/env bash

yarn json2ts ./luatrauma-releases.schema.json -o ./luatrauma-releases.schema.ts \
  --enableConstEnums false \
  --unreachableDefinitions true
yarn prettier -w ./luatrauma-releases.schema.ts
