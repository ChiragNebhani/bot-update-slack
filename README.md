# Daily Update Slack Bot

Every day at ~2:00 AM IST, this checks the test DM/channel for today's
"Daily Updates: ..." thread. If it's there, it posts the contents of
`update.txt` as a **thread reply**, posted **as your own Slack account**
(not a bot), and does not notify the whole channel.

## How it works

- `update.txt` — edit this before you sleep with whatever you want posted.
  Commit + push it. Whatever is in the file when the job runs is what gets posted.
- `.github/workflows/daily-update.yml` — runs on GitHub's servers every
  day at 20:30 UTC (2:00 AM IST), no computer needs to be on.
- `scripts/post-update.js` — finds the thread, checks it hasn't already
  replied today, and posts.

Posting as your real account (not a bot) requires a Slack **user token**,
not a bot token — a bot token always posts under the bot's name.

## One-time setup (you do this part)

### 1. Create a Slack App
1. Go to https://api.slack.com/apps → **Create New App** → **From scratch**.
2. Name it anything (e.g. "my-update-bot"), pick your workspace.

### 2. Add User Token Scopes
In the app settings → **OAuth & Permissions** → scroll to **User Token Scopes**
(NOT Bot Token Scopes) → add:
- `channels:history` (public channels)
- `groups:history` (private channels / group DMs)
- `im:history` (1:1 DMs)
- `chat:write`

### 3. Install the app to your workspace
Still on **OAuth & Permissions**, click **Install to Workspace**, approve it.
Copy the **User OAuth Token** (starts with `xoxp-`). This authenticates
*as you*, so messages it sends show up under your real name.

### 4. Get the test DM/channel ID
Open the DM/group DM with Chirag in Slack (desktop/web), click the channel
name at the top → scroll down → copy the **Channel ID** (starts with `D` or `G`).
(Later, for the real channel, you'll do the same and it starts with `C`.)

### 5. Add GitHub repo secrets
In the GitHub repo → **Settings → Secrets and variables → Actions** → add:
- `SLACK_USER_TOKEN` = the `xoxp-...` token from step 3
- `CHANNEL_ID` = the ID from step 4

### 6. Test it manually (don't wait for 2 AM)
- Post a message in the test DM like `Daily Updates: 17th October`.
- Edit `update.txt` with a test message, commit + push.
- In GitHub → **Actions** tab → **Post daily update reply** → **Run workflow**.
- Check the DM — it should show a thread reply under your own name.

### 7. Go live
Once it works in the DM, change the `CHANNEL_ID` secret to the real
channel's ID (`#offlenstechteam-core`). Nothing else changes.

## Daily usage
Each night before bed: edit `update.txt`, commit, push. That's it — the
Action runs itself at 2 AM IST and posts to whatever thread matches
"Daily Updates" that day. If no such thread exists yet, it does nothing
(it won't fail or post standalone).
