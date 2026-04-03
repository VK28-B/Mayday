(() => {
  "use strict";

  const OFFICIAL_EMAIL = "incarnation.studios.official@gmail.com";
  const EMAIL_SEND_TIMEOUT_MS = 15000;
  const MAIN_ROUTE = "";
  const MAYDAY_ROUTE = "men-in-mayday";
  const LOGIN_ROUTE = "login";
  const SIGNUP_ROUTE = "signup";
  const PROFILE_ROUTE = "profile";
  const SETTINGS_ROUTE = "account-settings";
  const AUTH_USERS_KEY = "incarnation-auth-users";
  const AUTH_SESSION_KEY = "incarnation-auth-session";

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
            status: "In development - coming soon."
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
    emailJsInitializedFor: "",
    currentUser: null
  };

  function getCurrentRoute() {
    try {
      return asText(new URLSearchParams(window.location.search).get("page"), MAIN_ROUTE).toLowerCase();
    } catch (error) {
      return MAIN_ROUTE;
    }
  }

  function isMainRoute() {
    return getCurrentRoute() === MAIN_ROUTE;
  }

  function isMaydayRoute() {
    return getCurrentRoute() === MAYDAY_ROUTE;
  }

  function shouldUsePreloader() {
    const route = getCurrentRoute();
    const knownRoutes = [MAIN_ROUTE, MAYDAY_ROUTE, LOGIN_ROUTE, SIGNUP_ROUTE, PROFILE_ROUTE, SETTINGS_ROUTE];
    return knownRoutes.indexOf(route) === -1 || route === MAIN_ROUTE;
  }

  appState.currentUser = getAuthenticatedUser();

  applyTheme(getStoredTheme());
  renderCurrentView(appState.config);
  if (shouldUsePreloader()) {
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
      if (shouldUsePreloader()) {
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

  function getAuthUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function setAuthUsers(users) {
    try {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(Array.isArray(users) ? users : []));
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function getAuthSession() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      const sessionRaw = raw || sessionStorage.getItem(AUTH_SESSION_KEY);
      if (!sessionRaw) {
        return null;
      }
      const parsed = JSON.parse(sessionRaw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function setAuthSession(session, persistAcrossBrowserRestarts) {
    const persist = persistAcrossBrowserRestarts !== false;
    try {
      const value = JSON.stringify(session);
      if (persist) {
        localStorage.setItem(AUTH_SESSION_KEY, value);
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } else {
        sessionStorage.setItem(AUTH_SESSION_KEY, value);
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function clearAuthSession() {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function getAuthenticatedUser() {
    const session = getAuthSession();
    if (!session || !session.userId) {
      return null;
    }
    const users = getAuthUsers();
    const match = users.find((user) => user && user.id === session.userId);
    return match || null;
  }

  function createUserId() {
    return "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function getUserInitials(name) {
    const safe = asText(name, "Player");
    const parts = safe.split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) {
      return "PL";
    }
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  function persistUser(updatedUser) {
    const users = getAuthUsers();
    const hasMatch = users.some((user) => user && user.id === updatedUser.id);
    const nextUsers = hasMatch
      ? users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      : users.concat([updatedUser]);
    setAuthUsers(nextUsers);
    const current = getAuthenticatedUser();
    if (current && current.id === updatedUser.id) {
      appState.currentUser = updatedUser;
    }
  }

  function logoutCurrentUser() {
    clearAuthSession();
    appState.currentUser = null;
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
        publicKey: pickConfiguredValue([
          sourceEmailJs.public_key,
          sourceEmailJs.publicKey,
          inlineEmailJs.public_key,
          inlineEmailJs.publicKey,
          FALLBACK_CONFIG.emailjs.public_key
        ]),
        serviceId: pickConfiguredValue([
          sourceEmailJs.service_id,
          sourceEmailJs.serviceId,
          inlineEmailJs.service_id,
          inlineEmailJs.serviceId,
          FALLBACK_CONFIG.emailjs.service_id
        ]),
        templateId: pickConfiguredValue([
          sourceEmailJs.template_id,
          sourceEmailJs.templateId,
          inlineEmailJs.template_id,
          inlineEmailJs.templateId,
          FALLBACK_CONFIG.emailjs.template_id
        ])
      },
      keywords: sourceKeywords.length ? sourceKeywords : FALLBACK_CONFIG.seo_metadata.keywords
    };
  }

  function pickConfiguredValue(candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    for (let i = 0; i < list.length; i += 1) {
      const value = asText(list[i], "");
      if (isConfiguredSecret(value)) {
        return value;
      }
    }
    return "";
  }

  function isConfiguredSecret(value) {
    const text = asText(value, "");
    if (!text) {
      return false;
    }
    const upper = text.toUpperCase();
    if (upper.indexOf("YOUR_EMAILJS") !== -1) {
      return false;
    }
    if (/^YOUR[_A-Z0-9-]+$/.test(upper)) {
      return false;
    }
    if (upper === "PUBLIC_KEY_HERE" || upper === "SERVICE_ID_HERE" || upper === "TEMPLATE_ID_HERE") {
      return false;
    }
    return true;
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
    const baseLinks = NAV_ITEMS.map((item) => {
      return (
        '<a href="#' +
        escapeHtml(item.id) +
        '" class="nav-link">' +
        escapeHtml(item.label) +
        "</a>"
      );
    }).join("");

    const accountLink = appState.currentUser
      ? '<a href="?page=' + PROFILE_ROUTE + '" class="nav-link">Profile</a>'
      : '<a href="?page=' + LOGIN_ROUTE + '" class="nav-link">Login</a>';

    return baseLinks + accountLink;
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

  function authNavActionsMarkup() {
    if (appState.currentUser) {
      return (
        '<a href="?page=' +
        PROFILE_ROUTE +
        '" class="btn btn-ghost btn-glitch" data-text="Profile">Profile</a>' +
        '<button type="button" class="btn btn-secondary btn-glitch auth-logout" data-text="Log Out">Log Out</button>'
      );
    }

    return (
      '<a href="?page=' +
      LOGIN_ROUTE +
      '" class="btn btn-ghost btn-glitch" data-text="Login">Login</a>' +
      '<a href="?page=' +
      SIGNUP_ROUTE +
      '" class="btn btn-secondary btn-glitch" data-text="Sign Up">Sign Up</a>'
    );
  }

  function routeAccountActionMarkup() {
    if (appState.currentUser) {
      return '<a href="?page=' + PROFILE_ROUTE + '" class="btn btn-ghost btn-glitch" data-text="Profile">Profile</a>';
    }
    return '<a href="?page=' + LOGIN_ROUTE + '" class="btn btn-ghost btn-glitch" data-text="Login">Login</a>';
  }

  function buildRouteUrl(page, notice) {
    const params = new URLSearchParams();
    if (page) {
      params.set("page", page);
    }
    if (notice) {
      params.set("notice", notice);
    }
    const query = params.toString();
    return query ? "?" + query : "index.htm";
  }

  function navigateToRoute(page, notice) {
    window.location.assign(buildRouteUrl(page, notice));
  }

  function getRouteNotice() {
    try {
      return asText(new URLSearchParams(window.location.search).get("notice"), "");
    } catch (error) {
      return "";
    }
  }

  function formatDateLabel(isoValue) {
    if (!isoValue) {
      return "Not available";
    }
    const parsed = new Date(isoValue);
    if (Number.isNaN(parsed.getTime())) {
      return "Not available";
    }
    return parsed.toLocaleString();
  }

  function renderCurrentView(config) {
    const route = getCurrentRoute();
    appState.currentUser = getAuthenticatedUser();

    if (route === MAYDAY_ROUTE) {
      renderMayday(config);
      return;
    }
    if (route === LOGIN_ROUTE) {
      renderLogin(config, getRouteNotice());
      return;
    }
    if (route === SIGNUP_ROUTE) {
      renderSignup(config);
      return;
    }
    if (route === PROFILE_ROUTE) {
      if (!appState.currentUser) {
        renderLogin(config, "Please log in to view your profile.");
        return;
      }
      renderProfile(config, appState.currentUser);
      return;
    }
    if (route === SETTINGS_ROUTE) {
      if (!appState.currentUser) {
        renderLogin(config, "Please log in to access account settings.");
        return;
      }
      renderAccountSettings(config, appState.currentUser);
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
              ${authNavActionsMarkup()}
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
                <h1 class="hero-title">
                  <span class="hero-title-primary">${escapeHtml(config.name)}</span>
                  <span class="hero-title-secondary">Crafting immersive games players remember</span>
                </h1>
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
                    We combine technical discipline with creative direction to ship games that reward strategy, adaptation, and smart decision-making.
                  </p>
                  <ul class="mission-list">
                    <li>Player-first game systems with meaningful choices.</li>
                    <li>High-quality production standards and consistent polish.</li>
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
                <h2 class="section-title">Send an Inquiry</h2>
                <p class="section-copy">
                  Use the form to send your inquiry directly to ${escapeHtml(config.name)}.
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
                      <p>We usually respond to genuine inquiries within 24 to 48 hours.</p>
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
                  <p class="form-helper">Messages from this form are sent to ${escapeHtml(config.email)}.</p>
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
              ${routeAccountActionMarkup()}
              <a href="index.htm#home" class="btn btn-return-home btn-glitch" data-text="Back to Home">Back to Home</a>
            </div>
          </div>
        </header>

        <main id="main-content">
          <section id="overview" class="game-hero">
            <div class="container game-hero-grid">
              <div class="reveal">
                <p class="section-kicker">Game Overview</p>
                <h1 class="hero-title">${escapeHtml(config.game.title)}</h1>
                <p class="section-copy">${escapeHtml(config.game.description)}</p>
                <div class="hero-actions">
                  <a href="${escapeHtml(config.website)}" target="_blank" rel="noreferrer" class="btn btn-primary btn-glitch" data-text="Official Site">Official Site</a>
                  <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-glitch" data-text="Join Discord">Join Discord</a>
                  <a href="index.htm#home" class="btn btn-return-home btn-glitch" data-text="Back to Home">Back to Home</a>
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
                  <div class="hud-row"><span>Studio Updates</span><strong>Official announcements and launch milestones</strong></div>
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
                <h2 class="section-title">Stay Connected with the Studio</h2>
                <p class="section-copy">
                  Follow official channels for verified announcements, development updates, and community activities without spoilers or detailed gameplay breakdowns.
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

  function authLinksMarkup() {
    const baseLinks =
      '<a href="index.htm#home" class="nav-link">Home</a>' +
      '<a href="?page=' + MAYDAY_ROUTE + '" class="nav-link">Game</a>';
    if (appState.currentUser) {
      return (
        baseLinks +
        '<a href="?page=' +
        PROFILE_ROUTE +
        '" class="nav-link">Profile</a>' +
        '<a href="?page=' +
        SETTINGS_ROUTE +
        '" class="nav-link">Settings</a>'
      );
    }
    return (
      baseLinks +
      '<a href="?page=' +
      LOGIN_ROUTE +
      '" class="nav-link">Login</a>' +
      '<a href="?page=' +
      SIGNUP_ROUTE +
      '" class="nav-link">Sign Up</a>'
    );
  }

  function renderAuthShell(config, options) {
    const theme = getStoredTheme();
    const themeLabel = theme === "dark" ? "Light Mode" : "Dark Mode";
    const kicker = asText(options.kicker, "Account");
    const title = asText(options.title, "Account");
    const copy = asText(options.copy, "");
    const content = asText(options.content, "");
    const notice = asText(options.notice, "");
    const noticeMarkup = notice
      ? '<p class="auth-notice" role="status" aria-live="polite">' + escapeHtml(notice) + "</p>"
      : "";

    root.innerHTML = `
      <div class="auth-page">
        <header class="top-nav">
          <div class="container nav-content">
            <a class="nav-brand" href="index.htm#home">
              <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios logo" loading="eager" decoding="async" width="42" height="42" />
              <span>${escapeHtml(config.name)}</span>
            </a>
            <button type="button" class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button>
            <nav class="nav-links" aria-label="Account navigation">
              ${authLinksMarkup()}
            </nav>
            <div class="nav-actions">
              <button type="button" class="theme-toggle" aria-label="Toggle color theme">${themeLabel}</button>
              ${routeAccountActionMarkup()}
              <a href="index.htm#home" class="btn btn-return-home btn-glitch" data-text="Back to Home">Back to Home</a>
            </div>
          </div>
        </header>

        <main id="main-content" class="auth-main">
          <section class="section auth-section">
            <div class="container">
              <div class="auth-head reveal">
                <p class="section-kicker">${escapeHtml(kicker)}</p>
                <h1 class="section-title">${escapeHtml(title)}</h1>
                <p class="section-copy">${escapeHtml(copy)}</p>
                ${noticeMarkup}
              </div>
              ${content}
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
                <a href="index.htm#home">Home</a>
                <a href="?page=${MAYDAY_ROUTE}">Game Page</a>
                <a href="${escapeHtml(config.discord)}" target="_blank" rel="noreferrer">Discord</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  function renderSignup(config) {
    const content = `
      <div class="auth-layout auth-layout-signup">
        <section class="panel auth-card auth-card-form reveal">
          <h3 class="auth-card-title">Create Your Account</h3>
          <form class="auth-form signup-form" novalidate>
            <div class="auth-field">
              <label for="signup_name">Full Name</label>
              <input id="signup_name" name="full_name" type="text" placeholder="Your full name" required />
            </div>
            <div class="auth-field">
              <label for="signup_email">Email</label>
              <input id="signup_email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="auth-grid-two">
              <div class="auth-field">
                <label for="signup_password">Password</label>
                <input id="signup_password" name="password" type="password" placeholder="At least 8 characters" required />
              </div>
              <div class="auth-field">
                <label for="signup_confirm_password">Confirm Password</label>
                <input id="signup_confirm_password" name="confirm_password" type="password" placeholder="Repeat password" required />
              </div>
            </div>
            <div class="auth-grid-two">
              <div class="auth-field">
                <label for="signup_country">Country</label>
                <input id="signup_country" name="country" type="text" placeholder="Country / Region" required />
              </div>
              <div class="auth-field">
                <label for="signup_age">Age</label>
                <input id="signup_age" name="age" type="number" min="13" max="120" placeholder="13+" required />
              </div>
            </div>

            <div class="terms-box">
              <h4>Terms and Conditions</h4>
              <div class="terms-scroll">
                <p><strong>1. Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
                <p><strong>2. Eligibility:</strong> By creating an account, you confirm that you meet your local legal age requirements and that the information you provide is accurate.</p>
                <p><strong>3. Acceptable Conduct:</strong> Harassment, hate speech, cheating, account abuse, or any attempt to disrupt services is strictly prohibited.</p>
                <p><strong>4. Community Guidelines:</strong> You agree to follow moderation instructions in official community spaces, including Discord and other supported channels.</p>
                <p><strong>5. Privacy:</strong> Your account information is used for authentication, support communication, and service updates. We do not sell personal data.</p>
                <p><strong>6. Security:</strong> You should use a strong password and avoid reusing passwords from other platforms.</p>
                <p><strong>7. Service Updates:</strong> Features, policies, and availability may evolve over time as the project develops.</p>
                <p><strong>8. Termination:</strong> We reserve the right to suspend or remove accounts that violate these terms or compromise community safety.</p>
                <p><strong>9. Contact:</strong> For concerns related to your account, contact ${escapeHtml(config.email)}.</p>
              </div>
              <label class="auth-checkbox">
                <input id="signup_terms" name="accept_terms" type="checkbox" required />
                <span>I have read and agree to the Terms and Conditions above.</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-glitch" data-text="Create Account">Create Account</button>
            <p class="auth-status" role="status" aria-live="polite" hidden></p>
            <p class="auth-helper">Already have an account? <a href="?page=${LOGIN_ROUTE}">Log in here</a>.</p>
          </form>
        </section>

        <aside class="panel auth-card auth-card-side reveal interactive-tilt">
          <h3 class="auth-card-title">Why Sign Up?</h3>
          <ul class="mission-list">
            <li>Get trusted studio updates and release announcements.</li>
            <li>Access account-level support and communication preferences.</li>
            <li>Keep your profile and contact settings in one place.</li>
          </ul>
          <div class="mini-brand">
            <img src="assets/incarnation-studios-logo.png" alt="Incarnation Studios emblem" loading="lazy" decoding="async" />
            <p>Incarnation Studios</p>
          </div>
        </aside>
      </div>
    `;

    renderAuthShell(config, {
      kicker: "Sign Up",
      title: "Create Your Studio Account",
      copy: "Join the official ecosystem to manage your profile, communication preferences, and verified updates.",
      content,
      notice: getRouteNotice() === "account_created" ? "Account created successfully. Please log in." : ""
    });
  }

  function renderLogin(config, notice) {
    const resolvedNotice = asText(notice, "");
    const friendlyNotice =
      resolvedNotice === "logged_out"
        ? "You have been logged out successfully."
        : resolvedNotice === "account_created"
          ? "Account created. Please log in."
          : resolvedNotice;

    const content = `
      <div class="auth-layout auth-layout-login">
        <section class="panel auth-card auth-card-form reveal">
          <h3 class="auth-card-title">Welcome Back</h3>
          <form class="auth-form login-form" novalidate>
            <div class="auth-field">
              <label for="login_email">Email</label>
              <input id="login_email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div class="auth-field">
              <label for="login_password">Password</label>
              <input id="login_password" name="password" type="password" placeholder="Your password" required />
            </div>
            <label class="auth-checkbox">
              <input id="login_remember" name="remember" type="checkbox" checked />
              <span>Keep me signed in on this device.</span>
            </label>

            <button type="submit" class="btn btn-primary btn-glitch" data-text="Log In">Log In</button>
            <p class="auth-status" role="status" aria-live="polite" hidden></p>
            <p class="auth-helper">New here? <a href="?page=${SIGNUP_ROUTE}">Create an account</a>.</p>
          </form>
        </section>

        <aside class="panel auth-card auth-card-side reveal interactive-tilt">
          <h3 class="auth-card-title">Account Access</h3>
          <p class="section-copy">Sign in to manage your profile, update preferences, and maintain verified contact routes with the studio.</p>
          <ul class="mission-list">
            <li>Secure account access for profile management.</li>
            <li>Fast access to account settings and support options.</li>
            <li>Direct links to official channels and announcements.</li>
          </ul>
        </aside>
      </div>
    `;

    renderAuthShell(config, {
      kicker: "Login",
      title: "Access Your Account",
      copy: "Log in with your registered credentials to continue.",
      content,
      notice: friendlyNotice
    });
  }

  function renderProfile(config, user) {
    const noticeToken = getRouteNotice();
    const notice =
      noticeToken === "welcome"
        ? "Welcome. Your account is active and ready."
        : noticeToken === "profile_updated"
          ? "Your profile has been updated."
          : "";
    const content = `
      <div class="auth-layout auth-layout-profile">
        <section class="panel auth-card profile-card reveal">
          <div class="profile-header">
            <div class="profile-avatar">${escapeHtml(getUserInitials(user.name))}</div>
            <div>
              <h3 class="auth-card-title">${escapeHtml(user.name)}</h3>
              <p class="section-copy">${escapeHtml(user.email)}</p>
            </div>
          </div>
          <div class="profile-grid">
            <article class="profile-item">
              <span>Account ID</span>
              <strong>${escapeHtml(user.id)}</strong>
            </article>
            <article class="profile-item">
              <span>Country</span>
              <strong>${escapeHtml(asText(user.country, "Not set"))}</strong>
            </article>
            <article class="profile-item">
              <span>Created</span>
              <strong>${escapeHtml(formatDateLabel(user.createdAt))}</strong>
            </article>
            <article class="profile-item">
              <span>Last Login</span>
              <strong>${escapeHtml(formatDateLabel(user.lastLoginAt))}</strong>
            </article>
          </div>
          <div class="hero-actions">
            <a href="?page=${SETTINGS_ROUTE}" class="btn btn-secondary btn-glitch" data-text="Account Settings">Account Settings</a>
            <button type="button" class="btn btn-return-home btn-glitch auth-logout" data-text="Log Out">Log Out</button>
          </div>
        </section>

        <aside class="panel auth-card auth-card-side reveal interactive-tilt">
          <h3 class="auth-card-title">Profile Controls</h3>
          <ul class="mission-list">
            <li>Update account details and preferences in Settings.</li>
            <li>Use secure logout whenever you are on a shared device.</li>
            <li>Keep your profile information accurate for support requests.</li>
          </ul>
          <div class="hero-actions">
            <a href="?page=${SETTINGS_ROUTE}" class="btn btn-ghost btn-glitch" data-text="Open Settings">Open Settings</a>
            <a href="?page=${MAYDAY_ROUTE}" class="btn btn-primary btn-glitch" data-text="View Game Page">View Game Page</a>
          </div>
        </aside>
      </div>
    `;

    renderAuthShell(config, {
      kicker: "Profile",
      title: "Your Account Profile",
      copy: "Manage identity, account details, and secure access controls from one place.",
      content,
      notice
    });
  }

  function renderAccountSettings(config, user) {
    const notice = getRouteNotice() === "saved" ? "Settings saved successfully." : "";
    const preferences = user.preferences && typeof user.preferences === "object" ? user.preferences : {};
    const content = `
      <div class="auth-layout auth-layout-settings">
        <section class="panel auth-card auth-card-form reveal">
          <h3 class="auth-card-title">Account Settings</h3>
          <form class="auth-form settings-form" novalidate>
            <div class="auth-grid-two">
              <div class="auth-field">
                <label for="settings_name">Display Name</label>
                <input id="settings_name" name="display_name" type="text" value="${escapeHtml(user.name)}" required />
              </div>
              <div class="auth-field">
                <label for="settings_email">Email</label>
                <input id="settings_email" name="email" type="email" value="${escapeHtml(user.email)}" required />
              </div>
            </div>
            <div class="auth-field">
              <label for="settings_country">Country</label>
              <input id="settings_country" name="country" type="text" value="${escapeHtml(asText(user.country, ""))}" placeholder="Country / Region" required />
            </div>

            <div class="settings-preferences">
              <h4>Communication Preferences</h4>
              <label class="auth-checkbox">
                <input name="pref_updates" type="checkbox" ${preferences.pref_updates !== false ? "checked" : ""} />
                <span>Receive important studio updates by email.</span>
              </label>
              <label class="auth-checkbox">
                <input name="pref_events" type="checkbox" ${preferences.pref_events ? "checked" : ""} />
                <span>Receive community events and announcements.</span>
              </label>
            </div>

            <div class="settings-password">
              <h4>Change Password</h4>
              <div class="auth-grid-two">
                <div class="auth-field">
                  <label for="settings_current_password">Current Password</label>
                  <input id="settings_current_password" name="current_password" type="password" placeholder="Current password" />
                </div>
                <div class="auth-field">
                  <label for="settings_new_password">New Password</label>
                  <input id="settings_new_password" name="new_password" type="password" placeholder="New password" />
                </div>
              </div>
              <div class="auth-field">
                <label for="settings_confirm_password">Confirm New Password</label>
                <input id="settings_confirm_password" name="confirm_password" type="password" placeholder="Confirm new password" />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-glitch" data-text="Save Changes">Save Changes</button>
            <p class="auth-status" role="status" aria-live="polite" hidden></p>
          </form>
        </section>

        <aside class="panel auth-card auth-card-side reveal interactive-tilt">
          <h3 class="auth-card-title">Security and Session</h3>
          <ul class="mission-list">
            <li>Use a strong password with upper/lowercase letters and numbers.</li>
            <li>Update your email if you change your primary contact address.</li>
            <li>Log out after updates on shared or public systems.</li>
          </ul>
          <div class="hero-actions">
            <a href="?page=${PROFILE_ROUTE}" class="btn btn-ghost btn-glitch" data-text="Back to Profile">Back to Profile</a>
            <button type="button" class="btn btn-return-home btn-glitch auth-logout" data-text="Log Out">Log Out</button>
          </div>
        </aside>
      </div>
    `;

    renderAuthShell(config, {
      kicker: "Settings",
      title: "Manage Account Settings",
      copy: "Update profile details, communication preferences, and password security.",
      content,
      notice
    });
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
    bindAuthFlows();
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
      const hasValidConfig = isConfiguredSecret(publicKey) && isConfiguredSecret(serviceId) && isConfiguredSecret(templateId);

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
        if (!window.emailjs || typeof window.emailjs.send !== "function" || !hasValidConfig) {
          const openedDraft = openMailtoDraft({
            toEmail: recipient,
            fromName: name,
            fromEmail: email,
            message
          });
          if (status) {
            status.dataset.status = openedDraft ? "success" : "error";
            status.textContent = openedDraft
              ? "Your email app opened with a draft. Please send it to " + recipient + "."
              : "Unable to send right now. Please email us directly at " + recipient + ".";
          }
          return;
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
        const openedDraft = openMailtoDraft({
          toEmail: recipient,
          fromName: name,
          fromEmail: email,
          message
        });
        if (status) {
          status.dataset.status = openedDraft ? "success" : "error";
          status.textContent = openedDraft
            ? "We opened your email app with a draft message to " + recipient + "."
            : "Unable to send right now. Please try again shortly or email us at " + recipient + ".";
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

  function openMailtoDraft(payload) {
    const toEmail = asText(payload && payload.toEmail, OFFICIAL_EMAIL);
    const fromName = asText(payload && payload.fromName, "Website Visitor");
    const fromEmail = asText(payload && payload.fromEmail, "No email provided");
    const bodyMessage = asText(payload && payload.message, "No message provided.");
    const subject = "Website Inquiry - " + fromName;
    const body =
      "Name: " +
      fromName +
      "\nEmail: " +
      fromEmail +
      "\n\nMessage:\n" +
      bodyMessage;
    const mailtoUrl =
      "mailto:" + encodeURIComponent(toEmail) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    try {
      window.location.href = mailtoUrl;
      return true;
    } catch (error) {
      return false;
    }
  }

  function setAuthStatus(node, type, message) {
    if (!node) {
      return;
    }
    node.hidden = false;
    node.dataset.status = type;
    node.textContent = message;
  }

  function isStrongPassword(password) {
    const value = asText(password, "");
    return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
  }

  function bindAuthFlows() {
    bindLogoutButtons();
    bindSignupForm();
    bindLoginForm();
    bindSettingsForm();
  }

  function bindLogoutButtons() {
    const buttons = Array.from(root.querySelectorAll(".auth-logout"));
    if (!buttons.length) {
      return;
    }

    buttons.forEach((button) => {
      const onClick = () => {
        logoutCurrentUser();
        navigateToRoute(LOGIN_ROUTE, "logged_out");
      };
      button.addEventListener("click", onClick);
      addCleanup(() => button.removeEventListener("click", onClick));
    });
  }

  function bindSignupForm() {
    const form = root.querySelector(".signup-form");
    if (!form) {
      return;
    }

    const status = form.querySelector(".auth-status");
    const submitButton = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

    const onSubmit = (event) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      const data = new FormData(form);
      const fullName = asText(data.get("full_name"), "");
      const email = asText(data.get("email"), "").toLowerCase();
      const password = asText(data.get("password"), "");
      const confirmPassword = asText(data.get("confirm_password"), "");
      const country = asText(data.get("country"), "");
      const age = Number(data.get("age"));
      const acceptedTerms = data.get("accept_terms") === "on";

      if (fullName.length < 2) {
        setAuthStatus(status, "error", "Please enter your full name.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthStatus(status, "error", "Please enter a valid email address.");
        return;
      }
      if (!isStrongPassword(password)) {
        setAuthStatus(status, "error", "Password must be at least 8 characters and include uppercase, lowercase, and a number.");
        return;
      }
      if (password !== confirmPassword) {
        setAuthStatus(status, "error", "Password confirmation does not match.");
        return;
      }
      if (!country) {
        setAuthStatus(status, "error", "Please provide your country or region.");
        return;
      }
      if (!Number.isFinite(age) || age < 13) {
        setAuthStatus(status, "error", "You must be at least 13 years old to create an account.");
        return;
      }
      if (!acceptedTerms) {
        setAuthStatus(status, "error", "You must accept the Terms and Conditions to continue.");
        return;
      }

      const users = getAuthUsers();
      const duplicate = users.some((user) => user && asText(user.email, "").toLowerCase() === email);
      if (duplicate) {
        setAuthStatus(status, "error", "An account with this email already exists. Please log in instead.");
        return;
      }

      const nowIso = new Date().toISOString();
      const newUser = {
        id: createUserId(),
        name: fullName,
        email,
        password,
        country,
        age: String(age),
        createdAt: nowIso,
        lastLoginAt: nowIso,
        preferences: {
          pref_updates: true,
          pref_events: false
        }
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      isSubmitting = true;
      setAuthUsers(users.concat([newUser]));
      setAuthSession({ userId: newUser.id, createdAt: nowIso });
      appState.currentUser = newUser;
      navigateToRoute(PROFILE_ROUTE, "welcome");
    };

    form.addEventListener("submit", onSubmit);
    addCleanup(() => form.removeEventListener("submit", onSubmit));
  }

  function bindLoginForm() {
    const form = root.querySelector(".login-form");
    if (!form) {
      return;
    }

    const status = form.querySelector(".auth-status");
    const submitButton = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

    const onSubmit = (event) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      const data = new FormData(form);
      const email = asText(data.get("email"), "").toLowerCase();
      const password = asText(data.get("password"), "");
      const remember = data.get("remember") === "on";

      if (!email || !password) {
        setAuthStatus(status, "error", "Please provide both email and password.");
        return;
      }

      const users = getAuthUsers();
      const user = users.find(
        (item) =>
          item &&
          asText(item.email, "").toLowerCase() === email &&
          asText(item.password, "") === password
      );

      if (!user) {
        setAuthStatus(status, "error", "Incorrect email or password.");
        return;
      }

      const updatedUser = {
        ...user,
        lastLoginAt: new Date().toISOString()
      };
      persistUser(updatedUser);
      setAuthSession({
        userId: updatedUser.id,
        createdAt: updatedUser.lastLoginAt
      }, remember);
      appState.currentUser = updatedUser;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      isSubmitting = true;
      navigateToRoute(PROFILE_ROUTE);
    };

    form.addEventListener("submit", onSubmit);
    addCleanup(() => form.removeEventListener("submit", onSubmit));
  }

  function bindSettingsForm() {
    const form = root.querySelector(".settings-form");
    if (!form) {
      return;
    }
    if (!appState.currentUser) {
      return;
    }

    const status = form.querySelector(".auth-status");
    const submitButton = form.querySelector('button[type="submit"]');

    const onSubmit = (event) => {
      event.preventDefault();
      const data = new FormData(form);

      const displayName = asText(data.get("display_name"), "");
      const email = asText(data.get("email"), "").toLowerCase();
      const country = asText(data.get("country"), "");
      const currentPassword = asText(data.get("current_password"), "");
      const newPassword = asText(data.get("new_password"), "");
      const confirmPassword = asText(data.get("confirm_password"), "");
      const wantsPasswordChange = currentPassword || newPassword || confirmPassword;

      if (displayName.length < 2) {
        setAuthStatus(status, "error", "Display name must contain at least 2 characters.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthStatus(status, "error", "Please enter a valid email address.");
        return;
      }
      if (!country) {
        setAuthStatus(status, "error", "Please provide your country or region.");
        return;
      }

      const users = getAuthUsers();
      const duplicate = users.some(
        (user) =>
          user &&
          user.id !== appState.currentUser.id &&
          asText(user.email, "").toLowerCase() === email
      );
      if (duplicate) {
        setAuthStatus(status, "error", "Another account already uses this email address.");
        return;
      }

      if (wantsPasswordChange) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setAuthStatus(status, "error", "Fill all password fields to change your password.");
          return;
        }
        if (currentPassword !== asText(appState.currentUser.password, "")) {
          setAuthStatus(status, "error", "Current password is incorrect.");
          return;
        }
        if (!isStrongPassword(newPassword)) {
          setAuthStatus(status, "error", "New password must be at least 8 characters and include uppercase, lowercase, and a number.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setAuthStatus(status, "error", "New password confirmation does not match.");
          return;
        }
      }

      const updatedUser = {
        ...appState.currentUser,
        name: displayName,
        email,
        country,
        password: wantsPasswordChange ? newPassword : appState.currentUser.password,
        preferences: {
          pref_updates: data.get("pref_updates") === "on",
          pref_events: data.get("pref_events") === "on"
        }
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      persistUser(updatedUser);
      appState.currentUser = updatedUser;
      setAuthStatus(status, "success", "Settings saved successfully.");

      if (submitButton) {
        window.setTimeout(() => {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }, 350);
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
