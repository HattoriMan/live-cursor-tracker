import { useEffect, useState, useRef } from "react";
import { socket } from "./socket";
import "./App.css";

/* ---------- Helpers ---------- */
const lerp = (a, b, t) => a + (b - a) * t;

// Generate color from string and ensure it's visible on background
const stringToColor = (str, darkBackground) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let c = (hash & 0x00ffffff).toString(16);
  c = "000000".substring(0, 6 - c.length) + c;

  // Calculate brightness
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (darkBackground && brightness < 130) {
    // lighten for dark background
    const nr = Math.min(r + 70, 255);
    const ng = Math.min(g + 70, 255);
    const nb = Math.min(b + 70, 255);
    return `#${nr.toString(16).padStart(2, "0")}${ng
      .toString(16)
      .padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  } else if (!darkBackground && brightness > 200) {
    // darken for light background
    const nr = Math.max(r - 50, 0);
    const ng = Math.max(g - 50, 0);
    const nb = Math.max(b - 50, 0);
    return `#${nr.toString(16).padStart(2, "0")}${ng
      .toString(16)
      .padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  }

  return `#${c}`;
};

/* ---------- App Component ---------- */
function App() {
  const cursorsRef = useRef({});
  const [cursors, setCursors] = useState({});

  const [name, setName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  /* ---------- Initialize Name ---------- */
  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    if (!storedName) setShowModal(true);
    else setName(storedName);
  }, []);

  /* ---------- Apply Theme ---------- */
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  /* ---------- Submit Name ---------- */
  const submitName = () => {
    let final = name.trim().split(" ")[0]; // take only first part
    if (!final) final = `Guest${Math.floor(Math.random() * 1000)}`;
    sessionStorage.setItem("username", final);
    setName(final);
    setShowModal(false);
  };

  /* ---------- Receive Cursor Updates ---------- */
  useEffect(() => {
    socket.on("cursor-move", ({ id, x, y, name: userName }) => {
      const prev = cursorsRef.current[id] || { x, y };
      cursorsRef.current[id] = {
        ...prev,
        targetX: x,
        targetY: y,
        color: stringToColor(id, dark),
        name: userName,
      };
      setCursors({ ...cursorsRef.current });
    });

    socket.on("user-disconnected", (id) => {
      delete cursorsRef.current[id];
      setCursors({ ...cursorsRef.current });
    });
  }, [dark]);

  /* ---------- Send Own Cursor ---------- */
  useEffect(() => {
    if (!name) return;

    const throttle = (fn, delay) => {
      let last = 0;
      return (...args) => {
        const now = Date.now();
        if (now - last >= delay) {
          last = now;
          fn(...args);
        }
      };
    };

    const sendCursor = throttle((x, y) => {
      cursorsRef.current.me = {
        x,
        y,
        targetX: x,
        targetY: y,
        color: stringToColor("me", dark),
        name,
      };
      setCursors({ ...cursorsRef.current });
      socket.emit("cursor-move", { x, y, name });
    }, 50);

    const handleMouseMove = (e) => sendCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [name, dark]);

  /* ---------- Animate Cursors ---------- */
  useEffect(() => {
    let frame;
    const animate = () => {
      Object.values(cursorsRef.current).forEach((c) => {
        c.x = lerp(c.x, c.targetX, 0.4);
        c.y = lerp(c.y, c.targetY, 0.4);
      });
      setCursors({ ...cursorsRef.current });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ---------- Render ---------- */
  return (
    <div className="app">
      {/* Controls */}
      {!showModal && (
        <div className="controls">
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={() => setShowModal(true)}>✏️ Change Name</button>
        </div>
      )}

      {/* Name Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter your name</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={(e) => e.key === "Enter" && submitName()}
            />
            <button onClick={submitName}>Save</button>
          </div>
        </div>
      )}

      {/* Cursor Layer */}
      {!showModal &&
        Object.entries(cursors).map(([id, c]) => (
          <div
            key={id}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: c.color,
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 10,
                fontWeight: "bold",
                color: c.color,
              }}
            >
              {c.name}
            </div>
          </div>
        ))}
    </div>
  );
}

export default App;
