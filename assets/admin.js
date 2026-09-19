/* ============================================================
   CROWRULES ENTERTAINMENT
   ADMIN COMMAND CENTER
   Supabase-connected administration
============================================================ */

"use strict";


/* ============================================================
   SUPABASE CONFIGURATION
============================================================ */

const SUPABASE_URL =
  "https://cevylpnoexugwgygvtgu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";


/* ============================================================
   SUPABASE CLIENT
============================================================ */

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    },

    global: {
      headers: {
        "x-crowrules-client":
          "crowrules-admin"
      }
    }
  }
);


/* ============================================================
   STATE
============================================================ */

const state = {

  user: null,

  session: null,

  bootstrap: null,

  currentPage: "dashboard",

  navigation: [],

  settings: {},

  roles: [],

  initialized: false

};


/* ============================================================
   DEFAULT NAVIGATION
============================================================ */

const DEFAULT_NAVIGATION = [

  {
    section: "Command Center",
    label: "Dashboard",
    href: "dashboard",
    icon: "⌂"
  },

  {
    section: "Command Center",
    label: "Notifications",
    href: "notifications",
    icon: "♢"
  },

  {
    section: "Command Center",
    label: "Activity",
    href: "activity",
    icon: "◌"
  },

  {
    section: "Content",
    label: "Content",
    href: "content",
    icon: "▣"
  },

  {
    section: "Content",
    label: "Episodes",
    href: "episodes",
    icon: "▶"
  },

  {
    section: "Content",
    label: "Shows",
    href: "shows",
    icon: "▤"
  },

  {
    section: "Content",
    label: "Media",
    href: "media",
    icon: "▧"
  },

  {
    section: "Content",
    label: "YouTube",
    href: "youtube",
    icon: "▷"
  },

  {
    section: "Live",
    label: "Live Events",
    href: "live-events",
    icon: "●"
  },

  {
    section: "People",
    label: "Members",
    href: "members",
    icon: "♙"
  },

  {
    section: "People",
    label: "Creators",
    href: "creators",
    icon: "✦"
  },

  {
    section: "People",
    label: "Staff",
    href: "staff",
    icon: "♟"
  },

  {
    section: "Dreamscapes",
    label: "Dreams",
    href: "dreams",
    icon: "✧"
  },

  {
    section: "Dreamscapes",
    label: "Agreements",
    href: "agreements",
    icon: "▱"
  },

  {
    section: "Dreamscapes",
    label: "Rights",
    href: "rights",
    icon: "◇"
  },

  {
    section: "Television",
    label: "CrowRules TV",
    href: "tv",
    icon: "▣"
  },

  {
    section: "Television",
    label: "TV Schedule",
    href: "tv-schedule",
    icon: "◷"
  },

  {
    section: "Projects",
    label: "Yearbooks",
    href: "yearbooks",
    icon: "▤"
  },

  {
    section: "Projects",
    label: "Records",
    href: "records",
    icon: "◉"
  },

  {
    section: "Projects",
    label: "Studios",
    href: "studios",
    icon: "▥"
  },

  {
    section: "Projects",
    label: "CrowSpace",
    href: "crowspace",
    icon: "◎"
  },

  {
    section: "Business",
    label: "Business",
    href: "business",
    icon: "◆"
  },

  {
    section: "Business",
    label: "Analytics",
    href: "analytics",
    icon: "⌁"
  },

  {
    section: "System",
    label: "Settings",
    href: "settings",
    icon: "⚙"
  }

];


/* ============================================================
   DOM HELPERS
============================================================ */

const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  [...document.querySelectorAll(selector)];


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  initialize
);


async function initialize() {

  $("#current-year").textContent =
    new Date().getFullYear();

  setupEvents();

  setConnectionStatus(
    "Checking authentication..."
  );

  const {
    data,
    error
  } = await db.auth.getSession();

  if (error) {

    showAuthError(
      error.message
    );

    return;
  }

  if (data.session) {

    await handleAuthenticatedSession(
      data.session
    );

  } else {

    showAuthScreen();

  }


  db.auth.onAuthStateChange(
    async (event, session) => {

      if (
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED"
      ) {

        if (session) {

          await handleAuthenticatedSession(
            session
          );

        }

      }


      if (event === "SIGNED_OUT") {

        resetApplication();

      }

    }
  );

}


