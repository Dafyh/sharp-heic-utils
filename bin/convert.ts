#!/usr/bin/env node
// Import Node.js Dependencies
import { accessSync, createReadStream, createWriteStream } from "node:fs";
import http from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import consumers from "node:stream/consumers";

// CONSTANTS
const [,,arg] = process.argv;
const { dir, name } = path.parse(arg);
const request = http.request("http://localhost:8800", { method: "POST" });

request.on("response", async(response) => {
  if (response.statusCode === 200) {
    await pipeline(response, createWriteStream(path.join(dir, `converted.${name}.jpg`)));
    console.log("Image conversion OK ✅");
  }
  else {
    const body = await consumers.text(response);
    console.log("There is an error ❌ ->", JSON.parse(body));
    process.exit(0);
  }
});

try {
  accessSync(arg);
}
catch {
  console.log("'%s' not found 👀.", arg);
  process.exit(0);
}

pipeline(createReadStream(arg), request);
