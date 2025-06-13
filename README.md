# mrkrbt.chat

mrkrbt.chat is an AI chat app that was created for the [T3 Chat Cloneathon](https://cloneathon.t3.chat/).

The app was built with [Next.js](https://nextjs.org), [Drizzle ORM](https://orm.drizzle.team) and [Better Auth](https://www.better-auth.com/).

## Features

- ⚡ Real-time chat
- 🔐 Authentication with [Better Auth](https://www.better-auth.com/)
- 🎨 Looks like T3 Chat
- 📝 Markdown support
- 💸 Image Generation with DallE 3
- 🔗 Web Search with [Exa](https://exa.ai/)
- 💸 BYOK (Bring Your Own Key) required
- ✨ Multiple providers and models support
- 📄 Attachment support
- 🧑‍💻 Code highlighting with [Shiki](https://shiki.style/)

## Local deployment

1. Clone the repository

```bash
git clone https://github.com/Marker-bit/mrkrbt_chat.git
```
2. Install dependencies

```bash
pnpm install
```

3. Start the development services (adminer on localhost:8080 and postgres on localhost:5433)

```bash
docker compose up
```

4. Copy `.env.example` to `.env` and fill it
5. Push schema to DB

```bash
pnpm drizzle-kit push
```

6. Run the app

```bash
pnpm dev
```

## Sources

Since it is a cloneathon of [T3 Chat](https://t3.chat/), my app looks similar to it. Also, my prompt was created by looking at theirs.