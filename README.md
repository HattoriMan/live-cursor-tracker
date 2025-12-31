# Live Collaborative Cursor Tracker

A real-time collaborative cursor tracker built with **React**, **Node.js**, and **Socket.IO**. Multiple users can see each other’s cursors moving on the screen with names and unique colors.

---

## **Features**

- Real-time cursor tracking for multiple users.
- Smooth cursor animation using linear interpolation (`lerp`).
- Unique color assignment per user.
- Dark/light theme toggle.
- Custom username input.
- Throttled cursor updates (50ms) for efficient network usage.
- Secure Socket.IO server with CORS restrictions.
- React frontend served directly from Node backend.
- Easy one-command setup using root-level scripts.

---

## **Tech Stack**

- **Frontend:** React, JavaScript, CSS  
- **Backend:** Node.js, Express, Socket.IO  
- **Deployment:** Render

---

## **Folder Structure**

```
project/  
├─ client/ # React frontend  
│ ├─ src/  
│ ├─ public/  
│ ├─ package.json  
│ └─ package-lock.json  
├─ server/ # Node+Socket.IO backend  
│ ├─ index.js  
│ ├─ package.json  
│ └─ package-lock.json  
├─ package-lock.json 
├─ package.json   
└─ README.md  
```

---

## **Quick Start**

For users who want to get started immediately:

### 1. Clone the repo

```bash
git clone https://github.com/HattoriMan/live-cursor-tracker.git
cd live-cursor-tracker
```
### 2. Install all dependencies
```bash
npm install          # install root dev dependencies
npm run install:all  # install client & server dependencies
```
### 3. Run in development mode
```bash
npm run dev
```
Opens frontend on http://localhost:3000

Backend + Socket.IO on http://localhost:3001

Hot reload enabled

### 4. Run in production mode
```bash
npm start
```
Builds React frontend and serves it from Node backend

Accessible on http://localhost:3001

---

## Root-Level Scripts Overview

```json
{
  "scripts": {
    "install:all": "cd client && npm install && cd ../server && npm install",
    "build": "cd client && npm run build",
    "start": "npm run build && cd server && node index.js",
    "dev": "concurrently \"cd server && nodemon index.js\" \"cd client && npm start\""
  }
}
```

## Socket.IO Events

- Server → Client  
  - cursor-move → { id, x, y, name } broadcast to other users.
  - user-disconnected → id of disconnected user.

- Client → Server
  - cursor-move → { x, y, name } sent when a user moves their cursor.

## Customization

- Throttle delay: Adjust client-side throttle in client/src/App.js (50ms default).
- Cursor color: stringToColor ensures visibility on light/dark backgrounds.
- Theme: Toggle light/dark; stored in localStorage.

## Dependencies

- Client: React, react-scripts

- Server: express, socket.io

- Root devDependencies: concurrently, nodemon