/* ============================================================
   EVENTS
============================================================ */

function setupEvents() {

  $("#google-login")
    ?.addEventListener(
      "click",
      signInWithGoogle
    );


  $("#denied-signout")
    ?.addEventListener(
      "click",
      signOut
    );


  $("#sidebar-signout")
    ?.addEventListener(
      "click",
      signOut
    );


  $("#refresh-button")
    ?.addEventListener(
      "click",
      refreshCurrentPage
    );


  $("#notification-button")
    ?.addEventListener(
      "click",
      () => navigate("notifications")
    );


  $("#mobile-menu")
    ?.addEventListener(
      "click",
      openSidebar
    );


  $("#mobile-close")
    ?.addEventListener(
      "click",
      closeSidebar
    );


  $("#sidebar-overlay")
    ?.addEventListener(
      "click",
      closeSidebar
    );

}


/* ============================================================
   GOOGLE LOGIN
============================================================ */

async function signInWithGoogle() {

  const button =
    $("#google-login");

  if (button) {

    button.disabled = true;

    button.innerHTML =
      "Connecting...";

  }


  const redirectTo =
    window.location.href.split("#")[0];


  const {
    error
  } = await db.auth.signInWithOAuth({

    provider: "google",

    options: {
      redirectTo
    }

  });


  if (error) {

    showAuthError(
      error.message
    );

    if (button) {

      button.disabled = false;

      button.innerHTML =
        '<span class="google-icon">G</span> Continue with Google';

    }

  }

}


/* ============================================================
   SESSION
============================================================ */

async function handleAuthenticatedSession(
  session
) {

  state.session = session;

  state.user =
    session.user;

  updateUserInterface();

  showLoading(
    "Verifying CrowRules admin access..."
  );


  const result =
    await loadBootstrap();


  hideLoading();


  if (!result.ok) {

    showAuthError(
      result.error
    );

    return;
  }


  if (
    !result.data ||
    result.data.is_admin !== true
  ) {

    showDeniedScreen();

    return;
  }


  state.initialized = true;

  showAdminApplication();

  renderNavigation();

  await navigate(
    state.currentPage
  );

}


/* ============================================================
   BOOTSTRAP
============================================================ */

async function loadBootstrap() {

  const {
    data,
    error
  } = await db.rpc(
    "crowrules_admin_bootstrap"
  );


  if (error) {

    console.error(
      "Bootstrap error:",
      error
    );

    return {
      ok: false,
      error: error.message
    };

  }


  state.bootstrap =
    data || {};

  state.navigation =
    normalizeNavigation(
      data?.navigation
    );

  state.settings =
    data?.settings || {};

  state.roles =
    data?.roles || [];


  setConnectionStatus(
    "Supabase Connected"
  );


  return {
    ok: true,
    data
  };

}


/* ============================================================
   NAVIGATION
============================================================ */

function normalizeNavigation(
  navigation
) {

  if (
    Array.isArray(navigation) &&
    navigation.length
  ) {

    return navigation
      .filter(item =>
        item.is_active !== false
      )
      .map(item => ({

        section:
          item.section || "Administration",

        label:
          item.label || "Untitled",

        href:
          item.href || "#",

        icon:
          item.icon || "•",

        badge:
          item.badge || null

      }));

  }


  return DEFAULT_NAVIGATION;

}


