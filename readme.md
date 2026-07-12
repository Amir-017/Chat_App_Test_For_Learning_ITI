<div align="center">

# 💬 WebSocket Chat — WhatsApp Clone

A real-time messaging application inspired by WhatsApp, built with **React**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. Supports one-on-one chats, group chats, media uploads, authentication, and multi-language support (English/Arabic with RTL).

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[Environment Variables](#-environment-variables) •
[API Documentation](#-api-documentation)

</div>

---

## ✨ Features

- 🔐 **Authentication** — Secure sign-in/sign-up powered by [Clerk](https://clerk.com)
- 💬 **Real-time Messaging** — Instant one-on-one chat via WebSockets (Socket.IO)
- 👥 **Group Chats** — Create groups, manage members, and send group messages in real time
- 📎 **Media Uploads** — Send images/files in chat, stored on [Cloudinary](https://cloudinary.com) via Multer
- 🌍 **Internationalization (i18n)** — English & Arabic support with full RTL layout handling
- 🛡️ **Protected Routes** — Client-side route guarding for authenticated-only pages
- 📚 **API Documentation** — Auto-generated Swagger docs for backend routes
- 📱 **Responsive UI** — Built with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend (`client/whatsapp`)
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite | Build tool / dev server |
| Tailwind CSS 4 | Styling |
| React Router DOM | Client-side routing |
| Socket.IO Client | Real-time communication |
| Clerk (`@clerk/react`) | Authentication |
| Axios | HTTP requests |
| i18next / react-i18next | Internationalization |

### Backend (`server`)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| Socket.IO | Real-time WebSocket server |
| Clerk (`@clerk/express`) | Authentication middleware |
| Multer | Handling multipart/form-data uploads |
| Cloudinary | Media storage |
| Swagger (jsdoc + ui-express) | API documentation |
| dotenv | Environment variable management |

---

## 📁 Project Structure

```
project-root/
│
├── client/
│   └── whatsapp/
│       ├── src/
│       │   ├── Api/
│       │   │   └── axios.js                  # Axios instance / base config
│       │   │
│       │   ├── Auth/
│       │   │   ├── SignInPage.jsx
│       │   │   └── SignUpPage.jsx
│       │   │
│       │   ├── Chat/
│       │   │   ├── Chat.jsx                   # Main chat page
│       │   │   ├── chat/
│       │   │   │   ├── ChatHeader.jsx
│       │   │   │   ├── ChatMessageInput.jsx
│       │   │   │   ├── ChatMessageList.jsx
│       │   │   │   ├── ChatSidebar.jsx
│       │   │   │   └── CreateGroupModal.jsx
│       │   │   ├── group/
│       │   │   │   ├── CreateGroupModel.jsx
│       │   │   │   ├── GroupChatHeader.jsx
│       │   │   │   ├── GroupMembersPanel.jsx
│       │   │   │   ├── GroupMessageInput.jsx
│       │   │   │   ├── GroupMessageList.jsx
│       │   │   │   └── GroupsSidebar.jsx
│       │   │   ├── Header.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   │
│       │   ├── Groups/
│       │   │   └── GroupsPage.jsx
│       │   │
│       │   ├── hooks/
│       │   │   └── useAuthedSocket.js         # Custom hook: authenticated socket connection
│       │   │
│       │   ├── i18n/
│       │   │   ├── locales/
│       │   │   │   ├── ar.json
│       │   │   │   └── en.json
│       │   │   └── index.js
│       │   │
│       │   ├── shared/
│       │   │   └── MessageOption.jsx
│       │   │
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.jsx
│       │
│       ├── .env.local
│       ├── vite.config.js
│       └── package.json
│
└── server/
    ├── src/
    │   ├── Auth/
    │   │   └── auth.js                        # Clerk auth middleware
    │   │
    │   ├── config/
    │   │   ├── cloudinary.js                  # Cloudinary SDK config
    │   │   └── swagger.js                     # Swagger setup
    │   │
    │   ├── controller/
    │   │   ├── groups.controller.js
    │   │   ├── messages.controller.js
    │   │   └── users.controllers.js
    │   │
    │   ├── middleware/
    │   │   └── upload.js                      # Multer + Cloudinary storage config
    │   │
    │   ├── models/
    │   │   ├── groups.models.js
    │   │   ├── messages.models.js
    │   │   └── users.models.js
    │   │
    │   └── routes/
    │       ├── groups.routes.js
    │       ├── messages.routes.js
    │       └── users.routes.js
    │
    ├── .env
    ├── .env.example
    ├── index.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas cluster)
- A [Clerk](https://clerk.com) account (Publishable + Secret keys)
- A [Cloudinary](https://cloudinary.com) account (Cloud name, API key, API secret)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see [Environment Variables](#-environment-variables) below), then run:

```bash
npm start
```

The server will start on `http://localhost:3000` (or whichever `PORT` you set).

### 3. Setup the Frontend

```bash
cd client/whatsapp
npm install
```

Create a `.env.local` file in `client/whatsapp/` (see below), then run:

```bash
npm run dev
```

The client will start on Vite's default port (usually `http://localhost:5173`).

---

## 🔑 Environment Variables

> ⚠️ **Never commit your real `.env` files.** Make sure `.env` and `.env.local` are listed in `.gitignore`. Use the `.env.example` files below as templates only.

### Backend — `server/.env`

```dotenv
# Server
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chat-app

# Auth (used for signing/verifying app-level tokens, if applicable)
SECRET_KEY=your_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
```

### Frontend — `client/whatsapp/.env.local`

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

> 📌 Note: The variable names for Cloudinary above (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) assume `config/cloudinary.js` reads these exact names. Double-check your actual `cloudinary.js` and `upload.js` files to make sure the variable names match — mismatched names are a common source of "Invalid cloud_name" or auth errors.

---

## 📡 Real-time Architecture (Socket.IO)

- The client establishes an authenticated WebSocket connection via the `useAuthedSocket` hook, passing the Clerk session/user identity to the server on connect.
- The server (`index.js`) attaches Socket.IO to the same HTTP server as Express and validates the connection using the Clerk auth middleware.
- Events are used for:
  - Sending/receiving one-on-one messages
  - Sending/receiving group messages
  - Online/offline presence (if implemented)
  - Group membership updates (create/join/leave)

> Update this section with your actual event names (e.g. `sendMessage`, `receiveMessage`, `joinGroup`) once finalized, so other developers can integrate against the same contract.

---

## 📚 API Documentation

The backend uses **Swagger** for interactive API docs. Once the server is running, visit:

```
http://localhost:3000/api-docs
```

(Adjust the path above if your `swagger.js` config mounts it elsewhere.)

---

## 🌍 Internationalization

The app supports **English** and **Arabic**, including full **RTL** layout support.

- Translation files: `client/whatsapp/src/i18n/locales/en.json` and `ar.json`
- Language switch triggers `document.documentElement.dir` and `lang` updates
- UI uses Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`) to remain layout-safe across both directions

---

## 🗺️ Roadmap / Possible Improvements

- [ ] Message read receipts
- [ ] Typing indicators
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] Message search
- [ ] Dark/light theme toggle

---

## 👤 Author

Built by [Amir Whdan] — feel free to connect!

- GitHub: [@Amir-017](https://github.com/Amir-017)
- LinkedIn: [Amir Whdan](https://www.linkedin.com/in/amir-whdan-5b4148261/?locale=ar)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).