document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Dynamic Canvas Particles Background
  // ==========================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const maxParticles = 65; // Balanced number for visual density and CPU performance
    
    const mouse = {
      x: null,
      y: null,
      radius: 120 // Radius of interaction
    };
    
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesArray = [];
      initParticles();
    }
    
    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        // Bounce off borders
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }
        
        // Mouse interaction (push away gently)
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
              this.x += 1.5;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
              this.x -= 1.5;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
              this.y += 1.5;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
              this.y -= 1.5;
            }
          }
        }
        
        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }
    
    function initParticles() {
      const colors = ['rgba(0, 180, 216, 0.25)', 'rgba(124, 58, 237, 0.25)'];
      for (let i = 0; i < maxParticles; i++) {
        let size = Math.random() * 2 + 1;
        let x = Math.random() * (innerWidth - size * 2) + size;
        let y = Math.random() * (innerHeight - size * 2) + size;
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = colors[Math.floor(Math.random() * colors.length)];
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }
    
    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 110) {
            opacityValue = 1 - (distance / 110);
            ctx.strokeStyle = `rgba(48, 54, 61, ${opacityValue * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
        
        // Connect to mouse as well
        if (mouse.x != null && mouse.y != null) {
          let dx = particlesArray[a].x - mouse.x;
          let dy = particlesArray[a].y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            opacityValue = 1 - (distance / mouse.radius);
            ctx.strokeStyle = `rgba(0, 180, 216, ${opacityValue * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
  }

  // ==========================================
  // 2. Fetch and Render Dynamic JSON Data
  // ==========================================
  let typingTitles = [
    "Hi, I'm Md. Raisul Islam Ratul 👋",
    "VLSI & IC Design Specialist",
    "IEEE Published Researcher",
    "Engineering & Robotics Club Leader"
  ]; // Initial default fallback titles

  async function loadPortfolioData() {
    try {
      const response = await fetch('./portfolio-data.json');
      if (!response.ok) throw new Error('Failed to load portfolio-data.json');
      const data = await response.json();
      
      // Update Hero Titles for typing animation
      if (data.titles && data.titles.length > 0) {
        typingTitles = data.titles;
      }
      
      // Biography
      const summaryEl = document.getElementById('hero-summary');
      const bioEl = document.getElementById('about-bio-1');
      if (summaryEl) summaryEl.textContent = data.summary;
      if (bioEl) bioEl.textContent = data.summary;
      
      // Render Competencies
      const compContainer = document.getElementById('competencies-container');
      if (compContainer && data.competencies) {
        compContainer.innerHTML = data.competencies.map(comp => 
          `<span class="tag" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: var(--bg-tertiary);">${comp}</span>`
        ).join('');
      }
      
      // Render Education Timeline
      const eduTimeline = document.getElementById('education-timeline');
      if (eduTimeline && data.education) {
        eduTimeline.innerHTML = data.education.map(edu => `
          <div class="timeline-item">
            <div class="timeline-date">${edu.date}</div>
            <h4>${edu.degree}</h4>
            <p class="timeline-inst">${edu.institution}</p>
            ${edu.description ? `<p class="timeline-desc">${edu.description}</p>` : ''}
          </div>
        `).join('');
      }

      // Render Training Timeline
      const trTimeline = document.getElementById('training-timeline');
      if (trTimeline && data.training) {
        trTimeline.innerHTML = data.training.map(tr => `
          <div class="timeline-item">
            <div class="timeline-date">${tr.date}</div>
            <h4>${tr.title}</h4>
            <p class="timeline-inst">${tr.institution}</p>
            <p class="timeline-desc">${tr.description}</p>
          </div>
        `).join('');
      }

      // Render Projects
      const projectsContainer = document.getElementById('projects-container');
      if (projectsContainer && data.projects) {
        projectsContainer.innerHTML = data.projects.map(proj => {
          const codeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
          const demoIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
          
          let linkHTML = '';
          if (proj.code_link) {
            linkHTML += `<a href="${proj.code_link}" target="_blank" class="project-link code" title="View Source Code">${codeIcon}</a>`;
          }
          if (proj.demo_link) {
            linkHTML += `<a href="${proj.demo_link}" target="_blank" class="project-link" title="View Live Demo">${demoIcon}</a>`;
          }
          if (!proj.code_link && !proj.demo_link) {
            linkHTML += `<span class="project-link code" style="cursor: not-allowed; opacity: 0.4;">${codeIcon}</span>`;
          }

          // Kebab folder icon SVG
          const folderIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

          return `
            <div class="project-card glass-panel">
              <div>
                <div class="project-header">
                  <h3>${proj.title}</h3>
                  <span class="project-icon">${folderIcon}</span>
                </div>
                <p class="project-desc">${proj.description}</p>
              </div>
              <div class="project-meta">
                <div class="project-tags">
                  ${proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="project-links">
                  ${linkHTML}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Render Publications
      const pubContainer = document.getElementById('publications-container');
      if (pubContainer && data.publications) {
        pubContainer.innerHTML = data.publications.map(pub => {
          let borderStyle = 'border-left: 4px solid var(--accent-cyan);';
          if (pub.meta.includes('QPAIN') || pub.meta.includes('ICECCE')) borderStyle = 'border-left: 4px solid var(--accent-violet);';
          if (pub.meta.includes('Elsevier')) borderStyle = 'border-left: 4px solid var(--accent-green);';
          
          const trophySvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v3.58a6 6 0 0 1-3.92 5.64L12 18l-2.08-.78A6 6 0 0 1 6 11.58V8a6 6 0 0 1 6-6z"></path></svg>`;
          
          return `
            <div class="pub-card glass-panel" style="padding: 2rem; border-radius: 10px; display: flex; flex-direction: column; gap: 0.5rem; transition: var(--transition-smooth); ${borderStyle}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: var(--text-white);">${pub.title}</h4>
                <span class="tag" style="background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 4px;">${pub.meta}</span>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">${pub.details}</p>
              ${pub.doi ? `<a href="${pub.doi}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.9rem; font-weight: 500;">${pub.doi_text} →</a>` : ''}
              ${pub.highlight ? `<p style="color: var(--accent-green); font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">${trophySvg} ${pub.highlight}</p>` : ''}
            </div>
          `;
        }).join('');
      }

      // Render Leadership & Impact
      const leadershipContainer = document.getElementById('leadership-container');
      if (leadershipContainer && data.leadership) {
        leadershipContainer.innerHTML = data.leadership.map(item => `
          <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
            <span style="color: var(--accent-cyan); font-weight: bold; font-size: 1.25rem;">•</span>
            <div>
              <strong>${item.role} — ${item.org}</strong><br>
              <span style="font-size: 0.9rem; color: var(--text-secondary);">${item.desc}</span>
            </div>
          </div>
        `).join('');
      }
      
    } catch (err) {
      console.warn('Error loading dynamic database, falling back to static markup: ', err);
    } finally {
      // Re-trigger typing animation once titles are loaded
      typeAnimation();
    }
  }

  // ==========================================
  // 3. Dynamic Typing Animation
  // ==========================================
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;
  
  const typingTextEl = document.querySelector('.typing-text');
  
  function typeAnimation() {
    if (!typingTextEl) return;
    const currentWord = typingTitles[wordIndex];
    
    if (isDeleting) {
      typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let currentSpeed = isDeleting ? deletingSpeed : typingSpeed;
    
    if (!isDeleting && charIndex === currentWord.length) {
      currentSpeed = pauseTime;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % typingTitles.length;
      currentSpeed = 500;
    }
    
    setTimeout(typeAnimation, currentSpeed);
  }

  // Load database & trigger app
  loadPortfolioData();

  // ==========================================
  // 4. Tech Stack Tab Selector
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const techGrids = document.querySelectorAll('.tech-grid');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      techGrids.forEach(g => g.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetGrid = document.getElementById(targetId);
      if (targetGrid) {
        targetGrid.classList.add('active');
      }
    });
  });

  // ==========================================
  // 5. GitHub API Live Stats Fetcher
  // ==========================================
  const username = 'IzayaRais';
  const statsElements = {
    publicRepos: document.getElementById('stat-repos'),
    followers: document.getElementById('stat-followers'),
    stars: document.getElementById('stat-stars'),
    following: document.getElementById('stat-following')
  };

  const fallbackStats = {
    public_repos: 37,
    followers: 2,
    following: 4,
    stars: 2
  };

  async function fetchGitHubStats() {
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user stats');
      const userData = await userResponse.json();
      
      if (statsElements.publicRepos) statsElements.publicRepos.textContent = userData.public_repos || fallbackStats.public_repos;
      if (statsElements.followers) statsElements.followers.textContent = userData.followers || fallbackStats.followers;
      if (statsElements.following) statsElements.following.textContent = userData.following || fallbackStats.following;

      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        const totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
        if (statsElements.stars) statsElements.stars.textContent = totalStars;
      } else {
        if (statsElements.stars) statsElements.stars.textContent = fallbackStats.stars;
      }
    } catch (error) {
      if (statsElements.publicRepos) statsElements.publicRepos.textContent = fallbackStats.public_repos;
      if (statsElements.followers) statsElements.followers.textContent = fallbackStats.followers;
      if (statsElements.following) statsElements.following.textContent = fallbackStats.following;
      if (statsElements.stars) statsElements.stars.textContent = fallbackStats.stars;
    }
  }

  fetchGitHubStats();
  
  // ==========================================
  // 6. Navigation Link Indicator on Scroll
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollPos >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 7. Mobile Navigation Toggle
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = mobileNav.classList.toggle('active');
      menuToggle.classList.toggle('active', isActive);
      menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Auto-close menu when clicking links
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================
  // 8. Scroll-Triggered Reveal Animations
  // ==========================================
  const revealElements = document.querySelectorAll('.section, .glass-panel, .project-card, .timeline-item, .pub-card');
  
  // Initialize elements for scroll animation (except those above fold, e.g., hero section)
  revealElements.forEach(el => {
    if (!el.closest('#home') && el.id !== 'home') {
      el.classList.add('reveal-item');
    }
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal-item').forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================
  // 9. Radial Cursor Glow Effect
  // ==========================================
  const glowCards = document.querySelectorAll('.glass-panel, .project-card, .pub-card, .about-card');
  glowCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ==========================================
  // 10. Back to Top Button
  // ==========================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