function renderNavigation() {

  const container =
    $("#admin-navigation");

  if (!container) return;

  container.innerHTML = "";

  let currentSection = "";


  state.navigation.forEach(
    item => {

      if (
        item.section !== currentSection
      ) {

        currentSection =
          item.section;

        const section =
          document.createElement("div");

        section.className =
          "nav-section";

        section.textContent =
          currentSection;

        container.appendChild(
          section
        );

      }


      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "nav-item";

      button.dataset.page =
        normalizePage(
          item.href
        );


      button.innerHTML = `

        <span class="nav-icon">
          ${escapeHtml(item.icon)}
        </span>

        <span class="nav-label">
          ${escapeHtml(item.label)}
        </span>

        ${
          item.badge
            ? `<span class="nav-badge">
                 ${escapeHtml(item.badge)}
               </span>`
            : ""
        }

      `;


      button.addEventListener(
        "click",
        () => {

          navigate(
            button.dataset.page
          );

          closeSidebar();

        }
      );


      container.appendChild(
        button
      );

    }
  );

}


/* ============================================================
   ROUTING
============================================================ */

async function navigate(page) {

  state.currentPage =
    normalizePage(page);


  $$(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page ===
          state.currentPage
      );

    });


  const titles = {

    dashboard:
      "Command Center",

    notifications:
      "Notifications",

    activity:
      "Activity",

    content:
      "Content",

    episodes:
      "Episodes",

    shows:
      "Shows",

    media:
      "Media",

    youtube:
      "YouTube",

    "live-events":
      "Live Events",

    members:
      "Members",

    creators:
      "Creators",

    staff:
      "Staff",

    dreams:
      "Dreams",

    agreements:
      "Agreements",

    rights:
      "Rights",

    tv:
      "CrowRules TV",

    "tv-schedule":
      "TV Schedule",

    yearbooks:
      "Yearbooks",

    records:
      "Records",

    studios:
      "Studios",

    crowspace:
      "CrowSpace",

    business:
      "Business",

    analytics:
      "Analytics",

    settings:
      "Settings"

  };


  const title =
    titles[state.currentPage] ||
    "Command Center";


  $("#page-title")
    .textContent =
      title;


  $("#page-breadcrumb")
    .textContent =
      `CrowRules / ${title}`;


  const content =
    $("#page-content");


  content.innerHTML =
    loadingTemplate();


  switch (
    state.currentPage
  ) {

    case "dashboard":

      await renderDashboard();

      break;


    case "notifications":

      await renderNotifications();

      break;


    case "activity":

      await renderActivity();

      break;


    case "settings":

      renderSettings();

      break;


    default:

      renderModulePage(
        state.currentPage,
        title
      );

      break;

  }

}


/* ============================================================
   DASHBOARD
============================================================ */

