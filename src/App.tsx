import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, ExternalLink, ArrowLeft, Moon, Sun } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Post = {
  id: number;
  type: "thinking" | "doing";
  title: string;
  description: string;
  content: string;
  tags: string;
  date: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  github_url: string;
  tags: string;
};

type View = "about" | "thinking" | "doing" | "working" | "post-detail";

export default function App() {
  const [view, setView] = useState<View>("about");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, projectsRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/projects"),
        ]);
        const postsData = await postsRes.json();
        const projectsData = await projectsRes.json();
        setPosts(postsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const currentPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) : null;

  const navigateToPost = (id: number) => {
    setSelectedPostId(id);
    setView("post-detail");
    window.scrollTo(0, 0);
  };

  const navItems = [
    { label: "Thinking", value: "thinking" as View },
    { label: "Doing", value: "doing" as View },
    { label: "Working", value: "working" as View },
  ];

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-24">
        <button
          onClick={() => setView("about")}
          className="text-xl font-serif font-bold hover:opacity-70 transition-opacity"
        >
          Praveen
        </button>
        <div className="flex items-center gap-12">
          <nav className="flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setView(item.value)}
                className={cn(
                  "text-sm font-medium transition-all hover:opacity-100",
                  view === item.value ? "opacity-100" : "opacity-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={toggleTheme}
            className="w-3 h-3 rounded-full bg-[var(--color-text)] opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Toggle theme"
          />
        </div>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {view === "about" && (
            <motion.section
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-6xl font-serif font-bold leading-tight">Praveen</h1>
                <p className="text-sm font-mono opacity-50">
                  &lt;Problem Solving, Data Science, Machine Learning, AI - Applied Research&gt;
                </p>
              </div>
              <div className="h-px bg-[var(--color-border)] w-full" />
              <div className="space-y-8">
                <h2 className="text-xs font-mono uppercase tracking-widest opacity-50">About</h2>
                <div className="text-xl leading-relaxed space-y-6 max-w-2xl">
                  <p>
                    I'm Praveen—an ML Engineer / Data Scientist with a long-running interest in
                    interdisciplinary science and research, especially where ideas have to survive
                    real systems: uncertainty, feedback loops, incentives, and human constraints.
                  </p>
                  <p>
                    Currently focused on building agentic systems and exploring the intersection of
                    cognitive architectures and machine learning. I believe in building in public
                    and compounding knowledge over time.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {(view === "thinking" || view === "doing") && (
            <motion.section
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-6xl font-serif font-bold capitalize">{view}</h1>
                <p className="text-lg opacity-70 max-w-2xl">
                  {view === "thinking"
                    ? "Intellectual, entrepreneurial, and agentic canvas. What an individual can think through while building with conviction."
                    : "Exploration, reading, notes, and learning in public. Open scratchpad work that compounds over time."}
                </p>
              </div>

              <div className="space-y-16 pt-8">
                {posts
                  .filter((p) => p.type === view)
                  .map((post) => (
                    <article
                      key={post.id}
                      className="group cursor-pointer space-y-3"
                      onClick={() => navigateToPost(post.id)}
                    >
                      <div className="flex gap-3 text-xs font-mono opacity-40">
                        <span>{post.date}</span>
                        <span>{post.tags}</span>
                      </div>
                      <h2 className="text-3xl font-serif font-bold group-hover:underline decoration-1 underline-offset-8">
                        {post.title}
                      </h2>
                      <p className="text-lg opacity-60 leading-relaxed max-w-2xl">
                        {post.description}
                      </p>
                    </article>
                  ))}
              </div>
            </motion.section>
          )}

          {view === "working" && (
            <motion.section
              key="working"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-6xl font-serif font-bold">Working</h1>
                <p className="text-lg opacity-70">Selected projects and research initiatives.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                {projects.map((project) => (
                  <div key={project.id} className="group space-y-6">
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg aspect-video bg-white/5 border border-[var(--color-border)]"
                    >
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-serif font-bold">{project.title}</h3>
                        <div className="flex gap-4">
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <Github size={20} />
                          </a>
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink size={20} />
                          </a>
                        </div>
                      </div>
                      <p className="text-lg opacity-60 leading-relaxed">{project.description}</p>
                      <div className="flex gap-2">
                        {project.tags.split(",").map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 bg-white/5 border border-[var(--color-border)] rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {view === "post-detail" && currentPost && (
            <motion.section
              key="post-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <button
                onClick={() => setView(currentPost.type)}
                className="flex items-center gap-2 text-sm font-mono opacity-50 hover:opacity-100 transition-opacity"
              >
                <ArrowLeft size={14} />
                Back to {currentPost.type}
              </button>

              <div className="space-y-6">
                <div className="flex gap-3 text-xs font-mono opacity-40">
                  <span>{currentPost.date}</span>
                  <span>{currentPost.tags}</span>
                </div>
                <h1 className="text-5xl font-serif font-bold leading-tight">{currentPost.title}</h1>
              </div>

              <div className="h-px bg-[var(--color-border)] w-full" />

              <div className="markdown-body py-8">
                <ReactMarkdown>{currentPost.content}</ReactMarkdown>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* SEO Footer */}
      <footer className="mt-32 pt-12 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-mono opacity-30">
        <p>© 2026 Praveen. Built with React + SQLite.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:opacity-100">Twitter</a>
          <a href="#" className="hover:opacity-100">LinkedIn</a>
          <a href="#" className="hover:opacity-100">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
