import './PopularTagsSection.css'

function PopularTagsSection() {
  const tags = ['AI', 'HealthTech', 'Funny Ideas', 'Sustainability', 'EdTech', 'FinTech']

  return (
    <section className="popular-tags-section">
      <h2 className="section-title">
        <span className="section-icon">⭐</span>
        Popular Tags
      </h2>
      <div className="tags-container">
        {tags.map((tag, index) => (
          <button key={index} className="tag-button">
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}

export default PopularTagsSection