async function renderDashboard() {

  const content =
    $("#page-content");


  let activity = [];

  let notifications = [];


  /*
   * The dashboard first attempts the protected
   * admin RPCs. If those RPCs have not yet been
   * created, the page still renders safely.
   */

  try {

    const activityResult =
      await db.rpc(
        "crowrules_admin_activity",
        {
          p_limit: 8
        }
      );


    if (
      !activityResult.error &&
      Array.isArray(
        activityResult.data
      )
    ) {

      activity =
        activityResult.data;

    }

  } catch (error) {

    console.warn(
      "Activity RPC unavailable:",
      error
    );

  }


  try {

    const notificationResult =
      await db.rpc(
        "crowrules_admin_notifications",
        {
          p_limit: 8
        }
      );


    if (
      !notificationResult.error &&
      Array.isArray(
        notificationResult.data
      )
    ) {

      notifications =
        notificationResult.data;

    }

  } catch (error) {

    console.warn(
      "Notification RPC unavailable:",
      error
    );

  }


  content.innerHTML = `

    <div class="page-header">

      <div>

        <h2>
          Command Center
        </h2>

        <p>
          Welcome back to the CrowRules Entertainment
          administrative control center.
        </p>

      </div>

      <button
        class="btn btn-secondary"
        id="dashboard-refresh"
      >
        Refresh Dashboard
      </button>

    </div>


    <div class="stats-grid">

      <div class="stat-card">
        <div class="stat-label">
          Admin Status
        </div>

        <div class="stat-value">
          ACTIVE
        </div>

        <div class="stat-meta">
          CrowRules administrator
        </div>
      </div>


      <div class="stat-card">
        <div class="stat-label">
          Navigation Modules
        </div>

        <div class="stat-value">
          ${state.navigation.length}
        </div>

        <div class="stat-meta">
          Active command center modules
        </div>
      </div>


      <div class="stat-card">
        <div class="stat-label">
          Notifications
        </div>

        <div class="stat-value">
          ${notifications.length}
        </div>

        <div class="stat-meta">
          Latest administrator notifications
        </div>
      </div>


      <div class="stat-card">
        <div class="stat-label">
          Activity
        </div>

        <div class="stat-value">
          ${activity.length}
        </div>

        <div class="stat-meta">
          Recent administrative events
        </div>
      </div>

    </div>


    <div class="dashboard-grid">

      <section class="panel">

        <div class="panel-header">

          <div class="panel-title">
            Recent Activity
          </div>

          <button
            class="btn btn-secondary"
            id="view-activity"
          >
            View All
          </button>

        </div>

        <div class="panel-body">

          ${
            activity.length
              ? activity
                  .map(renderActivityItem)
                  .join("")
              : emptyTemplate(
                  "No recent activity available."
                )
          }

        </div>

      </section>


      <section class="panel">

        <div class="panel-header">

          <div class="panel-title">
            Notifications
          </div>

          <button
            class="btn btn-secondary"
            id="view-notifications"
          >
            View All
          </button>

        </div>

        <div class="panel-body">

          ${
            notifications.length
              ? notifications
                  .map(
                    renderNotificationItem
                  )
                  .join("")
              : emptyTemplate(
                  "No notifications available."
                )
          }

        </div>

      </section>

    </div>


    <section
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-header">

        <div class="panel-title">
          CrowRules Modules
        </div>

      </div>

      <div class="panel-body">

        <div class="module-grid">

          ${state.navigation
            .filter(
              item =>
                item.href !== "dashboard"
            )
            .slice(0, 12)
            .map(
              item => `

                <button
                  class="module-card"
                  data-module="${escapeHtml(
                    normalizePage(
                      item.href
                    )
                  )}"
                  style="
                    text-align:left;
                    color:inherit;
                    cursor:pointer;
                  "
                >

                  <div class="module-icon">
                    ${escapeHtml(
                      item.icon
                    )}
                  </div>

                  <h3>
                    ${escapeHtml(
                      item.label
                    )}
                  </h3>

                  <p>
                    Open ${escapeHtml(
                      item.label
                    )} administration.
                  </p>

                </button>

              `
            )
            .join("")}

        </div>

      </div>

    </section>

  `;


  $("#dashboard-refresh")
    ?.addEventListener(
      "click",
      refreshCurrentPage
    );


  $("#view-activity")
    ?.addEventListener(
      "click",
      () => navigate("activity")
    );


  $("#view-notifications")
    ?.addEventListener(
      "click",
      () => navigate("notifications")
    );


  $$(".module-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () =>
          navigate(
            card.dataset.module
          )
      );

    });

}


/* ============================================================
   ACTIVITY
============================================================ */

async function renderActivity() {

  const content =
    $("#page-content");


  let activity = [];


  try {

    const {
      data,
      error
    } = await db.rpc(
      "crowrules_admin_activity",
      {
        p_limit: 100
      }
    );


    if (error) {

      throw error;

    }


    activity =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      error
    );

  }


  content.innerHTML = `

    <div class="page-header">

      <div>

        <h2>
          Administrative Activity
        </h2>

        <p>
          Audit trail for CrowRules administrative actions.
        </p>

      </div>

    </div>


    <section class="panel">

      <div class="panel-body">

        ${
          activity.length
            ? `

              <table class="data-table">

                <thead>

                  <tr>

                    <th>Event</th>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Source</th>
                    <th>Created</th>

                  </tr>

                </thead>

                <tbody>

                  ${activity
                    .map(
                      item => `

                        <tr>

                          <td>
                            ${escapeHtml(
                              item.event_type ||
                              "event"
                            )}
                          </td>

                          <td>
                            ${escapeHtml(
                              item.title ||
                              "Untitled"
                            )}
                          </td>

                          <td>
                            ${escapeHtml(
                              item.severity ||
                              "info"
                            )}
                          </td>

                          <td>
                            ${escapeHtml(
                              item.source ||
                              "admin"
                            )}
                          </td>

                          <td>
                            ${formatDate(
                              item.created_at
                            )}
                          </td>

                        </tr>

                      `
                    )
                    .join("")}

                </tbody>

              </table>

            `
            : emptyTemplate(
                "No administrative activity found."
              )
        }

      </div>

    </section>

  `;

}


