import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const PORT = process.env.PORT ?? 1337;
const LIST = "Inbox";

const REMINDERS = "/opt/homebrew/bin/reminders";

async function showInbox() {
  const { stdout } = await exec(REMINDERS, [
    "show",
    LIST,
    "--format",
    "json",
  ]);
  return JSON.parse(stdout);
}

const TOKEN = "reminders to obsidian woot";

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);

  res.setHeader("Content-Type", "application/json");

  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  try {
    // GET /inbox
    if (req.method === "GET" && url.pathname === "/inbox") {
      const reminders = await showInbox();
      res.writeHead(200);
      res.end(JSON.stringify(reminders));
      return;
    }

    // GET /inbox/:id
    const match = url.pathname.match(/^\/inbox\/([^/]+)$/);
    if (req.method === "GET" && match) {
      const id = match[1];
      const reminders = await showInbox();
      const reminder = reminders.find((r) => r.externalId === id);
      if (!reminder) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(reminder));
      return;
    }

    // DELETE /inbox/:id — mark as complete
    if (req.method === "DELETE" && match) {
      const id = match[1];
      const reminders = await showInbox();
      const index = reminders.findIndex((r) => r.externalId === id);
      if (index === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }
      await exec(REMINDERS, ["complete", LIST, String(index)]);
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${PORT}`);
});
