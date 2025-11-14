import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import { IoChevronDown } from 'react-icons/io5';
import './CardNav.css';

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  logoText,
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  buttonText = 'Get Started',
  onHeightChange,
  onRoleChange,
  currentRole = 'Guest'
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navRef = useRef(null);
  const containerRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileDropdownContentRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const dashboardOptions = [
    { label: 'Guest', value: 'Guest' },
    { label: 'Participant', value: 'Participant' },
    { label: 'Judge', value: 'Judge' },
    { label: 'Organizer', value: 'Organizer' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideButton = profileDropdownRef.current && profileDropdownRef.current.contains(event.target);
      const isInsideDropdown = profileDropdownContentRef.current && profileDropdownContentRef.current.contains(event.target);
      const isInsideNav = navRef.current && navRef.current.contains(event.target);
      
      // Close profile dropdown if clicking outside
      if (isProfileDropdownOpen && !isInsideButton && !isInsideDropdown) {
        setIsProfileDropdownOpen(false);
        setTimeout(() => {
          updateHeight();
        }, 50);
      }
      
      // Close menu if clicking outside the nav entirely
      if (isExpanded && !isInsideNav) {
        setIsHamburgerOpen(false);
        setIsExpanded(false);
        const tl = tlRef.current;
        if (tl) {
          tl.reverse();
        }
        setTimeout(() => {
          updateHeight();
        }, 50);
      }
    };

    if (isProfileDropdownOpen || isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isExpanded]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 60;

    const topBar = 60;
    let additionalHeight = 0;

    // Check if menu is expanded
    if (isExpanded) {
      const contentEl = navEl.querySelector('.card-nav-content');
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        contentEl.offsetHeight;

        const padding = 16;
        const contentHeight = contentEl.scrollHeight;
        additionalHeight = Math.max(additionalHeight, contentHeight + padding);

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;
      }
    }

    // Profile dropdown is now outside the nav, so it doesn't affect navbar height
    return topBar + additionalHeight;
  };

  const updateHeight = () => {
    if (containerRef.current && onHeightChange) {
      const height = containerRef.current.offsetHeight;
      onHeightChange(height);
    }
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const currentExpanded = isExpanded;
    const currentProfileOpen = isProfileDropdownOpen;
    
    if (!currentExpanded && !currentProfileOpen) {
      gsap.set(navEl, { height: 60, overflow: 'visible' });
      gsap.set(cardsRef.current, { y: 50, opacity: 0, visibility: 'hidden' });
    }

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    if (!currentExpanded) {
      tl.to(cardsRef.current, { 
        y: 0, 
        opacity: 1, 
        visibility: 'visible',
        duration: 0.4, 
        ease, 
        stagger: 0.08 
      }, '-=0.1');
    } else {
      // If already expanded, ensure cards are visible
      gsap.set(cardsRef.current, { y: 0, opacity: 1, visibility: 'visible' });
    }

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    updateHeight(); // Initial height

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items, isExpanded, isProfileDropdownOpen]);

  useLayoutEffect(() => {
    // Watch for height changes
    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isExpanded, isProfileDropdownOpen]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = () => {
    // Close profile dropdown when opening menu
    if (isProfileDropdownOpen) {
      setIsProfileDropdownOpen(false);
      setTimeout(() => {
        updateHeight();
      }, 50);
    }
    
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      
      // Recreate timeline for expansion
      const tl = createTimeline();
      tlRef.current = tl;
      tl.play(0);
      
      // Update height after animation starts
      setTimeout(() => {
        updateHeight();
      }, 100);
    } else {
      setIsHamburgerOpen(false);
      const tl = tlRef.current;
      if (tl) {
        tl.eventCallback('onReverseComplete', () => {
          setIsExpanded(false);
          updateHeight();
        });
        tl.reverse();
      } else {
        setIsExpanded(false);
        updateHeight();
      }
      // Update height immediately when collapsing
      setTimeout(() => {
        updateHeight();
      }, 50);
    }
  };

  const toggleProfileDropdown = () => {
    // Close menu when opening profile dropdown
    if (isExpanded) {
      setIsHamburgerOpen(false);
      setIsExpanded(false);
      const tl = tlRef.current;
      if (tl) {
        tl.reverse();
      }
      setTimeout(() => {
        updateHeight();
      }, 100);
    }
    
    const newState = !isProfileDropdownOpen;
    setIsProfileDropdownOpen(newState);
    
    // Animate navbar height change
    setTimeout(() => {
      const navEl = navRef.current;
      if (navEl) {
        const targetHeight = calculateHeight();
        gsap.to(navEl, {
          height: targetHeight,
          duration: 0.4,
          ease: 'power3.out',
          onComplete: () => {
            updateHeight();
          }
        });
      } else {
        updateHeight();
      }
    }, 10);
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div ref={containerRef} className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''} ${isProfileDropdownOpen ? 'profile-open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>
          <div className="logo-container">
            {logoText ? (
              <span className="logo-text">{logoText}</span>
            ) : (
              <img src={logo} alt={logoAlt} className="logo" />
            )}
          </div>
          <div className="profile-dropdown-wrapper">
            <button
              ref={profileDropdownRef}
              type="button"
              className="card-nav-cta-button"
              onClick={toggleProfileDropdown}
              aria-label="Profile dropdown"
              aria-expanded={isProfileDropdownOpen}
            >
              <span>{currentRole}</span>
              <IoChevronDown className={`profile-arrow ${isProfileDropdownOpen ? 'open' : ''}`} />
            </button>
            <div
              ref={profileDropdownContentRef}
              className={`profile-dropdown-content ${isProfileDropdownOpen ? 'show' : ''}`}
            >
              <div className="profile-dropdown-card">
                <div className="profile-dropdown-label">Switch Role</div>
                <div className="profile-dropdown-links">
                  {dashboardOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`profile-dropdown-link ${currentRole === option.value ? 'active' : ''}`}
                      onClick={() => {
                        if (onRoleChange && option.value !== currentRole) {
                          onRoleChange(option.value);
                        }
                        setIsProfileDropdownOpen(false);
                        setTimeout(() => {
                          updateHeight();
                        }, 50);
                      }}
                      aria-label={`Switch to ${option.label} role`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ 
                background: item.bgColor ? `linear-gradient(135deg, ${item.bgColor}, ${item.bgColor}dd)` : undefined,
                color: item.textColor || '#fff'
              }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a 
                    key={`${lnk.label}-${i}`} 
                    className="nav-card-link" 
                    href={lnk.href || '#'} 
                    aria-label={lnk.ariaLabel}
                    onClick={(e) => {
                      if (lnk.onClick) {
                        e.preventDefault();
                        lnk.onClick();
                        // Close menu after navigation
                        if (isExpanded) {
                          setTimeout(() => {
                            toggleMenu();
                          }, 100);
                        }
                      }
                    }}
                  >
                    <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;

