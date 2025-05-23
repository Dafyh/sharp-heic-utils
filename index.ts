// Import Node.js Dependencies
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import { finished } from "node:stream";
import { pipeline } from "node:stream/promises";

// Import Third-party Dependencies
import sharp from "sharp";

const server = http
  .createServer(async(request, response) => {
    const outputName = "output.jpg";

    try {
      await pipeline(request, sharp().jpeg(), createWriteStream(outputName));
    }
    catch (error: any) {
      response.writeHead(500);
      response.end(JSON.stringify({
        error: {
          name: error.name ?? null,
          message: error.message
        }
      }));
      setImmediate(() => fs.unlink(outputName));

      return;
    }

    response.writeHead(200);
    const stream = createReadStream(outputName);
    finished(stream, () => fs.unlink(outputName));

    await pipeline(stream, response);
  })
  .listen(8800, () => console.log("Server start on port 8800 🚀"));

process.on("SIGINT", () => process.exit(0));

export default server;
