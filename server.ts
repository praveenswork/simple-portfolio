import express from "express";
import { createServer as createViteServer } from "vite";
import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

// Required for Neon serverless driver to work with WebSockets in Node.js
neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neon connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = neon(process.env.DATABASE_URL!);

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        type TEXT CHECK(type IN ('thinking', 'doing')),
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        tags TEXT,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        project_url TEXT,
        github_url TEXT,
        tags TEXT
      );
    `);

    // Seed data if empty
    const postCountRes = await client.query("SELECT COUNT(*) as count FROM posts");
    if (parseInt(postCountRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO posts (type, title, description, content, tags, date)
        VALUES 
        ('thinking', 'All I Need Is a Renaissance, Summer, and Success', 'Sitting with winter. Belief systems that don''t transfer, rejections from all directions, and the refusal to borrow someone else''s definition of success.', '# The Renaissance of Self\n\nWinter is a time for reflection. In this post, I explore the idea of building your own definition of success rather than borrowing one from society. \n\n### The Problem with Borrowed Success\nWhen we aim for what others want, we lose our own voice. \n\n### Finding Your Summer\nIt''s about the internal warmth that keeps you going when the external world is cold.', 'philosophy, growth, mindset', 'Feb 8, 2026'),
        ('doing', 'Why I''m Building This Notes Section', 'A meta-note on the purpose of this space—increasing focus, compounding ideas, and building in public.', '# Building in Public\n\nThe primary reason for building this notes section is simple: **increase focus and bandwidth toward research and growth**.\n\n### The Problem\nIdeas loop endlessly in the mind. Questions remain unexamined. Connections between concepts stay invisible because they''re never written down.', 'meta, growth, focus', 'Feb 3, 2026')
      `);
    }

    const projectCountRes = await client.query("SELECT COUNT(*) as count FROM projects");
    if (parseInt(projectCountRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO projects (title, description, image_url, project_url, github_url, tags)
        VALUES 
        ('AI Research Lab', 'An interactive platform for exploring machine learning models and data science research.', 'https://picsum.photos/seed/lab/800/600', 'https://example.com/lab', 'https://github.com/praveen/lab', 'AI, ML, React'),
        ('Data Viz Suite', 'A collection of high-performance data visualization tools built with D3.js.', 'https://picsum.photos/seed/viz/800/600', 'https://example.com/viz', 'https://github.com/praveen/viz', 'D3, TypeScript, SVG')
      `);
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    client.release();
  }
}

async function startServer() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Please provide a Neon connection string.");
    process.exit(1);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  await initDb();

  // API Routes
  app.get("/api/posts", async (req, res) => {
    const type = req.query.type;
    try {
      let result;
      if (type) {
        result = await pool.query("SELECT * FROM posts WHERE type = $1 ORDER BY id DESC", [type]);
      } else {
        result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
      }
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: "Post not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