/* ============================================================
   NOTIFICATIONS
============================================================ */

async function renderNotifications() {

  const content =
    $("#page-content");


  let notifications = [];


  try {

    const {
      data,
      error
    } = await db.rpc(
      "crowrules_admin_notifications",
      {
        p_limit: 100
      }
    );


    if (error) {

      throw error;

    }


    notifications =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      error
    );

  }


  content.innerHTML = `

    <div class="page-header">

      <div>

        <h2>
          Notifications
        </h2>

        <p>
          CrowRules administrator notifications and alerts.
        </p>

      </div>

    </div>


    <section class="panel">

      <div class="panel-body">

        ${
          notifications.length
            ? notifications
                .map(
                  renderNotificationItem
                )
                .join("")
            : emptyTemplate(
                "No notifications found."
              )
        }

      </div>

    </section>

  `;

}


/* ============================================================
   SETTINGS
============================================================ */

function renderSettings() {

  const content =
    $("#page-content");


  const settingEntries =
    Object.entries(
      state.settings || {}
    );


  content.innerHTML = `

    <div class="page-header">

      <div>

        <h2>
          System Settings
        </h2>

        <p>
          CrowRules administrator configuration.
        </p>

      </div>

    </div>


    <section class="panel">

      <div class="panel-header">

        <div class="panel-title">
          Supabase Connection
        </div>

      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group">

            <label>
              Project
            </label>

            <input
              class="form-control"
              value="cevylpnoexugwgygvtgu"
              readonly
            >

          </div>


          <div class="form-group">

            <label>
              Connection
            </label>

            <input
              class="form-control"
              value="Connected"
              readonly
            >

          </div>

        </div>

      </div>

    </section>


    <section
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-header">

        <div class="panel-title">
          Database Settings
        </div>

      </div>

      <div class="panel-body">

        ${
          settingEntries.length
            ? `

              <table class="data-table">

                <thead>

                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>

                </thead>

                <tbody>

                  ${settingEntries
                    .map(
                      ([key, value]) => `

                        <tr>

                          <td>
                            ${escapeHtml(
                              key
                            )}
                          </td>

                          <td>
                            ${escapeHtml(
                              formatValue(
                                value
                              )
                            )}
                          </td>

                        </tr>

                      `
                    )
                    .join("")}

                </tbody>

              </table>

            `
            : emptyTemplate(
                "No system settings returned by the admin bootstrap."
              )
        }

      </div>

    </section>

  `;

}


/* ============================================================
   MODULE PAGES
============================================================ */

