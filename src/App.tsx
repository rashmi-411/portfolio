import { useState, useEffect, useRef, ReactNode } from "react";
import { FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';

// ── Window width hook (drives ALL responsive logic) ────────────────────────────
function useWindowWidth(): number {
  const [w, setW] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ── Typewriter hook ────────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed: number = 100, pause: number = 1800): string {
  const [display, setDisplay] = useState<string>("");
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [charIdx, setCharIdx] = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);
  useEffect(() => {
    const word = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === word.length ? pause : speed;
    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) { setDisplay(word.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }
      else if (!deleting) { setDeleting(true); }
      else if (charIdx > 0) { setDisplay(word.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }
      else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
}

// ── Particle canvas ────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function ParticleCanvas(): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232,28,46,0.55)"; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(232,28,46,${.13 * (1 - d / 130)})`; ctx.lineWidth = .6; ctx.stroke();
          }
        }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Scroll-reveal ──────────────────────────────────────────────────────────────
function useReveal(): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState<boolean>(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

function Reveal({ children, delay = 0, style = {} }: RevealProps): JSX.Element {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const RED = "#e81c2e";

interface SectionHeaderProps {
  sub: string;
  title: string;
  dark?: boolean;
}

function SectionHeader({ sub, title, dark = false }: SectionHeaderProps): JSX.Element {
  return (
    <Reveal>
      <div style={{ textAlign: "center", marginBottom: "clamp(2rem,5vw,3.5rem)" }}>
        <p style={{ color: RED, fontWeight: 700, letterSpacing: ".18em", fontSize: ".78rem", textTransform: "uppercase", marginBottom: ".5rem" }}>{sub}</p>
        <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.6rem)", fontWeight: 800, color: dark ? "#fff" : "#111", lineHeight: 1.2 }}>{title}</h2>
        <div style={{ width: 52, height: 4, background: RED, borderRadius: 2, margin: "1rem auto 0" }} />
      </div>
    </Reveal>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
interface Service {
  icon: string;
  title: string;
  desc: string;
}

interface PortfolioItem {
  id: number;
  category: string;
  title: string;
  color: string;
}

interface TimelineEntry {
  year: string;
  title: string;
  sub: string;
  side: "left" | "right";
}

interface BlogPost {
  date: string;
  cat: string;
  title: string;
  color: string;
}

interface Skill {
  name: string;
  level: number;
  category: string;
}

const SERVICES: Service[] = [
  { icon: "🎨", title: "Branding", desc: "Crafting unique brand identities that resonate, inspire, and stand the test of time." },
  { icon: "💻", title: "Web Development", desc: "Building fast, scalable, and elegant web applications with modern frameworks." },
  { icon: "📷", title: "Photography", desc: "Capturing authentic moments and translating brand stories into compelling visuals." },
  { icon: "✨", title: "Experience Design", desc: "Designing intuitive, delightful user experiences grounded in research and empathy." },
  { icon: "🧹", title: "Clean Code", desc: "Writing maintainable, well-documented code that scales and performs beautifully." },
  { icon: "⚡", title: "Fast Support", desc: "Reliable, responsive support to keep your digital presence running flawlessly." },
];

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: 1, category: "Branding",    title: "Nova Identity",  color: "#1a1a2e" },
  { id: 2, category: "Design",      title: "Aether UI Kit",  color: "#16213e" },
  { id: 3, category: "Photography", title: "Urban Pulse",    color: "#0f3460" },
  { id: 4, category: "Branding",    title: "Bloom Co.",      color: "#533483" },
  { id: 5, category: "Design",      title: "Flow Dashboard", color: "#2c003e" },
  { id: 6, category: "Photography", title: "Still Waters",   color: "#1b1b2f" },
  { id: 7, category: "Branding",    title: "Forge Studios",  color: "#162447" },
  { id: 8, category: "Design",      title: "Pixel System",   color: "#1f4068" },
];

const SKILLS: Skill[] = [
  // Technical
  { name: "Python", level: 88, category: "Technical" },
  { name: "SQL", level: 82, category: "Technical" },
  { name: "Excel / Google Sheets", level: 90, category: "Technical" },
  { name: "Machine Learning", level: 72, category: "Technical" },
  // Visualization
  { name: "Power BI", level: 78, category: "Visualization" },
  { name: "Tableau", level: 74, category: "Visualization" },
  { name: "Matplotlib / Seaborn", level: 80, category: "Visualization" },
  // Web
  { name: "HTML / CSS", level: 85, category: "Web" },
  { name: "React / TypeScript", level: 76, category: "Web" },
  { name: "Node.js", level: 65, category: "Web" },
];

const TIMELINE: TimelineEntry[] = [
  { year: "2022 – 2026", title: "B.Tech Electronics and Computer Engineering", sub: "Dronacharya Group of Institutions, GN", side: "left" },
  { year: "2021 – 2022", title: "Senior Secondary Education",                  sub: "Saraswati Vidya Mandir",               side: "right" },
  { year: "2019 – 2020", title: "Higher Secondary Education",                  sub: "Saraswati Vidya Mandir",               side: "left" },
];

const BLOGS: BlogPost[] = [
  { date: "Feb 12, 2026", cat: "Design",   title: "The Future of Glassmorphism in UI Design",         color: "#1a1a2e" },
  { date: "Jan 28, 2026", cat: "Dev",      title: "React 19 Features That Will Change How You Build",  color: "#16213e" },
  { date: "Jan 10, 2026", cat: "Branding", title: "Why Visual Consistency Is Your Brand's Superpower", color: "#0f3460" },
  { date: "Jan 10, 2026", cat: "Branding", title: "Why Visual Consistency Is Your Brand's Superpower", color: "#0f3460" },
  { date: "Jan 10, 2026", cat: "Branding", title: "Why Visual Consistency Is Your Brand's Superpower", color: "#0f3460" },

];

// ── Skill bar component ────────────────────────────────────────────────────────
function SkillBar({ skill, delay }: { skill: Skill; delay: number }): JSX.Element {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".38rem" }}>
        <span style={{ fontWeight: 600, fontSize: ".88rem", color: "#222" }}>{skill.name}</span>
        <span style={{ fontWeight: 700, fontSize: ".82rem", color: RED }}>{skill.level}%</span>
      </div>
      <div style={{ height: 7, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: vis ? `${skill.level}%` : "0%",
          background: `linear-gradient(90deg, ${RED}, #ff6b6b)`,
          borderRadius: 99,
          transition: `width 1s ease ${delay}s`,
        }} />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Portfolio(): JSX.Element {
  const w         = useWindowWidth();
  const isMobile  = w < 640;
  const isTablet  = w >= 640 && w < 1024;
  const isDesktop = w >= 1024;

  const typed = useTypewriter(["Rashmi Singh"]);
  const [scrolled, setScrolled]   = useState<boolean>(false);
  const [menuOpen, setMenuOpen]   = useState<boolean>(false);
  const [activeFilter, setFilter] = useState<string>("All");
  const [showAll, setShowAll]     = useState<boolean>(false);
  const [activeSkillCat, setActiveSkillCat] = useState<string>("All");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const filtered  = activeFilter === "All" ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter(p => p.category === activeFilter);
  const displayed = showAll ? filtered : filtered.slice(0, isMobile ? 4 : 6);

  const skillCats = ["All", "Technical", "Visualization", "Web"];
  const filteredSkills = activeSkillCat === "All" ? SKILLS : SKILLS.filter(s => s.category === activeSkillCat);

  // Responsive grid columns
  const servicesCols  = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const portfolioCols = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr";
  const blogCols      = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const contactCols   = isMobile ? "1fr" : "1fr 1fr";

  const HP = isMobile ? "1.2rem" : isTablet ? "2rem" : "4rem";
  const SP = `clamp(3.5rem,7vw,8rem) ${HP}`;

  const NAV_LINKS: string[] = ["home","about","service","portfolio","skills","resume"];


  
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#fff", color: "#111", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
       <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:${RED};border-radius:2px}
        @keyframes blink{50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}
        .nav-lnk{cursor:pointer;color:#fff;font-size:.85rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;transition:color .25s;position:relative;padding:4px 0;white-space:nowrap}
        .nav-lnk::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:2px;background:${RED};transition:width .3s}
        .nav-lnk:hover{color:${RED}}
        .nav-lnk:hover::after{width:100%}
        .svc-card{transition:transform .3s,box-shadow .3s}
        .svc-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 48px rgba(232,28,46,.12)}
        .port-item .p-ov{opacity:0;transition:opacity .3s}
        .port-item:hover .p-ov{opacity:1}
        .blog-crd .b-ov{opacity:0;transition:opacity .3s}
        .blog-crd:hover .b-ov{opacity:1}
        .f-btn{cursor:pointer;padding:8px 20px;border-radius:30px;font-size:.82rem;font-weight:600;letter-spacing:.04em;transition:all .25s;border:2px solid #ddd;background:transparent;color:#666;font-family:inherit}
        .f-btn.act,.f-btn:hover{background:${RED};color:#fff;border-color:${RED}}
        .inp{width:100%;padding:13px 16px;border:1.5px solid #e5e5e5;border-radius:10px;font-family:inherit;font-size:.9rem;outline:none;transition:border-color .25s,box-shadow .25s;background:#fafafa}
        .inp:focus{border-color:${RED};box-shadow:0 0 0 3px rgba(232,28,46,.1);background:#fff}
        .br{background:${RED};color:#fff;border:2px solid ${RED};padding:13px 32px;border-radius:50px;font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;transition:all .22s}
        .br:hover{background:transparent;color:${RED}}
        .bo{background:transparent;color:${RED};border:2px solid ${RED};padding:13px 32px;border-radius:50px;font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;transition:all .22s}
        .bo:hover{background:${RED};color:#fff}
        .mob-lnk{cursor:pointer;color:#bbb;font-size:1rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07);transition:color .2s;display:block}
        .mob-lnk:hover{color:${RED}}
      `}</style>

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(12,12,18,.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.05)" : "none",
        transition: "all .4s",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${HP}`,
      }}>
        <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#fff", letterSpacing: ".04em", cursor: "pointer" }} onClick={() => scrollTo("home")}>
          RAS<span style={{ color: RED }}>HMI</span>
        </div>

        {/* Desktop */}
        {isDesktop && (
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {NAV_LINKS.map(l => <span key={l} className="nav-lnk" onClick={() => scrollTo(l)}>{l[0].toUpperCase()+l.slice(1)}</span>)}
            <button className="br" style={{ padding: "9px 24px", fontSize: ".82rem" }} onClick={() => scrollTo("contact")}>Hire Me</button>
          </div>
        )}

        {/* Tablet */}
        {isTablet && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {["home","about","skills","portfolio","contact"].map(l => <span key={l} className="nav-lnk" style={{ fontSize: ".8rem" }} onClick={() => scrollTo(l)}>{l[0].toUpperCase()+l.slice(1)}</span>)}
            <button className="br" style={{ padding: "8px 20px", fontSize: ".8rem" }} onClick={() => scrollTo("contact")}>Hire Me</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            style={{ background: "none", border: "1.5px solid rgba(255,255,255,.22)", color: "#fff", width: 40, height: 40, borderRadius: 8, fontSize: "1.15rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile full-screen drawer */}
      {isMobile && menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 999, background: "rgba(8,8,14,.97)", backdropFilter: "blur(16px)", padding: "1.5rem 1.5rem 2rem", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {[...NAV_LINKS, "contact"].map(l => (
            <span key={l} className="mob-lnk" onClick={() => scrollTo(l)}>{l[0].toUpperCase()+l.slice(1)}</span>
          ))}
          <button className="br" style={{ marginTop: "2rem" }} onClick={() => scrollTo("contact")}>Hire Me</button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section id="home" style={{ position: "relative", minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <ParticleCanvas />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 65% 50%,rgba(232,28,46,.08) 0%,transparent 65%)" }} />

        <div style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 1200, margin: "0 auto",
          padding: `${isMobile ? "90px" : "76px"} ${HP} ${isMobile ? "3rem" : "4rem"}`,
          display: "flex", alignItems: "center",
          flexDirection: isMobile ? "column-reverse" : "row",
          gap: isMobile ? "2.5rem" : isTablet ? "2rem" : "3.5rem",
        }}>
          {/* Text */}
          <div style={{ flex: "1 1 300px", textAlign: isMobile ? "center" : "left", minWidth: 0 }}>
            <Reveal>
              <p style={{ color: RED, fontWeight: 700, letterSpacing: ".18em", fontSize: ".75rem", textTransform: "uppercase", marginBottom: ".9rem" }}>Hello, I'm</p>
            </Reveal>
            <Reveal delay={.1}>
              <h1 style={{
                color: "#fff",
                fontSize: isMobile ? "1.9rem" : isTablet ? "2.6rem" : "3.5rem",
                fontWeight: 900, lineHeight: 1.15, marginBottom: ".9rem",
                minHeight: isMobile ? "2.4rem" : isTablet ? "3.2rem" : "4.3rem",
              }}>
                {typed}<span style={{ color: RED, animation: "blink 1s step-start infinite" }}>|</span>
              </h1>
            </Reveal>
            <Reveal delay={.2}>
              <p style={{ color: "#9ca3af", lineHeight: 1.85, maxWidth: 460, marginBottom: "2rem", fontSize: isMobile ? ".85rem" : ".93rem", ...(isMobile && { margin: "0 auto 2rem" }) }}>
                Final-year B.Tech student specialized in Electronics and Computer Engineering with hands-on experience building AI-driven and full-stack applications.
              </p>
            </Reveal>
            <Reveal delay={.3}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                <button className="br" style={{ padding: "13px 34px", fontSize: ".95rem", boxShadow: "0 8px 28px rgba(232,28,46,.38)" }} onClick={() => scrollTo("contact")}>Hire Me</button>
                <button className="bo" style={{ padding: "13px 34px", fontSize: ".95rem" }} onClick={() => scrollTo("portfolio")}>View Work</button>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div
                style={{
                  display: "flex",
                  gap: ".8rem",
                  marginTop: "2rem",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}
              >
                {[
                  { id: "li", icon: <FaLinkedinIn />, link: "https://www.linkedin.com/in/rashmi-singh411" },
                  { id: "gh", icon: <FaGithub />, link: "https://github.com/rashmi-411" },
                  { id: "mail", icon: <FaEnvelope />, link: "mailto:rashmi4112004@gmail.com" },
                ].map((social) => (
                  <a
                    key={social.id}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(255,255,255,.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      transition: "all .2s",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = RED;
                      e.currentTarget.style.borderColor = RED;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,.18)";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Portrait — static image from same directory */}
          <Reveal delay={.12} style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "2px dashed rgba(232,28,46,.28)", animation: "spin 22s linear infinite" }} />
              <div style={{ position: "absolute", inset: -32, borderRadius: "50%", border: "1px dashed rgba(232,28,46,.12)", animation: "spin 34s linear infinite reverse" }} />
              <div style={{
                width:  isMobile ? 180 : isTablet ? 240 : 310,
                height: isMobile ? 180 : isTablet ? 240 : 310,
                borderRadius: "50%",
                background: "linear-gradient(145deg,#1f2937,#374151)",
                border: `4px solid ${RED}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 0 64px rgba(232,28,46,.22)",
                animation: "float 5s ease-in-out infinite",
                position: "relative",
              }}>
                <img
                  src="./src/photo.jpeg"
                  alt="Rashmi Singh"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          </Reveal>
        </div>

        {!isMobile && (
          <div style={{ position: "absolute", bottom: 26, left: "50%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "bounce 2.2s infinite" }}>
            <span style={{ color: "#6b7280", fontSize: ".66rem", letterSpacing: ".12em" }}>....</span>
            <div style={{ width: 1, height: 36, background: `linear-gradient(${RED},transparent)` }} />
          </div>
        )}
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: SP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: isMobile ? "2.5rem" : "4rem", alignItems: "center", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
          <Reveal style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", width: isMobile ? "100%" : "auto" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ width: isMobile ? 190 : isTablet ? 240 : 295, height: isMobile ? 230 : isTablet ? 290 : 355, borderRadius: 20, background: "linear-gradient(160deg,#1f2937,#374151)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                <img
                  src="./src/photo.jpeg"
                  alt="Rashmi Singh"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = "none";
                    const parent = t.parentElement;
                    if (parent) {
                      const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
                      svg.setAttribute("viewBox","0 0 200 250");
                      svg.setAttribute("width","78%");
                      svg.style.opacity = "0.5";
                      svg.innerHTML = `<circle cx="100" cy="78" r="44" fill="#9ca3af"/><path d="M10,265 Q10,158 100,158 Q190,158 190,265" fill="#6b7280"/>`;
                      parent.appendChild(svg);
                    }
                  }}
                />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${RED}18,transparent)`, pointerEvents: "none" }} />
              </div>
              <div style={{ position: "absolute", bottom: 18, right: isMobile ? -8 : -18, background: RED, color: "#fff", padding: "11px 16px", borderRadius: 12, fontWeight: 700, textAlign: "center", boxShadow: "0 8px 24px rgba(232,28,46,.38)" }}>
                <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>1</div>
                <div style={{ fontSize: ".66rem", opacity: .9 }}>Years Exp.</div>
              </div>
            </div>
          </Reveal>

          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <Reveal>
              <p style={{ color: RED, fontWeight: 700, letterSpacing: ".18em", fontSize: ".75rem", textTransform: "uppercase", marginBottom: ".4rem" }}>About Me</p>
              <h2 style={{ fontSize: isMobile ? "1.45rem" : "clamp(1.5rem,3.5vw,2.4rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: ".9rem" }}>
                Modern Data Analyst &<br />Creative Developer
              </h2>
              <p style={{ color: "#555", lineHeight: 1.9, marginBottom: "1.7rem", fontSize: ".9rem" }}>
                I'm Rashmi Singh, Aspiring Data Analyst skilled in Python, Excel, SQL, and data visualization. Passionate about sentiment analysis, machine learning, and building data-driven solutions.
                Currently pursuing B.Tech in Electronics & Computer Engineering, I love turning complex datasets into clear, visual stories that help businesses make smarter decisions.
              </p>
            </Reveal>
            <Reveal delay={.1}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: ".65rem 2rem", marginBottom: "2rem" }}>
                {[["Name","Rashmi Singh"],["Age","21 Years"],["Address","Ghaziabad, Uttar Pradesh"],["Phone","+91 9318409505"],["Email","rashmibhardwaj866@email.com"],["Freelance","Available"]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", gap: ".5rem", fontSize: ".87rem" }}>
                    <span style={{ color: RED, fontWeight: 700, minWidth: 66 }}>{k}:</span>
                    <span style={{ color: "#444" }}>{v}</span>
                  </div>
                ))}
              </div>
</Reveal>
            <Reveal delay={.2}>
              <button className="br" onClick={() => {
                const link = document.createElement("a");
                link.href = "/Rashmi_Singh.docx"; 
                link.download = "Rashmi_Singh_CV.docx";
                link.click();
              }}>↓ Download CV</button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────────── */}
      <section id="service" style={{ background: "#f8fafc", padding: SP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader sub="What I Do" title="My Services" />
          <div style={{ display: "grid", gridTemplateColumns: servicesCols, gap: "1.3rem" }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * .06}>
                <div className="svc-card" style={{ background: "#fff", borderRadius: 16, padding: "1.8rem 1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,.055)", border: "1px solid #f0f0f0", height: "100%" }}>
                  <div style={{ fontSize: "2rem", marginBottom: ".85rem" }}>{s.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: ".98rem", marginBottom: ".5rem" }}>{s.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: ".86rem", lineHeight: 1.75 }}>{s.desc}</p>
                  <div style={{ marginTop: "1.2rem", width: 30, height: 3, background: RED, borderRadius: 2 }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ────────────────────────────────────────────────────────── */}
      <section id="portfolio" style={{ padding: SP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader sub="My Work" title="Portfolio" />
          <Reveal>
            <div style={{ display: "flex", gap: ".6rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
              {["All","Software","Hardware","Photography"].map(f => (
                <button key={f} className={`f-btn${activeFilter === f ? " act" : ""}`} onClick={() => { setFilter(f); setShowAll(false); }}>{f}</button>
              ))}
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: portfolioCols, gap: "1rem" }}>
            {displayed.map((item, i) => (
              <Reveal key={item.id} delay={i * .04}>
                <div className="port-item" style={{ height: isMobile ? 150 : 200, borderRadius: 12, overflow: "hidden", cursor: "pointer", background: item.color, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${item.color},transparent 55%)` }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                    <div style={{ color: RED, fontSize: ".66rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>{item.category}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: ".86rem" }}>{item.title}</div>
                  </div>
                  <div className="p-ov" style={{ position: "absolute", inset: 0, background: "rgba(232,28,46,.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 700 }}>View Project →</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {!showAll && filtered.length > displayed.length && (
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <button className="bo" onClick={() => setShowAll(true)}>Load More</button>
            </div>
          )}
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────────────────────── */}
      <section id="skills" style={{ background: "#f8fafc", padding: SP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader sub="What I Know" title="My Skills" />
          <Reveal>
            <div style={{ display: "flex", gap: ".6rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {skillCats.map(c => (
                <button key={c} className={`f-btn${activeSkillCat === c ? " act" : ""}`} onClick={() => setActiveSkillCat(c)}>{c}</button>
              ))}
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 4rem" }}>
            {filteredSkills.map((skill, i) => (
              <SkillBar key={skill.name} skill={skill} delay={i * .08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────────── */}
      <section id="resume" style={{ padding: SP, background: "#fff" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionHeader sub="My Journey" title="Resume & Experience" />
          <div style={{ position: "relative" }}>
            {!isMobile && <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "#f0f0f0", transform: "translateX(-50%)" }} />}
            {isMobile  && <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "#f0f0f0" }} />}

            {TIMELINE.map((t, i) => (
              <Reveal key={i} delay={i * .07}>
                {isMobile ? (
                  <div style={{ display: "flex", gap: "1.1rem", marginBottom: "1.7rem", paddingLeft: ".15rem" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: RED, border: "3px solid #fff", boxShadow: `0 0 0 3px ${RED}33`, flexShrink: 0, marginTop: ".2rem" }} />
                    <div style={{ paddingLeft: ".4rem" }}>
                      <div style={{ fontWeight: 700, fontSize: ".93rem" }}>{t.title}</div>
                      <div style={{ color: "#6b7280", fontSize: ".81rem" }}>{t.sub}</div>
                      <div style={{ color: RED, fontSize: ".76rem", fontWeight: 700, marginTop: ".2rem" }}>{t.year}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "2.2rem", flexDirection: t.side === "left" ? "row" : "row-reverse", gap: "2rem" }}>
                    <div style={{ flex: 1, textAlign: t.side === "left" ? "right" : "left" }}>
                      <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: ".2rem" }}>{t.title}</div>
                      <div style={{ color: "#6b7280", fontSize: ".82rem" }}>{t.sub}</div>
                      <div style={{ color: RED, fontSize: ".76rem", fontWeight: 700, marginTop: ".2rem" }}>{t.year}</div>
                    </div>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: RED, border: "3px solid #fff", boxShadow: `0 0 0 3px ${RED}33`, flexShrink: 0, zIndex: 1 }} />
                    <div style={{ flex: 1 }} />
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: "#f8fafc", padding: SP }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader sub="Latest Certification and Achievements" title="From the Certifications" />
          <div style={{ display: "grid", gridTemplateColumns: blogCols, gap: "1.6rem" }}>
            {BLOGS.map((b, i) => (
              <Reveal key={b.title} delay={i * .1}>
                <div className="blog-crd" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.06)", cursor: "pointer" }}>
                  <div style={{ height: isMobile ? 155 : 175, background: b.color, position: "relative" }}>
                    <div className="b-ov" style={{ position: "absolute", inset: 0, background: "rgba(232,28,46,.46)" }} />
                    <div style={{ position: "absolute", top: 13, left: 13 }}>
                      <span style={{ background: RED, color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700 }}>{b.cat}</span>
                    </div>
                  </div>
                  <div style={{ padding: "1.3rem" }}>
                    <p style={{ color: RED, fontSize: ".74rem", fontWeight: 700, marginBottom: ".4rem" }}>{b.date}</p>
                    <h3 style={{ fontWeight: 700, fontSize: ".9rem", lineHeight: 1.55, marginBottom: "1rem", color: "#111" }}>{b.title}</h3>
                    <span style={{ color: RED, fontWeight: 700, fontSize: ".82rem" }}>Read More →</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────────── */}
      <section id="contact" style={{ padding: SP, background: "#fff" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <SectionHeader sub="Get in Touch" title="Contact Us" />
          <Reveal delay={.1}>
            <div style={{ display: "grid", gridTemplateColumns: contactCols, gap: "1rem" }}>
              <input className="inp" placeholder="Your Name" />
              <input className="inp" placeholder="Your Email" type="email" />
              <input className="inp" placeholder="Subject" style={{ gridColumn: "1 / -1" }} />
              <textarea className="inp" placeholder="Your Message" rows={5} style={{ gridColumn: "1 / -1", resize: "vertical" }} />
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button className="br" style={{ padding: "14px 48px", fontSize: "1rem", boxShadow: "0 8px 28px rgba(232,28,46,.3)" }}>Send Message ✉</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#111827", padding: "2.5rem 1rem", textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "#fff", marginBottom: ".5rem", letterSpacing: ".04em" }}>
          RAS<span style={{ color: RED }}>HMI</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: ".8rem" }}>© 2026 Rashmi Singh. Crafted with ♥ and lots of coffee.</p>
<Reveal delay={0.4}>
              <div
                style={{
                  justifyContent: "center",

                  display: "flex",
                  gap: ".8rem",
                  marginTop: "2rem",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}
              >
                {[
                  { id: "li", icon: <FaLinkedinIn />, link: "https://www.linkedin.com/in/rashmi-singh411" },
                  { id: "gh", icon: <FaGithub />, link: "https://github.com/rashmi-411" },
                  { id: "mail", icon: <FaEnvelope />, link: "mailto:rashmi4112004@gmail.com" },
                ].map((social) => (
                  <a
                    key={social.id}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(255,255,255,.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      transition: "all .2s",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = RED;
                      e.currentTarget.style.borderColor = RED;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,.18)";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </Reveal>
      </footer>
    </div>
  );
}
