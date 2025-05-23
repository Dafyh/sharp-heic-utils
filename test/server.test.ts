// Import Node.js Dependencies
import assert from "node:assert";
import http, { type Server } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { after, before, test, mock } from "node:test";
import timers from "node:timers/promises";
import consumers from "node:stream/consumers";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";

// Import Third-party Dependencies
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

// GLOBALS
let server: Server;

before(async() => {
  const processMock = mock.method(process, "on");

  server = (await import("../")).default;
  assert.strictEqual(processMock.mock.calls[0]?.arguments[0], "SIGINT");

  await timers.setImmediate();
});

after(() => server.close());

test("Must return an error when conversion failed, set status code to 500 and call unlink", async(ctx) => {
  const fakeErrorMessage = "Sharp error";
  async function* toThrow() {
    yield Buffer.alloc(5);
    throw new Error(fakeErrorMessage);
  }

  ctx.mock.method(sharp.prototype, "jpeg", toThrow);
  const unlinkMock = ctx.mock.method(fs, "unlink");

  const request = http.request("http://localhost:8800", { method: "POST" });

  await pipeline(Readable.from("baz"), request);
  const result: string = await new Promise((resolve) => {
    request.on("response", async(response) => {
      assert.strictEqual(response.statusCode, 500);
      const result = await consumers.text(response);
      resolve(result);
    });
  });
  await timers.setImmediate();

  assert.deepStrictEqual(JSON.parse(result), {
    error: {
      name: "Error",
      message: fakeErrorMessage
    }
  });
  assert.strictEqual(unlinkMock.mock.callCount(), 1);
  assert.strictEqual(unlinkMock.mock.calls[0]?.arguments[0], "output.jpg");
});

test("Must set status code to 200, convert HEIC to JPG image and call unlink", async(ctx) => {
  const unlinkMock = ctx.mock.method(fs, "unlink");
  const request = http.request("http://localhost:8800", { method: "POST" });

  await pipeline(createReadStream("./test/file.heic"), request);
  const result: Buffer = await new Promise((resolve) => {
    request.on("response", async(response) => {
      assert.strictEqual(response.statusCode, 200);
      const result = await consumers.buffer(response);
      resolve(result);
    });
  });
  await timers.setImmediate();

  assert.strictEqual(unlinkMock.mock.callCount(), 1);
  assert.strictEqual(unlinkMock.mock.calls[0]?.arguments[0], "output.jpg");
  assert.strictEqual((await fileTypeFromBuffer(result))?.mime, "image/jpeg");
});
