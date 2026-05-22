// @vitest-environment node

import { createServer, request as httpRequest } from "node:http";
import type { IncomingMessage, Server } from "node:http";
import { connect } from "node:net";
import type { AddressInfo } from "node:net";
import { afterEach, expect, test } from "vitest";

import { configureGlobalFetchProxy, downloadImage, shouldBypassProxy } from "@/lib/proxy";

const imageBytes = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

let originalHttpProxy: string | undefined;
let originalHttpsProxy: string | undefined;
const originalFetch = globalThis.fetch;

function listen(server: Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve((server.address() as AddressInfo).port);
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

afterEach(() => {
  process.env.HTTP_PROXY = originalHttpProxy;
  process.env.HTTPS_PROXY = originalHttpsProxy;
  globalThis.fetch = originalFetch;
});

test("downloads an image URL through a configured HTTP proxy", async () => {
  originalHttpProxy = process.env.HTTP_PROXY;
  originalHttpsProxy = process.env.HTTPS_PROXY;

  const imageServer = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(imageBytes);
  });
  const imagePort = await listen(imageServer);

  const proxyServer = createServer((clientReq, clientRes) => {
    if (!clientReq.url) {
      clientRes.writeHead(400);
      clientRes.end();
      return;
    }

    const targetUrl = new URL(clientReq.url);
    const upstreamReq = httpRequest(
      targetUrl,
      {
        method: clientReq.method,
        headers: clientReq.headers,
      },
      (upstreamRes: IncomingMessage) => {
        clientRes.writeHead(upstreamRes.statusCode ?? 500, upstreamRes.headers);
        upstreamRes.pipe(clientRes);
      }
    );

    upstreamReq.on("error", (error) => {
      clientRes.writeHead(502);
      clientRes.end(error.message);
    });

    clientReq.pipe(upstreamReq);
  });
  proxyServer.on("connect", (req, clientSocket, head) => {
    const [host, port] = (req.url ?? "").split(":");
    const upstreamSocket = connect(Number(port), host, () => {
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length > 0) upstreamSocket.write(head);
      upstreamSocket.pipe(clientSocket);
      clientSocket.pipe(upstreamSocket);
    });

    upstreamSocket.on("error", () => {
      clientSocket.end();
    });
  });
  const proxyPort = await listen(proxyServer);

  process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;
  process.env.HTTPS_PROXY = "";

  try {
    await expect(
      downloadImage(`http://127.0.0.1:${imagePort}/generated.png`)
    ).resolves.toEqual(imageBytes);
  } finally {
    await close(proxyServer);
    await close(imageServer);
  }
});

test("configures global fetch to use the HTTP proxy for storage clients", async () => {
  originalHttpProxy = process.env.HTTP_PROXY;
  originalHttpsProxy = process.env.HTTPS_PROXY;

  const imageServer = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(imageBytes);
  });
  const imagePort = await listen(imageServer);

  let proxyRequests = 0;
  const proxyServer = createServer((clientReq, clientRes) => {
    proxyRequests += 1;
    const targetUrl = new URL(
      clientReq.url ?? "/",
      `http://127.0.0.1:${imagePort}`
    );
    targetUrl.hostname = "127.0.0.1";
    targetUrl.port = String(imagePort);

    const upstreamReq = httpRequest(targetUrl, (upstreamRes) => {
      clientRes.writeHead(upstreamRes.statusCode ?? 500, upstreamRes.headers);
      upstreamRes.pipe(clientRes);
    });

    upstreamReq.on("error", (error) => {
      clientRes.writeHead(502);
      clientRes.end(error.message);
    });

    clientReq.pipe(upstreamReq);
  });
  proxyServer.on("connect", (_req, clientSocket, head) => {
    proxyRequests += 1;
    const upstreamSocket = connect(imagePort, "127.0.0.1", () => {
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length > 0) upstreamSocket.write(head);
      upstreamSocket.pipe(clientSocket);
      clientSocket.pipe(upstreamSocket);
    });

    upstreamSocket.on("error", () => {
      clientSocket.end();
    });
  });
  const proxyPort = await listen(proxyServer);

  process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;
  process.env.HTTPS_PROXY = "";

  try {
    configureGlobalFetchProxy();
    const response = await fetch("http://storage.example.test/generated.png");

    await expect(response.arrayBuffer()).resolves.toEqual(
      imageBytes.buffer.slice(
        imageBytes.byteOffset,
        imageBytes.byteOffset + imageBytes.byteLength
      )
    );
    expect(proxyRequests).toBe(1);
  } finally {
    await close(proxyServer);
    await close(imageServer);
  }
});

test("shouldBypassProxy correctly identifies domains to bypass proxy", () => {
  expect(shouldBypassProxy("localhost")).toBe(true);
  expect(shouldBypassProxy("127.0.0.1")).toBe(true);
  expect(shouldBypassProxy("storage.ai2art.net")).toBe(false);
  expect(shouldBypassProxy("sub.storage.ai2art.net")).toBe(false);
  expect(shouldBypassProxy("123.r2.cloudflarestorage.com")).toBe(false);
  expect(shouldBypassProxy("img.link-gpt.link")).toBe(true);
  
  expect(shouldBypassProxy("api.openai.com")).toBe(false);
  expect(shouldBypassProxy("ciyuan.today")).toBe(false);

  // Test custom NO_PROXY
  process.env.NO_PROXY = "openai.com,.custom.org";
  expect(shouldBypassProxy("openai.com")).toBe(true);
  expect(shouldBypassProxy("sub.openai.com")).toBe(true);
  expect(shouldBypassProxy("test.custom.org")).toBe(true);
  expect(shouldBypassProxy("notcustom.org")).toBe(false);
  process.env.NO_PROXY = undefined;
});

