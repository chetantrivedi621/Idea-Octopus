import { useRef, useEffect, useState } from 'react'
import CardNav from '../components/CardNav'
import logo from '../assets/react.svg'
import WelcomeSection from './WelcomeSection'
import UpcomingEventsSection from './UpcomingEventsSection'
import IdeaBoardPreviewSection from './IdeaBoardPreviewSection'
import MemoryCapsuleGallerySection from './MemoryCapsuleGallerySection'
import './GuestDashboard.css'

function GuestDashboard({ onRoleChange, events = [], currentRole = 'Guest' }) {
  const homeRef = useRef(null)
  const eventsRef = useRef(null)
  const ideaBoardRef = useRef(null)
  const capsulesRef = useRef(null)
  const contentRef = useRef(null)
  const [navHeight, setNavHeight] = useState(60)

  const scrollToSection = (ref) => {
    if (ref && ref.current && contentRef.current) {
      const container = contentRef.current
      const element = ref.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollTop = container.scrollTop
      const offsetTop = elementRect.top - containerRect.top + scrollTop - 20
      
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    // Add scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'translateY(0)'
        }
      })
    }, observerOptions)

    const sections = document.querySelectorAll('.main-content > *')
    sections.forEach((section) => {
      section.style.opacity = '0'
      section.style.transform = 'translateY(30px)'
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  const navItems = [
    {
      label: "Home",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Welcome", ariaLabel: "Go to welcome section", onClick: () => scrollToSection(homeRef) },
        { label: "Events", ariaLabel: "View upcoming events", onClick: () => scrollToSection(eventsRef) }
      ]
    },
    {
      label: "Explore",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Idea Board", ariaLabel: "View idea board", onClick: () => scrollToSection(ideaBoardRef) },
        { label: "Capsules", ariaLabel: "View memory capsules", onClick: () => scrollToSection(capsulesRef) }
      ]
    }
  ]

  return (
    <div className="guest-dashboard" style={{ position: 'relative', minHeight: '100vh' }}>
      <CardNav
        logo={logo}
        logoAlt="Company Logo"
        logoText="Hack Capsule"
        items={navItems}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
        onHeightChange={setNavHeight}
        onRoleChange={onRoleChange}
        currentRole={currentRole}
      />
      <div 
        ref={contentRef} 
        className="dashboard-content"
        style={{ 
          paddingTop: `${navHeight + 20}px`,
          transition: 'padding-top 0.4s ease'
        }}
      >
        <main className="main-content">
          <div ref={homeRef}>
            <WelcomeSection />
          </div>
          <div ref={eventsRef}>
            <UpcomingEventsSection events={events} />
          </div>
          <div ref={ideaBoardRef}>
            <IdeaBoardPreviewSection />
          </div>
          <div ref={capsulesRef}>
            <MemoryCapsuleGallerySection />
          </div>
        </main>
      </div>
    </div>
  )
}

export default GuestDashboard

