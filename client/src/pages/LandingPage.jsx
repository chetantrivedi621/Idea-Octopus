// src/pages/LandingPage.jsx
import React, { useEffect } from "react";
import "../styles/landing.css";
import { Link } from "react-router-dom"; 

export default function LandingPage() {
  
  // ✅ FIXED PARALLAX → Now applies only to elements with data-parallax="true"
  useEffect(() => {
    const items = document.querySelectorAll("[data-parallax='true']");

    const handleScroll = () => {
      const scrollY = window.scrollY;
      items.forEach((item) => {
        const depth = item.getAttribute("data-depth") || 0;
        const movement = scrollY * depth;

        item.style.transform = `
          translateY(${movement}px)
          rotateY(${movement / 40}deg)
          rotateX(${movement / 60}deg)
        `;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="lp-wrapper">

      {/* ✅ HERO SECTION */}
      <section className="hero-section reveal">
        
        <div className="hero-left">
          <h1 className="hero-title">
            Ideas fade. <br />
            <span>Memories shouldn’t.</span>
          </h1>

          <p className="hero-sub">
            Capture your hackathon journey from brainstorm to breakthrough with
            Idea-Octopus. Never lose a spark of genius again.
          </p>

          <div className="hero-buttons">
            <a className="btn-primary">Get Started</a>
            <a className="btn-link">How it works →</a>
          </div>
        </div>

        <div className="hero-right">

          {/* ✅ REMOVED 3 FLOATING BUBBLES */}

          {/* ✅ ADDED YOUR HERO IMAGE */}
          <img
            src="/images/hero.png"   // <-- put your image here
            className="hero-main-img"
            alt="HackCapsule Hero"
          />

        </div>
      </section>
      {/* ✅ FEATURES */}
      <section className="features-section reveal">
        <h2 className="section-title">
          What <span>we provide?</span>
        </h2>

        <p className="section-sub">
          Everything you need to ideate, collaborate, and create — in one place.
        </p>

        <div className="features-grid">
          {[
            {
              icon: "/images/board.png",
              title: "AI Idea Board",
              desc: "Never let a creative block stop you again. Capture ideas instantly.",
            },
            {
              icon: "/images/memory.png",
              title: "Memory Capsules",
              desc: "Snapshots of your thought process, inspirations & breakthroughs.",
            },
            {
              icon: "/images/team.png",
              title: "Team Clusters",
              desc: "A visual space for your team’s ideas, notes & thought chains.",
            },
            {
              icon: "/images/pitch.png",
              title: "Pitch Generator",
              desc: "Turn any idea into a presentation-ready pitch in seconds.",
            },
          ].map((item, i) => (
            <div key={i} className="feature-card tilt">
              <img src={item.icon} className="icon-uniform" />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ SHOWCASE LEFT — PARALLAX REMOVED */}
      <section className="showcase reveal">
        <img
          src="/images/showcase1.png"
          className="show-img uniform-img"
          alt="showcase"
        />

        <div className="show-text">
          <h2>From Chaos to Clarity</h2>
          <p>
            Our AI Idea Board helps you connect the dots. Transform raw thoughts
            into clear concepts, with branches for every pivot and possibility.
          </p>
          <a className="btn-secondary">Explore Features</a>
        </div>
      </section>

      {/* ✅ SHOWCASE RIGHT — PARALLAX REMOVED */}
      <section className="showcase showcase-right reveal">
        <div className="show-text">
          <h2>Your Project’s Story</h2>
          <p>
            Memory Capsules create a visual diary of your hackathon. Relive the
            late-night coding sessions and breakthrough moments that defined
            your project.
          </p>
          <a className="btn-secondary">See it in Action</a>
        </div>

        <img 
          src="/images/showcase2.png"
          className="show-img uniform-img"
          alt="showcase"
        />
      </section>

      {/* ✅ TESTIMONIALS */}
      <section className="testimonials-section reveal">
        <h2 className="section-title">What Hackers Say</h2>
        <p className="section-sub">
          Our customers are happy with our service.
        </p>

        <div className="testimonials-grid">
          {[
            {
              name: "Alex Chen",
              title: "Winner, Techfest 2025",
              review:
                "Idea-Octopus was a game-changer. We saved ideas, tracked progress and built better together.",
              img: "https://i.pinimg.com/736x/66/9c/54/669c544a73bbb2ee9b0ca8369c36c658.jpg",
            },
            {
              name: "Jasmine Reid",
              title: "Finalist, AI x Innovate",
              review:
                "The Memory Capsules drove our entire story. It’s insane how much clarity it brought.",
              img: "https://i.pinimg.com/736x/6c/c3/10/6cc3105d363ad351285c5f0cfb377da1.jpg",
            },
            {
              name: "Sam Rivera",
              title: "Lead Developer, ConnectSphere",
              review:
                "The AI idea board is scary good. It suggested an angle we never thought of — which became our core pitch.",
              img: "https://i.pinimg.com/1200x/9e/63/18/9e63183d99d484e56e0ef47a9251317a.jpg",
            },
          ].map((t, i) => (
            <div key={i} className="testimonial-card fade-up">
              <p className="review">“{t.review}”</p>
              <div className="user">
                <img src={t.img} className="user-img-uniform" />
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

     <section className="cta-section reveal">
  <h2>
    Create your own hackathon <br />
  </h2>

  <p>
    Start your journey with a single click. Organize your event, manage teams,
    and bring your hackathon vision to life.
  </p>

  {/* ✅ Button — NO LINK, NO NAVIGATION */}
  <button className="btn-dark glow">
    Join as Organizer
  </button>
</section>


      {/* ✅ FOOTER */}
      <footer className="footer reveal">
        <div className="footer-cols">
          <div>
            <h3>HackCapsule</h3>
            <p>
              The ultimate collaboration tool for hackathons. Capture ideas,
              track progress, and build amazing things together.
            </p>
          </div>

          <div>
            <h4>Product</h4>
            <a>Features</a>
            <a>Templates</a>
            <a>Pricing</a>
          </div>

          <div>
            <h4>Company</h4>
            <a>About</a>
            <a>Careers</a>
            <a>Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2024 HackCapsule. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
