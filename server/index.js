const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const clientBuildPath = path.join(__dirname, "../client/build");

const allowedOrigins = [
  "https://your-app.onrender.com",
  "http://localhost:3000"
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});


app.use(express.static(clientBuildPath));

app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let lastEmit = 0;
  socket.on("cursor-move", (data) => {
    const now = Date.now();
    if (now - lastEmit >= 50) {
      socket.broadcast.emit("cursor-move", {
        id: socket.id,
        x: data.x,
        y: data.y,
        name: data.name,
      });
      lastEmit = now;
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
