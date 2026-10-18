import { WebClient } from "@slack/web-api";
import { readFileSync } from "fs";

const token = process.env.SLACK_USER_TOKEN;
const channel = process.env.CHANNEL_ID;
const pattern = process.env.THREAD_PATTERN || "Daily Updates";
const updateFile = process.env.UPDATE_FILE || "update.txt";
const lookbackHours = Number(process.env.LOOKBACK_HOURS || 20);

if (!token) throw new Error("Missing SLACK_USER_TOKEN env var");
if (!channel) throw new Error("Missing CHANNEL_ID env var");

const client = new WebClient(token);

function readUpdateText() {
  const text = readFileSync(updateFile, "utf8").trim();
  if (!text) throw new Error(`${updateFile} is empty — nothing to post`);
  return text;
}

async function findTodaysThread() {
  const oldest = (Date.now() / 1000 - lookbackHours * 3600).toFixed(6);
  const result = await client.conversations.history({
    channel,
    oldest,
    limit: 200,
  });

  const matches = (result.messages || [])
    .filter((m) => (m.text || "").toLowerCase().includes(pattern.toLowerCase()))
    .sort((a, b) => Number(b.ts) - Number(a.ts));

  return matches[0] || null;
}

async function alreadyReplied(threadTs, myUserId) {
  const result = await client.conversations.replies({
    channel,
    ts: threadTs,
    limit: 200,
  });

  return (result.messages || []).some((m) => m.user === myUserId);
}

async function main() {
  const updateText = readUpdateText();

  const thread = await findTodaysThread();
  if (!thread) {
    console.log(
      `No message containing "${pattern}" found in the last ${lookbackHours}h. Nothing to do.`
    );
    return;
  }

  const auth = await client.auth.test();
  const myUserId = auth.user_id;

  if (await alreadyReplied(thread.ts, myUserId)) {
    console.log("I already have a reply on this thread. Skipping.");
    return;
  }

  await client.chat.postMessage({
    channel,
    thread_ts: thread.ts,
    text: updateText,
    reply_broadcast: false,
  });

  console.log(`Posted update as a reply on thread ${thread.ts}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