function renderModulePage(
  page,
  title
) {

  const content =
    $("#page-content");


  const descriptions = {

    content:
      "Manage CrowRules content and publishing workflows.",

    episodes:
      "Manage episodes across CrowRules productions.",

    shows:
      "Manage CrowRules shows and production properties.",

    media:
      "Manage images, video, audio and other media assets.",

    youtube:
      "Manage CrowRules YouTube content and publishing.",

    "live-events":
      "Manage live broadcasts and scheduled events.",

    members:
      "Manage CrowRules members and community accounts.",

    creators:
      "Manage creators and creator profiles.",

    staff:
      "Manage staff and internal administration.",

    dreams:
      "Manage CrowRules Dreamscapes submissions and projects.",

    agreements:
      "Manage creator agreements and production documents.",

    rights:
      "Manage project rights, ownership and permissions.",

    tv:
      "Manage CrowRules TV channels and programming.",

    "tv-schedule":
      "Manage the CrowRules TV broadcast schedule.",

    yearbooks:
      "Manage CrowRules Yearbooks.",

    records:
      "Manage CrowRules Records.",

    studios:
      "Manage CrowRules Studios.",

    crowspace:
      "Manage CrowSpace.",

    business:
      "Manage business operations and partnerships.",

    analytics:
      "CrowRules performance and operational analytics."

  };


  const description =
    descriptions[page] ||
    "CrowRules Entertainment administration module.";


  content.innerHTML = `

    <div class="page-header">

      <div>

        <h2>
          ${escapeHtml(title)}
        </h2>

        <p>
          ${escapeHtml(description)}
        </p>

      </div>

    </div>


    <section class="panel">

      <div class="panel-header">

        <div class="panel-title">
          ${escapeHtml(title)} Control Center
        </div>

      </div>

      <div class="panel-body">

        <div class="empty-state">

          <div
            style="
              font-size:32px;
              margin-bottom:15px;
            "
          >
            ◈
          </div>

          <strong
            style="
              display:block;
              color:var(--text);
              margin-bottom:8px;
            "
          >
            ${escapeHtml(title)}
          </strong>

          <div>
            This module is connected to the
            CrowRules Admin Command Center.
          </div>

          <div
            style="
              margin-top:10px;
              color:var(--dim);
            "
          >
            Database-specific CRUD screens can be
            added here without changing the authentication
            or administration framework.
          </div>

        </div>

      </div>

    </section>

  `;

}


/* ============================================================
   ACTIVITY TEMPLATE
============================================================ */

function renderActivityItem(
  item
) {

  return `

    <div class="activity-item">

      <div class="activity-icon">
        ◌
      </div>

      <div>

        <div class="activity-title">
          ${escapeHtml(
            item.title ||
            item.event_type ||
            "Administrative Event"
          )}
        </div>

        <div class="activity-description">
          ${escapeHtml(
            item.description ||
            "CrowRules administrative activity."
          )}
        </div>

        <div class="activity-time">
          ${formatDate(
            item.created_at
          )}
        </div>

      </div>

    </div>

  `;

}


/* ============================================================
   NOTIFICATION TEMPLATE
============================================================ */

function renderNotificationItem(
  item
) {

  const unread =
    item.is_read === false;


  return `

    <div
      class="
        notification-item
        ${unread ? "notification-unread" : ""}
      "
    >

      <div class="notification-title">

        ${escapeHtml(
          item.title ||
          "CrowRules Notification"
        )}

      </div>

      <div class="notification-message">

        ${escapeHtml(
          item.message ||
          "No additional message."
        )}

      </div>

    </div>

  `;

}


/* ============================================================
   LOADING / EMPTY
============================================================ */

function loadingTemplate() {

  return `

    <div class="loading-state">

      <div class="spinner"></div>

      Loading...

    </div>

  `;

}


function emptyTemplate(
  message
) {

  return `

    <div class="empty-state">

      ${escapeHtml(message)}

    </div>

  `;

}


/* ============================================================
   USER UI
============================================================ */

function updateUserInterface() {

  const user =
    state.user;

  if (!user) return;


  const metadata =
    user.user_metadata || {};


  const name =
    metadata.full_name ||
    metadata.name ||
    user.email ||
    "CrowRules Admin";


  const avatar =
    metadata.avatar_url ||
    metadata.picture ||
    "";


  $("#user-name").textContent =
    name;


  $("#user-email").textContent =
    user.email || "";


  $("#user-avatar").textContent =
    name
      .charAt(0)
      .toUpperCase();


  if (avatar) {

    $("#user-avatar").style.backgroundImage =
      `url("${avatar}")`;

    $("#user-avatar").style.backgroundSize =
      "cover";

    $("#user-avatar").textContent =
      "";

  }


  $("#denied-user-name")
    .textContent =
      name;


  $("#denied-user-email")
    .textContent =
      user.email || "";

}


