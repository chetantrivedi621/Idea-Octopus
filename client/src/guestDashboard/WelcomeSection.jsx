import './WelcomeSection.css'

function WelcomeSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Welcome, Guest</h1>
        <p className="hero-subtitle">Explore hackathon ideas, reactions, and creative capsules.</p>
        <button className="cta-btn">Explore Now →</button>
      </div>
      <div className="hero-loader">
        <div className="boxes">
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="box">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection

