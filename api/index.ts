import express from "express";
import { Pool } from "@neondatabase/serverless";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

// API Routes

app.get("/api/posts", async (req, res) => {
  try {
    const type = req.query.type;
    let result;

    if (type) {
      result = await pool.query(
        "SELECT * FROM posts WHERE type = $1 ORDER BY id DESC",
        [type],
      );
    } else {
      result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 IMPORTANT — no listen()
export default app;