/* ============================================================
   AUTH SCREENS
============================================================ */

function showAuthScreen() {

  $("#auth-screen")
    .classList.remove("hidden");

  $("#denied-screen")
    .classList.add("hidden");

  $("#admin-app")
    .classList.add("hidden");

}


function showDeniedScreen() {

  $("#auth-screen")
    .classList.add("hidden");

  $("#admin-app")
    .classList.add("hidden");

  $("#denied-screen")
    .classList.remove("hidden");

}


function showAdminApplication() {

  $("#auth-screen")
    .classList.add("hidden");

  $("#denied-screen")
    .classList.add("hidden");

  $("#admin-app")
    .classList.remove("hidden");

}


function resetApplication() {

  state.user = null;

  state.session = null;

  state.bootstrap = null;

  state.initialized = false;

  showAuthScreen();

  setConnectionStatus(
    "Signed out"
  );

}


/* ============================================================
   SIGN OUT
============================================================ */

async function signOut() {

  showLoading(
    "Signing out..."
  );


  const {
    error
  } = await db.auth.signOut();


  hideLoading();


  if (error) {

    showToast(
      error.message,
      "error"
    );

  }

}


/* ============================================================
   REFRESH
============================================================ */

async function refreshCurrentPage() {

  showLoading(
    "Refreshing CrowRules..."
  );


  await loadBootstrap();


  hideLoading();


  renderNavigation();


  await navigate(
    state.currentPage
  );


  showToast(
    "CrowRules Admin refreshed.",
    "success"
  );

}


/* ============================================================
   MOBILE SIDEBAR
============================================================ */

function openSidebar() {

  $("#sidebar")
    ?.classList.add("open");

  $("#sidebar-overlay")
    ?.classList.add("open");

}


function closeSidebar() {

  $("#sidebar")
    ?.classList.remove("open");

  $("#sidebar-overlay")
    ?.classList.remove("open");

}


/* ============================================================
   CONNECTION STATUS
============================================================ */

function setConnectionStatus(
  text
) {

  const element =
    $("#connection-status");

  if (element) {

    element.textContent =
      text;

  }

}


/* ============================================================
   LOADING
============================================================ */

function showLoading(
  message = "Loading..."
) {

  const loading =
    $("#global-loading");


  $("#loading-text")
    .textContent =
      message;


  loading
    .classList.remove("hidden");

}


function hideLoading() {

  $("#global-loading")
    .classList.add("hidden");

}


/* ============================================================
   AUTH ERROR
============================================================ */

function showAuthError(
  message
) {

  const element =
    $("#auth-message");


  if (!element) return;


  element.textContent =
    message || "Authentication error.";


  element.style.color =
    "var(--red)";

}


/* ============================================================
   TOAST
============================================================ */

function showToast(
  message,
  type = "info"
) {

  const container =
    $("#toast-container");


  const toast =
    document.createElement("div");


  toast.className =
    `toast ${type}`;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.remove();

    },
    4500
  );

}


/* ============================================================
   HELPERS
============================================================ */

function normalizePage(
  value
) {

  if (!value) {

    return "dashboard";

  }


  let page =
    String(value)
      .trim()
      .replace(/^#/, "")
      .replace(/^\/+/, "");


  if (
    page === "" ||
    page === "index.html"
  ) {

    return "dashboard";

  }


  if (
    page.includes("/")
  ) {

    page =
      page
        .split("/")
        .pop();

  }


  page =
    page
      .replace(".html", "")
      .replace(/\s+/g, "-")
      .toLowerCase();


  return page || "dashboard";

}


function formatDate(
  value
) {

  if (!value) {

    return "—";

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }


  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );

}


function formatValue(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  if (
    typeof value === "object"
  ) {

    return JSON.stringify(
      value
    );

  }


  return String(value);

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ============================================================
   END
============================================================ */
