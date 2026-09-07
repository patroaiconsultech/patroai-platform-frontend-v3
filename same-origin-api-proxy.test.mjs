import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitFor(url, attempts = 60) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError || new Error(`server did not become ready: ${url}`);
}

async function listen(server, port) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
}

test("frontend gateway proxies API cookies, CSRF headers, and response cookies without buffering", async (t) => {
  const upstreamPort = await freePort();
  const frontendPort = await freePort();
  const observed = [];

  const upstream = http.createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      observed.push({
        method: request.method,
        url: request.url,
        cookie: request.headers.cookie || "",
        origin: request.headers.origin || "",
        csrf: request.headers["x-orkio-csrf"] || "",
        body: Buffer.concat(chunks).toString("utf8"),
      });

      if (request.url === "/api/v2/test/stream") {
        response.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-store",
        });
        response.write('event: error\ndata: {"code":"TEST_FAILURE"}\n\n');
        setTimeout(() => {
          response.end('event: done\ndata: {"status":"failed"}\n\n');
        }, 10);
        return;
      }

      response.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie":
          "__Host-patroai_session=test-session; Path=/; Secure; HttpOnly; SameSite=Lax",
        "X-ORKIO-CSRF": "csrf-next",
      });
      response.end('{"status":"MFA_REQUIRED","challenge_token":"challenge"}');
    });
  });
  await listen(upstream, upstreamPort);
  t.after(() => upstream.close());

  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: {
      PATH: process.env.PATH || "",
      HOME: process.env.HOME || "",
      NODE_ENV: "test",
      PORT: String(frontendPort),
      VITE_API_BASE_URL: `http://127.0.0.1:${upstreamPort}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => {
    if (!child.killed) child.kill("SIGTERM");
  });

  await waitFor(`http://127.0.0.1:${frontendPort}/env.js`);

  const login = await fetch(
    `http://127.0.0.1:${frontendPort}/api/v2/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "patroai_csrf=csrf-current",
        Origin: "https://frontend.example.test",
        "X-ORKIO-CSRF": "csrf-current",
      },
      body: '{"email":"owner@example.test","password":"not-a-real-secret"}',
    },
  );

  assert.equal(login.status, 200);
  assert.equal(login.headers.get("x-orkio-csrf"), "csrf-next");
  assert.match(
    login.headers.get("set-cookie") || "",
    /__Host-patroai_session=test-session/,
  );
  assert.deepEqual(await login.json(), {
    status: "MFA_REQUIRED",
    challenge_token: "challenge",
  });

  const loginObserved = observed.find(
    (item) => item.url === "/api/v2/auth/login",
  );
  assert.ok(loginObserved);
  assert.equal(loginObserved.method, "POST");
  assert.equal(loginObserved.cookie, "patroai_csrf=csrf-current");
  assert.equal(loginObserved.origin, "https://frontend.example.test");
  assert.equal(loginObserved.csrf, "csrf-current");
  assert.match(loginObserved.body, /owner@example\.test/);

  const stream = await fetch(
    `http://127.0.0.1:${frontendPort}/api/v2/test/stream`,
  );
  assert.equal(stream.status, 200);
  assert.match(stream.headers.get("content-type") || "", /^text\/event-stream/);
  const streamBody = await stream.text();
  assert.match(streamBody, /event: error/);
  assert.match(streamBody, /event: done/);
});
