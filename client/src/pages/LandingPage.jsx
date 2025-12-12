import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Landingpage.css";

const statTargets = {
  teams: 420,
  ideas: 12400,
  minutes: 18,
};

const timeline = [
  {
    title: "Kickoff & Teaming",
    desc: "Spin up squads, share prompts, and set focus areas in minutes.",
    pulse: "Live onboarding lobby",
  },
  {
    title: "Idea Storm",
    desc: "AI whiteboards and sticky capsules to map problem → solution.",
    pulse: "40+ ideas dropped",
  },
  {
    title: "Build & Demo",
    desc: "Task playlists, checkpoints, and mentor nudges keep momentum high.",
    pulse: "12 demos scheduled",
  },
  {
    title: "Judging & Awards",
    desc: "Panel-ready decks, scoring sheets, and realtime leaderboards.",
    pulse: "Scores syncing live",
  },
];

const faqs = [
  {
    q: "Can I host my own hackathon on Idea-Octopus?",
    a: "Yes. Create an organizer account, publish rounds, invite teams, and track progress with live timelines and scoring.",
  },
  {
    q: "Does it work for remote events?",
    a: "Absolutely. Everything runs in-browser with live updates, timers, and shared boards that sync automatically.",
  },
  {
    q: "How do judges collaborate?",
    a: "Share judge links, drop rubric scores, add comments, and see auto-aggregated totals in one place.",
  },
  {
    q: "Is there AI help?",
    a: "Use AI to expand ideas, tidy pitches, and generate summaries for every capsule and board.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ teams: 0, ideas: 0, minutes: 0 });
  const [activeStage, setActiveStage] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  // Animate counters once on mount
  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setCounters({
        teams: Math.floor(progress * statTargets.teams),
        ideas: Math.floor(progress * statTargets.ideas),
        minutes: Math.floor(progress * statTargets.minutes),
      });

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, []);

  // Rotate timeline cards automatically
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % timeline.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  // Soft parallax for hero chips
  useEffect(() => {
    const items = document.querySelectorAll("[data-parallax='true']");
    const handleScroll = () => {
      const scrollY = window.scrollY;
      items.forEach((item) => {
        const depth = Number(item.getAttribute("data-depth") || 0);
        const movement = scrollY * depth;
        item.style.transform = `translateY(${movement}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const spotlight = useMemo(
    () => [
      {
        title: "Live Idea Board",
        tag: "Shared in real-time",
        points: ["Sticky notes & emoji votes", "AI expands prompts", "Branch & link ideas"],
      },
      {
        title: "Memory Capsules",
        tag: "Story ready",
        points: ["Auto save key steps", "Pin demos & media", "Timeline of breakthroughs"],
      },
      {
        title: "Judging Space",
        tag: "For panels",
        points: ["Rubrics per round", "Smart totals", "Shareable PDFs"],
      },
    ],
    []
  );

  return (
    <div className="lp-wrapper">
      <header className="lp-nav">
        <div className="brand">
          <div className="brand-dot" />
          <span>Idea-Octopus</span>
          <span className="pill-beta">Beta live</span>
        </div>
        <nav>
          <a href="#features">Features</a>
          <a href="#flow">Flow</a>
          <a href="#gallery">Capsules</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="ghost" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="solid" onClick={() => navigate("/signup")}>
            Launch event
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-left">
          <div className="eyebrow">Hackathons move fast. Your ideas shouldn’t slip.</div>
          <h1>
            Host, ideate, and judge on
            <span className="grad"> one collaborative canvas.</span>
          </h1>
          <p>
            Idea-Octopus is the interactive HQ for hackathons. Capture sparks, build in public, and
            keep every team, judge, and mentor in sync.
          </p>
          <div className="hero-ctas">
            <button className="solid" onClick={() => navigate("/signup")}>
              Start free workspace
            </button>
            <Link to="/ideas" className="ghost-link">
              Peek inside →
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="label">Teams onboarded</span>
              <strong>{counters.teams}+</strong>
              <small>Auto-provisioned with boards & tracks</small>
            </div>
            <div className="stat-card">
              <span className="label">Ideas captured</span>
              <strong>{counters.ideas.toLocaleString()}+</strong>
              <small>Smart clustering & quick pitch drafts</small>
            </div>
            <div className="stat-card">
              <span className="label">Setup time</span>
              <strong>{counters.minutes} min</strong>
              <small>From signup to ready-to-run event</small>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="glass live-board" data-parallax="true" data-depth="0.12">
            <div className="live-head">
              <span className="dot green" />
              <span className="dot amber" />
              <span className="dot red" />
              <span className="live-pill">Live board</span>
            </div>
            <div className="live-body">
              <div className="live-column">
                <p className="chip chip-green">Idea storm</p>
                <p className="chip chip-blue">Prototype</p>
                <p className="chip chip-lilac">Demo prep</p>
              </div>
              <div className="live-column">
                {spotlight[activeCard].points.map((p, idx) => (
                  <div key={p} className={`pulse-card pulse-${idx}`}>
                    <span>{p}</span>
                    <span className="micro-tag">synced</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="live-footer">
              {spotlight.map((item, i) => (
                <button
                  key={item.title}
                  className={`tab ${i === activeCard ? "active" : ""}`}
                  onClick={() => setActiveCard(i)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
          <div className="orb orb-1 floating" />
          <div className="orb orb-2 floating delay-1" />
          <div className="orb orb-3 floating delay-2" />
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Built for organizers, teams, and judges</p>
            <h2>
              Everything in one place<span className="grad"> — zero switching.</span>
            </h2>
          </div>
          <Link to="/login" className="ghost-link">
            Jump into dashboard →
          </Link>
        </div>
        <div className="features-grid">
          {[
            {
              title: "Real-time idea board",
              desc: "Sticky notes, votes, branches, and mentions with instant sync.",
            },
            {
              title: "Memory capsules",
              desc: "Auto-save breakthroughs, demos, and references as a story.",
            },
            {
              title: "Judge workspace",
              desc: "Rubrics per round, scoring sheets, exportable summaries.",
            },
            {
              title: "AI copilots",
              desc: "Expand prompts, tidy pitches, and summarize discussions.",
            },
            {
              title: "Event timeline",
              desc: "Rounds, clocks, and status chips that update live for everyone.",
            },
            {
              title: "Team console",
              desc: "Track tasks, uploads, and submissions without leaving the board.",
            },
          ].map((item) => (
            <div key={item.title} className="feature-card" onMouseEnter={() => setActiveCard(0)}>
              <div className="pill-light">New</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="flow" className="flow-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Flow</p>
            <h2>Guide every round without spreadsheets.</h2>
          </div>
          <div className="timer-chip">
            <span className="dot green" />
            Autopilot reminders on
          </div>
        </div>
        <div className="timeline">
          <div className="timeline-tabs">
            {timeline.map((stage, i) => (
              <button
                key={stage.title}
                className={`timeline-tab ${i === activeStage ? "active" : ""}`}
                onClick={() => setActiveStage(i)}
              >
                {stage.title}
              </button>
            ))}
          </div>
          <div className="timeline-body">
            <div className="timeline-card">
              <div className="micro-tag">{timeline[activeStage].pulse}</div>
              <h3>{timeline[activeStage].title}</h3>
              <p>{timeline[activeStage].desc}</p>
              <div className="timeline-progress">
                <span style={{ width: `${((activeStage + 1) / timeline.length) * 100}%` }} />
              </div>
              <div className="timeline-actions">
                <button className="solid ghostish" onClick={() => navigate("/dashboard")}>
                  Open dashboard
                </button>
                <button className="ghost" onClick={() => navigate("/login")}>
                  Invite judges
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="capsule-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Story-first views</p>
            <h2>Capsules that feel alive.</h2>
          </div>
          <span className="pill-beta">Auto summary</span>
        </div>
        <div className="capsule-grid">
          {spotlight.map((item, i) => (
            <div key={item.title} className={`capsule-card ${activeCard === i ? "active" : ""}`}>
              <div className="capsule-top">
                <div className="pill-light">{item.tag}</div>
                <h3>{item.title}</h3>
              </div>
              <ul>
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <button className="ghost-link" onClick={() => setActiveCard(i)}>
                Highlight
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">FAQs</p>
            <h2>Everything you need to start today.</h2>
          </div>
          <button className="solid" onClick={() => navigate("/signup")}>
            Create organizer account
          </button>
        </div>
        <div className="faq-grid">
          {faqs.map((item, idx) => (
            <div
              key={item.q}
              className={`faq-card ${openFaq === idx ? "open" : ""}`}
              onClick={() => setOpenFaq((prev) => (prev === idx ? -1 : idx))}
            >
              <div className="faq-q">
                <span>{item.q}</span>
                <span>{openFaq === idx ? "−" : "+"}</span>
              </div>
              {openFaq === idx && <p className="faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Ready to launch?</p>
          <h2>
            Spin up your hackathon workspace in minutes.
            <span className="grad"> No waitlists.</span>
          </h2>
        </div>
        <div className="cta-actions">
          <button className="solid" onClick={() => navigate("/signup")}>
            Start organizing
          </button>
          <button className="ghost" onClick={() => navigate("/login")}>
            Join an existing event
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="brand">
              <div className="brand-dot" />
              <span>Idea-Octopus</span>
            </div>
            <p>Build, judge, and remember every idea without losing momentum.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#flow">Flow</a>
              <a href="#gallery">Capsules</a>
            </div>
            <div>
              <h4>Access</h4>
              <a onClick={() => navigate("/login")}>Sign in</a>
              <a onClick={() => navigate("/signup")}>Create account</a>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2025 Idea-Octopus. Built for hackathons.</div>
      </footer>
    </div>
  );
}
