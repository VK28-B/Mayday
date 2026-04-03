(() => {
  "use strict";

  const OFFICIAL_EMAIL = "incarnation.studios.official@gmail.com";
  const EMAIL_SEND_TIMEOUT_MS = 15000;
  const MAYDAY_ROUTE = "men-in-mayday";

  const FALLBACK_CONFIG = {
    name: "Incarnation Studios",
    description:
      "Incarnation Studios is a game development company focused on creating immersive and engaging gaming experiences. We are dedicated to pushing the boundaries of interactive entertainment and delivering high-quality games that captivate players around the world.",
    website: "https://www.incarnationstudios.in",
    version: "1.0.0",
    tech_stack: {
      frontend: "React (via CDN)",
      styling: "Tailwind CSS (via CDN)",
      scripts: "Babel (for JSX support in browser)",
      language: "JavaScript (ES6+)"
    },
    design_preferences: {
      preloader: "INITIALIZING SYSTEM...",
      Page_sections: {
        games_list: {
          game1: {
            title: "Men in Mayday",
            description:
              "A realistic island survival experience where every decision matters. Stranded alone in a vast, untamed wilderness, you must gather resources, craft tools, and adapt to a constantly changing environment to stay alive. From chopping down trees and building shelter to managing hunger, thirst, and stamina, survival depends on your ability to plan ahead and use what nature provides. Explore dense forests, shifting weather, and a dynamic day-night cycle that transforms the island into both a place of beauty and danger. Progression is driven by your choices - upgrade your tools, improve your efficiency, and shape your own path through the wild. This is not just about surviving - it's about mastering the environment.",
            tagline: "Survive the island. Master the wild.",
            status: "In Development, Coming Soon!"
          }
        }
      }
    },
    Contact_information: {
      email: OFFICIAL_EMAIL,
      social_media: {
        Discord: "https://discord.gg/Ch3aUQAQ"
      }
    },
    emailjs: {
      public_key: "YOUR_EMAILJS_PUBLIC_KEY",
      service_id: "YOUR_EMAILJS_SERVICE_ID",
      template_id: "YOUR_EMAILJS_TEMPLATE_ID"
    },
    seo_metadata: {
      keywords: [
        "Incarnation Studios",
        "Men in Mayday",
        "Men in Mayday game",
        "tactical survival games",
        "realistic survival experience",
        "island survival simulator",
        "hardcore survival 2025",
        "immersive gaming",
        "indie game developer India",
        "PC survival games",
        "open world survival craft",
        "strategic combat simulator",
        "gritty game aesthetic",
        "tactical realism gaming",
        "industrial game design",
        "Men in Mayday survival guide",
        "best survival games 2025",
        "new indie game studio",
        "unreal engine survival game",
        "first person survival",
        "wilderness survival mechanics",
        "base building survival",
        "crafting and survival",
        "high-stakes gaming",
        "tactical shooter elements",
        "environmental storytelling",
        "dark mode gaming website",
        "Men in Mayday alpha",
        "game dev studio portfolio",
        "military tech aesthetic",
        "survival horror elements",
        "dynamic weather survival",
        "day night cycle games",
        "resource management games",
        "challenging indie games",
        "Men in Mayday developer",
        "tactical HUD design",
        "survival game community",
        "Discord gaming community",
        "upcoming steam games 2025",
        "realistic island environment",
        "survival crafting gameplay",
        "strategic wilderness survival",
        "indie dev log",
        "Men in Mayday trailer",
        "tactical gameplay mechanics",
        "hardcore permadeath games",
        "survival sandbox 2025",
        "next-gen survival indie",
        "master the wild"
      ]
    }
  };

  const NAV_ITEMS = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "games", label: "Games" },
    { id: "contact", label: "Contact" }
  ];

  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  const appState = {
    config: normalizeConfig(FALLBACK_CONFIG),
    progress: 0,
    preloaderTimer: null,
    cleanupFns: [],
    emailJsInitializedFor: ""
  };

  function isMaydayRoute() {
    try {
      return new URLSearchParams(window.location.search).get("page") === MAYDAY_ROUTE;
    } catch (error) {
      return false;
    }
  }

  applyTheme(getStoredTheme());
  renderCurrentView(appState.config);
  if (!isMaydayRoute()) {
    startPreloader();
  }
  initializeRuntime();

  loadConfig()
    .then((rawConfig) => {
      appState.config = normalizeConfig(rawConfig);
      renderCurrentView(appState.config);
      initializeRuntime();
    })
    .catch(() => {
      appState.config = normalizeConfig(FALLBACK_CONFIG);
      renderCurrentView(appState.config);
      initializeRuntime();
    })
    .finally(() => {
      if (!isMaydayRoute()) {
        completePreloader();
      }
    });

  function getStoredTheme() {
    try {
      return localStorage.getItem("site-theme") || "dark";
    } catch (error) {
      return "dark";
    }
  }

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
  }

  function loadConfig() {
    if (typeof fetch !== "function") {
      return tryLoadConfigViaXhr().catch(() => FALLBACK_CONFIG);
    }

    const supportsAbortController = typeof AbortController === "function";
    const controller = supportsAbortController ? new AbortController() : null;
    const timeoutId = setTimeout(() => {
      if (controller) {
        controller.abort();
      }
    }, 2500);

    const requestOptions = { cache: "no-store" };
    if (controller) {
      requestOptions.signal = controller.signal;
    }

    return fetch("config.json", requestOptions)
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error("Unable to load config.json");
        }
        return response.json();
      })
      .catch(() => {
        clearTimeout(timeoutId);
        return tryLoadConfigViaXhr().catch(() => FALLBACK_CONFIG);
      });
  }

  function tryLoadConfigViaXhr() {
    return new Promise((resolve, reject) => {
      try {
        const request = new XMLHttpRequest();
        request.open("GET", "config.json", true);
        request.timeout = 2500;
        request.onreadystatechange = () => {
          if (request.readyState !== 4) {
            return;
          }
          if (request.status === 200 || request.status === 0) {
            try {
              const parsed = JSON.parse(request.responseText);
              resolve(parsed);
            } catch (error) {
              reject(error);
            }
            return;
          }
          reject(new Error("XHR config load failed"));
        };
        request.onerror = () => reject(new Error("XHR request error"));
        request.ontimeout = () => reject(new Error("XHR config load timed out"));
        request.send();
      } catch (error) {
        reject(error);
      }
    });
  }

  function normalizeConfig(input) {
    const source = input && typeof input === "object" ? input : {};
    const fallbackGame = FALLBACK_CONFIG.design_preferences.Page_sections.games_list.game1;
    const sourceGame =
      source.design_preferences &&
      source.design_preferences.Page_sections &&
      source.design_preferences.Page_sections.games_list &&
      source.design_preferences.Page_sections.games_list.game1
        ? source.design_preferences.Page_sections.games_list.game1
        : {};

    const sourceTech = source.tech_stack && typeof source.tech_stack === "object" ? source.tech_stack : {};
    const sourceKeywords =
      source.seo_metadata && Array.isArray(source.seo_metadata.keywords) ? source.seo_metadata.keywords : [];
    const sourceEmailJs = source.emailjs && typeof source.emailjs === "object" ? source.emailjs : {};
    const inlineEmailJs =
      window.__EMAILJS_CONFIG__ && typeof window.__EMAILJS_CONFIG__ === "object"
        ? window.__EMAILJS_CONFIG__
        : {};

    return {
      name: asText(source.name, FALLBACK_CONFIG.name),
      description: asText(source.description, FALLBACK_CONFIG.description),
      website: asText(source.website, FALLBACK_CONFIG.website),
      version: asText(source.version, FALLBACK_CONFIG.version),
      preloaderLabel: asText(
        source.design_preferences && source.design_preferences.preloader,
        FALLBACK_CONFIG.design_preferences.preloader
      ),
      techStack: Object.keys(sourceTech).length ? sourceTech : FALLBACK_CONFIG.tech_stack,
      email: asText(
        source.Contact_information &&
          source.Contact_information.email,
        OFFICIAL_EMAIL
      ),
      discord: asText(
        source.Contact_information &&
          source.Contact_information.social_media &&
          source.Contact_information.social_media.Discord,
        FALLBACK_CONFIG.Contact_information.social_media.Discord
      ),
      game: {
        title: asText(sourceGame.title, fallbackGame.title),
        description: sanitizeDescription(asText(sourceGame.description, fallbackGame.description)),
        tagline: asText(sourceGame.tagline, fallbackGame.tagline),
        status: asText(sourceGame.status, fallbackGame.status)
      },
      emailjs: {
        publicKey: asText(
          sourceEmailJs.public_key || sourceEmailJs.publicKey || inlineEmailJs.public_key || inlineEmailJs.publicKey,
          FALLBACK_CONFIG.emailjs.public_key
        ),
        serviceId: asText(
          sourceEmailJs.service_id || sourceEmailJs.serviceId || inlineEmailJs.service_id || inlineEmailJs.serviceId,
          FALLBACK_CONFIG.emailjs.service_id
        ),
        templateId: asText(
          sourceEmailJs.template_id || sourceEmailJs.templateId || inlineEmailJs.template_id || inlineEmailJs.templateId,
          FALLBACK_CONFIG.emailjs.template_id
        )
      },
      keywords: sourceKeywords.length ? sourceKeywords : FALLBACK_CONFIG.seo_metadata.keywords
    };
  }

  function asText(value, fallback) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return fallback;
  }

  function sanitizeDescription(value) {
    return asText(value, "")
      .replace(/[^\x20-\x7E]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function techStackMarkup(techStack) {
    return Object.entries(techStack)
      .map(([label, value]) => {
        return (
          '<li>' +
          "<span>" +
          escapeHtml(label.replace(/_/g, " ")) +
          "</span>" +
          "<strong>" +
          escapeHtml(String(value)) +
          "</strong>" +
          "</li>"
        );
      })
      .join("");
  }

  function navMarkup() {
    return NAV_ITEMS.map((item) => {
      return (
        '<a href="#' +
        escapeHtml(item.id) +
        '" class="nav-link">' +
        escapeHtml(item.label) +
        "</a>"
      );
    }).join("");
  }

  function footerNavMarkup(discord) {
    const links = NAV_ITEMS.map((item) => {
      return (
        '<a href="#' +
        escapeHtml(item.id) +
        '">' +
        escapeHtml(item.label) +
        "</a>"
      );
    }).join("");

    return (
      links +
      '<a href="' +
      escapeHtml(discord) +
      '" target="_blank" rel="noreferrer">Discord</a>'
    );
  }

  function renderCurrentView(config) {
    if (isMaydayRoute()) {
      renderMayday(config);
      return;
    }
    renderMain(config);
  }

  function renderMain(config) {
    const theme = getStoredTheme();
    const themeLabel = theme === "dark" ? "Light Mode" : "Dark Mode";

    root.innerHTML = `
      <div class="site-shell">
        <div class="preloader" role="status" aria-live="polite">
          <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios emblem" loading="eager" decoding="async" />
          <p class="preloader-label">${escapeHtml(config.preloaderLabel)}</p>
          <div class="preloader-bar" aria-hidden="true">
            <div class="preloader-fill" style="width: 0%;"></div>
          </div>
          <p class="preloader-percent">0%</p>
        </div>

        <header class="top-nav">
          <div class="container nav-content">
            <a class="nav-brand" href="#home">
              <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios logo" loading="eager" decoding="async" width="42" height="42" />
              <span>${escapeHtml(config.name)}</span>
            </a>
            <button type="button" class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button>
            <nav class="nav-links" aria-label="Primary navigation">
              ${navMarkup()}
            </nav>
            <div class="nav-actions">
              <button type="button" class="theme-toggle" aria-label="Toggle color theme">${themeLabel}</button>
              <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer" class="btn btn-secondary btn-glitch" data-text="Join Discord">Join Discord</a>
            </div>
          </div>
        </header>

        <main id="main-content">
          <section id="home" class="hero">
            <div class="scanline-overlay" aria-hidden="true"></div>
            <div class="container hero-grid">
              <div class="hero-copy reveal">
                <p class="kicker">Immersive Tactical Gaming</p>
                <h1 class="hero-title">${escapeHtml(config.name)} crafts immersive games that players remember.</h1>
                <p>${escapeHtml(config.description)}</p>

                <div class="hero-actions">
                  <a href="#games" class="btn btn-primary btn-glitch" data-text="Explore Game">Explore Game</a>
                  <a href="#contact" class="btn btn-ghost btn-glitch" data-text="Contact Team">Contact Team</a>
                </div>

                <ul class="hero-stats">
                  <li>
                    <span>Version</span>
                    <strong>${escapeHtml(config.version)}</strong>
                  </li>
                  <li>
                    <span>Headquarters</span>
                    <strong>India</strong>
                  </li>
                  <li>
                    <span>Community</span>
                    <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer">Join Discord</a>
                  </li>
                </ul>
              </div>

              <figure class="hero-logo-wrap reveal">
                <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios company logo" loading="eager" decoding="async" />
                <figcaption class="logo-caption">Independent Game Development Studio</figcaption>
                <p class="hero-logo-note">Building tactical, immersive, and player-first experiences.</p>
              </figure>
            </div>
          </section>

          <section id="about" class="section reveal">
            <div class="container">
              <div class="section-head">
                <p class="section-kicker">About</p>
                <h2 class="section-title">Studio Brief</h2>
                <p class="section-copy">
                  ${escapeHtml(config.name)} is focused on building memorable survival experiences with strong world design, reliable systems, and long-term community engagement.
                </p>
              </div>

              <div class="about-grid">
                <article class="panel team-panel interactive-tilt">
                  <h3 class="section-title" style="font-size: 1.22rem; margin-top: 0;">Studio Snapshot</h3>
                  <ul class="team-list">
                    <li class="team-member">
                      <strong>Independent Development Studio</strong>
                      <span>Focused on immersive survival experiences with strong identity and polish.</span>
                    </li>
                    <li class="team-member">
                      <strong>Community-First Communication</strong>
                      <span>Players can connect through official Discord, email, and direct inquiry channels.</span>
                    </li>
                    <li class="team-member">
                      <strong>Long-Term Product Vision</strong>
                      <span>Building worlds that grow with consistent updates and transparent milestone sharing.</span>
                    </li>
                  </ul>
                </article>

                <aside class="panel mission-panel">
                  <h3 class="section-title" style="font-size: 1.22rem; margin-top: 0;">What We Stand For</h3>
                  <p class="section-copy">
                    We combine technical discipline with creative direction to ship games that reward strategy, adaptation, and smart decision making.
                  </p>
                  <ul class="mission-list">
                    <li>Player-first game systems with meaningful choices.</li>
                    <li>High quality production standards and consistent polish.</li>
                    <li>Transparent communication with our community.</li>
                  </ul>
                  <div class="mini-brand">
                    <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios emblem" loading="lazy" decoding="async" />
                    <p>Incarnation Studios</p>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section id="games" class="section reveal">
            <div class="container">
              <div class="section-head">
                <p class="section-kicker">Games</p>
                <h2 class="section-title">Featured Project</h2>
                <p class="section-copy">
                  Explore our flagship title built around tactical survival, environmental pressure, and player-driven progression.
                </p>
              </div>

              <div class="games-grid">
                <article class="game-card interactive-tilt">
                  <figure class="media">
                    <img src="assets/men-in-mayday-logo.png" alt="Men in Mayday key logo artwork" loading="lazy" decoding="async" />
                  </figure>
                  <div class="game-content">
                    <span class="status-pill">${escapeHtml(config.game.status)}</span>
                    <h3>${escapeHtml(config.game.title)}</h3>
                    <p>${escapeHtml(config.game.description)}</p>
                    <p class="tagline">${escapeHtml(config.game.tagline)}</p>
                    <a href="?page=men-in-mayday" class="btn btn-primary btn-glitch" data-text="Learn More">Learn More</a>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section id="contact" class="section reveal">
            <div class="container">
              <div class="section-head">
                <p class="section-kicker">Contact</p>
                <h2 class="section-title">Transmit Inquiry</h2>
                <p class="section-copy">
                  Use the form to send your inquiry directly to ${escapeHtml(config.name)} via secure EmailJS delivery.
                </p>
              </div>

              <div class="contact-grid">
                <article class="panel">
                  <h3 class="section-title" style="font-size: 1.2rem; margin-top: 0;">Contact Information</h3>
                  <ul class="contact-list">
                    <li><strong>Email:</strong> <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a></li>
                    <li><strong>Discord:</strong> <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer">Join the Community</a></li>
                    <li><strong>Website:</strong> <a href="${escapeHtml(config.website)}" target="_blank" rel="noreferrer">${escapeHtml(config.website)}</a></li>
                  </ul>
                  <div class="contact-brand-card">
                    <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios logo mark" loading="lazy" decoding="async" />
                    <div>
                      <strong>Response Window</strong>
                      <p>We usually respond to genuine inquiries within 24-48 hours.</p>
                    </div>
                  </div>
                </article>

                <form class="contact-form">
                  <div class="field">
                    <label for="name">Name</label>
                    <input id="name" name="name" type="text" placeholder="Your name" required />
                  </div>
                  <div class="field">
                    <label for="email">Email</label>
                    <input id="email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div class="field">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" placeholder="Tell us about your inquiry..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-secondary btn-glitch" data-text="Send Message">Send Message</button>
                  <p class="form-status" role="status" aria-live="polite" hidden></p>
                  <p class="form-helper">Live delivery powered by EmailJS to ${escapeHtml(config.email)}.</p>
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer class="site-footer">
          <div class="container">
            <div class="footer-grid">
              <div>
                <p class="footer-brand">
                  <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios symbol" loading="lazy" decoding="async" width="30" height="30" />
                  <span>${escapeHtml(config.name)}</span>
                </p>
                <p class="copyright">&copy; ${String(new Date().getFullYear())} ${escapeHtml(config.name)}. All rights reserved.</p>
              </div>
              <nav class="footer-links" aria-label="Footer navigation">
                ${footerNavMarkup(config.discord)}
              </nav>
            </div>
          </div>
        </footer>
      </div>
    `;

    setProgress(appState.progress);
  }

  function renderMayday(config) {
    const theme = getStoredTheme();
    const themeLabel = theme === "dark" ? "Light Mode" : "Dark Mode";

    root.innerHTML = `
      <div class="game-page">
        <header class="top-nav">
          <div class="container nav-content">
            <a class="nav-brand" href="index.htm#home">
              <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios logo" loading="eager" decoding="async" width="42" height="42" />
              <span>${escapeHtml(config.name)}</span>
            </a>
            <button type="button" class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button>
            <nav class="nav-links" aria-label="Game page navigation">
              <a href="#overview" class="nav-link">Overview</a>
              <a href="#systems" class="nav-link">Systems</a>
              <a href="#community" class="nav-link">Community</a>
            </nav>
            <div class="nav-actions">
              <button type="button" class="theme-toggle" aria-label="Toggle color theme">${themeLabel}</button>
              <a href="index.htm#games" class="btn btn-secondary btn-glitch" data-text="Back To Studio">Back To Studio</a>
            </div>
          </div>
        </header>

        <main id="main-content">
          <section id="overview" class="game-hero">
            <div class="container game-hero-grid">
              <div class="reveal">
                <p class="section-kicker">Dedicated Game Page</p>
                <h1 class="hero-title">${escapeHtml(config.game.title)}</h1>
                <p class="section-copy">${escapeHtml(config.game.description)}</p>
                <div class="hero-actions">
                  <a href="${escapeHtml(config.website)}" target="_blank" rel="noreferrer" class="btn btn-primary btn-glitch" data-text="Official Site">Official Site</a>
                  <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-glitch" data-text="Join Discord">Join Discord</a>
                </div>
                <p class="tagline">${escapeHtml(config.game.tagline)}</p>
              </div>

              <div class="reveal">
                <div class="game-logo-box interactive-tilt">
                  <img src="assets/men-in-mayday-logo.png" alt="Men in Mayday logo art" />
                </div>
                <div class="hud-panel" style="margin-top: 0.8rem;">
                  <div class="hud-row"><span>Build</span><strong>${escapeHtml(config.game.status)}</strong></div>
                  <div class="hud-bar"><i></i></div>
                  <div class="hud-row"><span>Live Environment</span><strong>Dynamic Day/Night + Weather</strong></div>
                </div>
              </div>
            </div>
          </section>

          <section id="systems" class="section reveal">
            <div class="container">
              <div class="section-head">
                <p class="section-kicker">Experience</p>
                <h2 class="section-title">What Makes Men in Mayday Distinct</h2>
              </div>
              <div class="feature-grid">
                <article class="feature-card interactive-tilt">
                  <h3>Immersive World Tone</h3>
                  <p>A grounded island setting with a strong atmosphere designed for long-form exploration.</p>
                </article>
                <article class="feature-card interactive-tilt">
                  <h3>Meaningful Player Journey</h3>
                  <p>Every session is built to feel personal, with progress that reflects player intent and style.</p>
                </article>
                <article class="feature-card interactive-tilt">
                  <h3>Community-Driven Direction</h3>
                  <p>Feedback from players helps shape updates, priorities, and overall studio communication.</p>
                </article>
              </div>
            </div>
          </section>

          <section id="community" class="section reveal">
            <div class="container">
              <div class="section-head">
                <p class="section-kicker">Community</p>
                <h2 class="section-title">Stay Connected With The Studio</h2>
                <p class="section-copy">
                  Follow official channels for verified announcements, development updates, and community activities without spoilers or gameplay mechanic breakdowns.
                </p>
              </div>
              <div class="about-grid">
                <article class="panel">
                  <h3 class="section-title" style="font-size: 1.22rem; margin-top: 0;">What Players Receive</h3>
                  <ul class="mission-list">
                    <li>Verified announcements directly from Incarnation Studios.</li>
                    <li>Milestone updates and release window news in one place.</li>
                    <li>Community events, Q&A notices, and creator spotlights.</li>
                    <li>Clear support routes for business, media, and player inquiries.</li>
                  </ul>
                </article>

                <aside class="panel mission-panel">
                  <h3 class="section-title" style="font-size: 1.22rem; margin-top: 0;">Official Channels</h3>
                  <ul class="contact-list">
                    <li><strong>Discord:</strong> <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer">Join the Community</a></li>
                    <li><strong>Website:</strong> <a href="${escapeHtml(config.website)}" target="_blank" rel="noreferrer">${escapeHtml(config.website)}</a></li>
                    <li><strong>Email:</strong> <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a></li>
                  </ul>
                  <div class="hero-actions">
                    <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer" class="btn btn-primary btn-glitch" data-text="Join Discord">Join Discord</a>
                    <a href="index.htm#contact" class="btn btn-ghost btn-glitch" data-text="Contact Team">Contact Team</a>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>

        <footer class="site-footer">
          <div class="container">
            <div class="footer-grid">
              <div>
                <p class="footer-brand">
                  <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios symbol" loading="lazy" decoding="async" width="30" height="30" />
                  <span>${escapeHtml(config.name)}</span>
                </p>
                <p class="copyright">&copy; ${String(new Date().getFullYear())} ${escapeHtml(config.name)}. All rights reserved.</p>
              </div>
              <nav class="footer-links" aria-label="Footer navigation">
                <a href="index.htm">Main Site</a>
                <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer">Discord</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  function startPreloader() {
    clearInterval(appState.preloaderTimer);
    appState.progress = 0;
    setProgress(appState.progress);
    appState.preloaderTimer = setInterval(() => {
      if (appState.progress >= 92) {
        return;
      }
      const jump = Math.floor(Math.random() * 7) + 2;
      setProgress(Math.min(92, appState.progress + jump));
    }, 120);
  }

  function completePreloader() {
    clearInterval(appState.preloaderTimer);
    setProgress(100);

    const preloader = root.querySelector(".preloader");
    if (!preloader) {
      return;
    }

    window.setTimeout(() => {
      preloader.style.transition = "opacity 0.35s ease";
      preloader.style.opacity = "0";
      window.setTimeout(() => {
        preloader.style.display = "none";
      }, 360);
    }, 320);
  }

  function setProgress(value) {
    appState.progress = Math.max(0, Math.min(100, Number(value) || 0));
    const fill = root.querySelector(".preloader-fill");
    const label = root.querySelector(".preloader-percent");
    if (fill) {
      fill.style.width = String(appState.progress) + "%";
    }
    if (label) {
      label.textContent = String(appState.progress) + "%";
    }
  }

  function initializeRuntime() {
    cleanupRuntime();
    bindThemeToggle();
    bindMenuToggle();
    bindContactForm();
    bindParallax();
    bindRevealAnimations();
    bindActiveNav();
    bindTiltCards();
    bindButtonRipple();
  }

  function cleanupRuntime() {
    while (appState.cleanupFns.length) {
      const fn = appState.cleanupFns.pop();
      try {
        fn();
      } catch (error) {
        continue;
      }
    }
  }

  function addCleanup(fn) {
    appState.cleanupFns.push(fn);
  }

  function bindThemeToggle() {
    const button = root.querySelector(".theme-toggle");
    if (!button) {
      return;
    }

    const onClick = () => {
      const current = getStoredTheme();
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("site-theme", next);
      } catch (error) {
        /* ignore storage errors */
      }
      button.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
    };

    button.addEventListener("click", onClick);
    addCleanup(() => button.removeEventListener("click", onClick));
  }

  function bindMenuToggle() {
    const nav = root.querySelector(".top-nav");
    const toggle = root.querySelector(".menu-toggle");
    const links = root.querySelectorAll(".nav-link");

    if (!nav || !toggle) {
      return;
    }

    const onToggle = () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const onClose = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", onToggle);
    links.forEach((link) => link.addEventListener("click", onClose));

    addCleanup(() => {
      toggle.removeEventListener("click", onToggle);
      links.forEach((link) => link.removeEventListener("click", onClose));
    });
  }

  function bindContactForm() {
    const form = root.querySelector(".contact-form");
    if (!form) {
      return;
    }

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

    const onSubmit = async (event) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      const formData = new FormData(form);
      const name = asText(formData.get("name"), "Operator");
      const email = asText(formData.get("email"), "Not Provided");
      const message = asText(formData.get("message"), "No message provided.");
      const recipient = OFFICIAL_EMAIL;

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (name.length < 2) {
        if (status) {
          status.hidden = false;
          status.dataset.status = "error";
          status.textContent = "Please enter your full name.";
        }
        return;
      }
      if (!isEmailValid) {
        if (status) {
          status.hidden = false;
          status.dataset.status = "error";
          status.textContent = "Please enter a valid email address.";
        }
        return;
      }
      if (message.length < 10) {
        if (status) {
          status.hidden = false;
          status.dataset.status = "error";
          status.textContent = "Message is too short. Please provide a little more detail.";
        }
        return;
      }

      const emailJsCfg = appState.config && appState.config.emailjs ? appState.config.emailjs : {};
      const publicKey = asText(emailJsCfg.publicKey, "");
      const serviceId = asText(emailJsCfg.serviceId, "");
      const templateId = asText(emailJsCfg.templateId, "");
      const hasValidConfig =
        publicKey &&
        serviceId &&
        templateId &&
        publicKey.indexOf("YOUR_EMAILJS") === -1 &&
        serviceId.indexOf("YOUR_EMAILJS") === -1 &&
        templateId.indexOf("YOUR_EMAILJS") === -1;

      if (status) {
        status.hidden = false;
        status.dataset.status = "pending";
        status.textContent = "Sending your inquiry...";
      }
      if (submitButton) {
        isSubmitting = true;
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      try {
        if (!window.emailjs || typeof window.emailjs.send !== "function") {
          throw new Error("EmailJS SDK was not loaded.");
        }
        if (!hasValidConfig) {
          throw new Error("EmailJS is not configured. Add emailjs keys in config.json.");
        }

        if (appState.emailJsInitializedFor !== publicKey) {
          window.emailjs.init({ publicKey });
          appState.emailJsInitializedFor = publicKey;
        }

        await Promise.race([
          window.emailjs.send(serviceId, templateId, {
            to_email: recipient,
            from_name: name,
            from_email: email,
            reply_to: email,
            message,
            subject: "Website Inquiry - " + name,
            website_name: asText(appState.config && appState.config.name, FALLBACK_CONFIG.name)
          }),
          new Promise((_, reject) => {
            window.setTimeout(() => {
              reject(new Error("Request timed out. Please try once more."));
            }, EMAIL_SEND_TIMEOUT_MS);
          })
        ]);

        if (status) {
          status.dataset.status = "success";
          status.textContent = "Inquiry sent successfully. Our team will get back to you soon.";
        }
        form.reset();
      } catch (error) {
        if (status) {
          status.dataset.status = "error";
          status.textContent = "Unable to send right now. " + String(error && error.message ? error.message : "Please try again.");
        }
      } finally {
        if (submitButton) {
          isSubmitting = false;
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    };

    form.addEventListener("submit", onSubmit);
    addCleanup(() => form.removeEventListener("submit", onSubmit));
  }

  function bindParallax() {
    const onScroll = () => {
      const offset = Math.round(window.scrollY * 0.22);
      document.documentElement.style.setProperty("--parallax-offset", String(offset) + "px");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    addCleanup(() => window.removeEventListener("scroll", onScroll));
  }

  function bindRevealAnimations() {
    const revealTargets = root.querySelectorAll(".reveal");
    if (!revealTargets.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );

    revealTargets.forEach((node) => observer.observe(node));
    addCleanup(() => observer.disconnect());
  }

  function bindActiveNav() {
    const links = Array.from(root.querySelectorAll(".nav-link"));
    if (!links.length) {
      return;
    }

    const sections = links
      .map((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) {
          return null;
        }
        const section = document.querySelector(href);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    const setActive = (targetId) => {
      sections.forEach((item) => {
        const isMatch = item.section.id === targetId;
        item.link.classList.toggle("is-active", isMatch);
        if (isMatch) {
          item.link.setAttribute("aria-current", "page");
        } else {
          item.link.removeAttribute("aria-current");
        }
      });
    };

    if (!("IntersectionObserver" in window)) {
      const onHashChange = () => {
        const currentHash = String(window.location.hash || "").replace(/^#/, "");
        const found = sections.find((item) => item.section.id === currentHash);
        setActive((found || sections[0]).section.id);
      };

      const clickHandlers = sections.map((item) => {
        const onClick = () => setActive(item.section.id);
        item.link.addEventListener("click", onClick);
        return { link: item.link, onClick };
      });

      window.addEventListener("hashchange", onHashChange);
      onHashChange();

      addCleanup(() => {
        window.removeEventListener("hashchange", onHashChange);
        clickHandlers.forEach((entry) => {
          entry.link.removeEventListener("click", entry.onClick);
        });
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let topEntry = null;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          if (!topEntry || entry.intersectionRatio > topEntry.intersectionRatio) {
            topEntry = entry;
          }
        });
        if (topEntry && topEntry.target && topEntry.target.id) {
          setActive(topEntry.target.id);
        }
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-10% 0px -45% 0px" }
    );

    sections.forEach((item) => observer.observe(item.section));
    setActive(sections[0].section.id);

    addCleanup(() => observer.disconnect());
  }

  function bindTiltCards() {
    const cards = Array.from(root.querySelectorAll(".interactive-tilt"));
    if (!cards.length) {
      return;
    }

    cards.forEach((card) => {
      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        const rotateY = (px - 0.5) * 8;
        const rotateX = (0.5 - py) * 8;

        card.style.transform = "perspective(1000px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
      };

      const onLeave = () => {
        card.style.transform = "";
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);

      addCleanup(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
  }

  function bindButtonRipple() {
    const buttons = Array.from(root.querySelectorAll(".btn"));
    if (!buttons.length) {
      return;
    }

    buttons.forEach((button) => {
      const onClick = (event) => {
        const rect = button.getBoundingClientRect();
        const hasPointer = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX !== 0 || event.clientY !== 0);
        const left = hasPointer ? event.clientX - rect.left : rect.width / 2;
        const top = hasPointer ? event.clientY - rect.top : rect.height / 2;
        const ripple = document.createElement("span");
        ripple.className = "btn-ripple";
        ripple.style.left = String(left) + "px";
        ripple.style.top = String(top) + "px";
        button.appendChild(ripple);

        window.setTimeout(() => {
          ripple.remove();
        }, 520);
      };

      button.addEventListener("click", onClick);
      addCleanup(() => button.removeEventListener("click", onClick));
    });
  }
})();
