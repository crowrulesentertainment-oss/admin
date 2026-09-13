/* =========================================================
   CrowRules Entertainment
   Admin OS v2.0
   Supabase-powered Administration Engine
   =========================================================

   SECURITY
   ---------------------------------------------------------
   Browser code may contain ONLY:
     • Supabase project URL
     • Supabase Publishable key

   NEVER place:
     • service_role
     • sb_secret_*
     • database passwords
     • Stripe secret keys
     • other server secrets

   Privileged mutations should be handled by protected
   Supabase Edge Functions.

   ========================================================= */

(() => {
  'use strict';

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  const SUPABASE_URL =
    'https://zauxdqyssratvzmomozf.supabase.co';

  const SUPABASE_CDN =
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  const KEY_STORAGE =
    'crowrules_supabase_publishable_key';

  const REFRESH_INTERVAL =
    60 * 1000;

  const APP_NAME =
    'CrowRules Admin OS';

  const APP_VERSION =
    '2.0.0';


  /* =======================================================
     STATE
     ======================================================= */

  let supabaseClient = null;

  let currentUser = null;

  let currentSession = null;

  let supabaseReady = false;

  let realtimeChannel = null;

  let refreshTimer = null;

  let isRefreshing = false;

  let lastRefresh = null;

  let connectionState = 'initializing';

  let diagnostics = [];


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const pages = [
    ['index.html', 'Command Center'],

    ['notifications.html', 'Notifications'],
    ['activity.html', 'Activity'],

    ['content.html', 'Content'],
    ['episodes.html', 'Episodes'],
    ['shows.html', 'Shows'],
    ['media.html', 'Media Library'],
    ['youtube.html', 'YouTube'],
    ['live-events.html', 'Live Events'],

    ['members.html', 'Members'],
    ['creators.html', 'Creators'],
    ['collaborators.html', 'Collaborators'],
    ['staff.html', 'Staff & Volunteers'],
    ['podcasters.html', 'Podcasters'],

    ['dream-library.html', 'Dream Library'],
    ['dream-projects.html', 'Dream Projects'],
    ['creative-rooms.html', 'Creative Rooms'],
    ['agreements.html', 'Agreements & Rights'],
    ['earnings.html', 'Earnings'],
    ['pitch-room.html', 'Pitch Room'],

    ['sports.html', 'Sports'],
    ['podcasting.html', 'Podcasting'],
    ['tv.html', 'Universal TV'],
    ['yearbooks.html', 'Yearbooks'],
    ['records.html', 'Records'],
    ['studios.html', 'Studios'],
    ['spectrum-awards.html', 'Spectrum Awards'],
    ['crowspace.html', 'CrowSpace'],

    ['business.html', 'Business & Finance'],
    ['analytics.html', 'Analytics']
  ];


  const groups = [
    [
      'OPERATIONS',
      [
        'index.html',
        'notifications.html',
        'activity.html'
      ]
    ],

    [
      'CONTENT',
      [
        'content.html',
        'episodes.html',
        'shows.html',
        'media.html',
        'youtube.html',
        'live-events.html'
      ]
    ],

    [
      'PEOPLE',
      [
        'members.html',
        'creators.html',
        'collaborators.html',
        'staff.html',
        'podcasters.html'
      ]
    ],

    [
      'DREAMSCAPES',
      [
        'dream-library.html',
        'dream-projects.html',
        'creative-rooms.html',
        'agreements.html',
        'earnings.html',
        'pitch-room.html'
      ]
    ],

    [
      'DIVISIONS',
      [
        'sports.html',
        'podcasting.html',
        'tv.html',
        'yearbooks.html',
        'records.html',
        'studios.html',
        'spectrum-awards.html',
        'crowspace.html'
      ]
    ],

    [
      'BUSINESS',
      [
        'business.html',
        'analytics.html'
      ]
    ]
  ];


  /* =======================================================
     PAGE DEFINITIONS
     ======================================================= */

  const pageDefinitions = {

    'index.html': {
      title: 'Command Center',
      description:
        'Executive overview of CrowRules Entertainment administration.',
      metrics: [
        ['Members', 'cr_members'],
        ['Content', 'cr_content'],
        ['Podcaster Applications', 'cr_podcaster_applications'],
        ['Suggestions', 'cr_member_suggestions']
      ]
    },

    'notifications.html': {
      title: 'Notifications',
      description:
        'Alerts, approvals, reminders, and system notices.',
      metrics: [
        ['Suggestions', 'cr_member_suggestions'],
        ['Podcaster Applications', 'cr_podcaster_applications']
      ]
    },

    'activity.html': {
      title: 'Activity',
      description:
        'Recent platform and administrative activity.',
      metrics: [
        ['Members', 'cr_members'],
        ['Content', 'cr_content'],
        ['Watch History', 'cr_member_watch_history'],
        ['Engagement', 'cr_member_engagement_ledger']
      ]
    },

    'content.html': {
      title: 'Content',
      description:
        'Manage published and developing CrowRules content.',
      metrics: [
        ['Content', 'cr_content'],
        ['Episodes', 'tacoma_nights_episodes'],
        ['Back Deck Episodes', 'back_deck_episodes']
      ]
    },

    'episodes.html': {
      title: 'Episodes',
      description:
        'Episode production and release control.',
      metrics: [
        ['Tacoma Nights', 'tacoma_nights_episodes'],
        ['Back Deck Live', 'back_deck_episodes']
      ]
    },

    'shows.html': {
      title: 'Shows',
      description:
        'Shows, series, seasons, and programming.',
      metrics: [
        ['Content', 'cr_content'],
        ['Tacoma Nights Episodes', 'tacoma_nights_episodes'],
        ['Back Deck Episodes', 'back_deck_episodes']
      ]
    },

    'media.html': {
      title: 'Media Library',
      description:
        'Media assets, artwork, video, and production files.',
      metrics: [
        ['Content', 'cr_content']
      ]
    },

    'youtube.html': {
      title: 'YouTube',
      description:
        'YouTube publishing and channel operations.',
      metrics: [
        ['Content', 'cr_content'],
        ['Episodes', 'tacoma_nights_episodes']
      ]
    },

    'live-events.html': {
      title: 'Live Events',
      description:
        'Live broadcasts and event control.',
      metrics: [
        ['Content', 'cr_content']
      ]
    },

    'members.html': {
      title: 'Members',
      description:
        'Member accounts and community administration.',
      metrics: [
        ['Members', 'cr_members'],
        ['Profiles', 'cr_profiles'],
        ['Watch History', 'cr_member_watch_history']
      ]
    },

    'creators.html': {
      title: 'Creators',
      description:
        'Creator profiles, submissions, and relationships.',
      metrics: [
        ['Profiles', 'cr_profiles'],
        ['Content', 'cr_content'],
        ['Suggestions', 'cr_member_suggestions']
      ]
    },

    'collaborators.html': {
      title: 'Collaborators',
      description:
        'Writers, artists, filmmakers, designers, and partners.',
      metrics: [
        ['Profiles', 'cr_profiles'],
        ['Content', 'cr_content']
      ]
    },

    'staff.html': {
      title: 'Staff & Volunteers',
      description:
        'CrowRules team and volunteer administration.',
      metrics: [
        ['Profiles', 'cr_profiles'],
        ['Members', 'cr_members']
      ]
    },

    'podcasters.html': {
      title: 'Podcasters',
      description:
        'Podcaster applications and podcast operations.',
      metrics: [
        ['Applications', 'cr_podcaster_applications'],
        ['Members', 'cr_members'],
        ['Content', 'cr_content']
      ]
    },

    'dream-library.html': {
      title: 'Dream Library',
      description:
        'The central CrowRules Dreamscapes idea library.',
      metrics: [
        ['Suggestions', 'cr_member_suggestions'],
        ['Creators', 'cr_profiles'],
        ['Content', 'cr_content']
      ]
    },

    'dream-projects.html': {
      title: 'Dream Projects',
      description:
        'Projects developed from Dreamscapes ideas.',
      metrics: [
        ['Content', 'cr_content'],
        ['Suggestions', 'cr_member_suggestions']
      ]
    },

    'creative-rooms.html': {
      title: 'Creative Rooms',
      description:
        'Collaborative rooms for developing stories and worlds.',
      metrics: [
        ['Content', 'cr_content'],
        ['Profiles', 'cr_profiles']
      ]
    },

    'agreements.html': {
      title: 'Agreements & Rights',
      description:
        'Creator rights, agreements, releases, and documentation.',
      metrics: [
        ['Profiles', 'cr_profiles'],
        ['Suggestions', 'cr_member_suggestions']
      ]
    },

    'earnings.html': {
      title: 'Earnings',
      description:
        'Creator participation, revenue, and payout tracking.',
      metrics: [
        ['Creators', 'cr_profiles'],
        ['Content', 'cr_content']
      ]
    },

    'pitch-room.html': {
      title: 'Pitch Room',
      description:
        'Internal pitch development and decision workflow.',
      metrics: [
        ['Suggestions', 'cr_member_suggestions'],
        ['Content', 'cr_content']
      ]
    },

    'sports.html': {
      title: 'Sports',
      description:
        'CrowRules Sports operations and Pick Em administration.',
      metrics: [
        ['Sports Games', 'sports_games'],
        ['Sports Leagues', 'sports_leagues']
      ]
    },

    'podcasting.html': {
      title: 'Podcasting',
      description:
        'CrowRules Podcasting branch administration.',
      metrics: [
        ['Applications', 'cr_podcaster_applications'],
        ['Content', 'cr_content']
      ],
      launch: '2027'
    },

    'tv.html': {
      title: 'Universal TV',
      description:
        'CrowRules Universal TV 24/7 network control.',
      metrics: [
        ['Content', 'cr_content'],
        ['Live Events', 'cr_content']
      ]
    },

    'yearbooks.html': {
      title: 'Yearbooks',
      description:
        'CrowRules Video School Yearbook operations.',
      metrics: [
        ['Content', 'cr_content']
      ],
      launch: '2029'
    },

    'records.html': {
      title: 'Records',
      description:
        'CrowRules Records administration.',
      metrics: [
        ['Content', 'cr_content'],
        ['Creators', 'cr_profiles']
      ],
      launch: '2031'
    },

    'studios.html': {
      title: 'Studios',
      description:
        'CrowRules Studios production operations.',
      metrics: [
        ['Content', 'cr_content'],
        ['Profiles', 'cr_profiles']
      ],
      launch: '2031'
    },

    'spectrum-awards.html': {
      title: 'Spectrum Awards',
      description:
        'Spectrum Awards planning and administration.',
      metrics: [
        ['Content', 'cr_content'],
        ['Members', 'cr_members']
      ],
      launch: '2029'
    },

    'crowspace.html': {
      title: 'CrowSpace',
      description:
        'CrowSpace social platform administration.',
      metrics: [
        ['Members', 'cr_members'],
        ['Content', 'cr_content']
      ],
      launch: '2028'
    },

    'business.html': {
      title: 'Business & Finance',
      description:
        'Business, finance, sponsorships, donations, and campaigns.',
      metrics: [
        ['Members', 'cr_members'],
        ['Content', 'cr_content']
      ]
    },

    'analytics.html': {
      title: 'Analytics',
      description:
        'Cross-platform analytics and performance reporting.',
      metrics: [
        ['Watch History', 'cr_member_watch_history'],
        ['Engagement', 'cr_member_engagement_ledger'],
        ['Members', 'cr_members']
      ]
    }

  };


  /* =======================================================
     UTILITIES
     ======================================================= */

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function formatNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return String(value);
    }

    return number.toLocaleString();
  }


  function formatDate(value) {
    if (!value) {
      return 'Unknown';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }


  function currentPage() {
    return (
      location.pathname
        .split('/')
        .pop() ||
      'index.html'
    );
  }


  function pageDefinition() {
    return (
      pageDefinitions[currentPage()] ||
      pageDefinitions['index.html']
    );
  }


  function recordDiagnostic(
    type,
    message,
    details = null
  ) {
    diagnostics.unshift({
      time: new Date().toISOString(),
      type,
      message,
      details
    });

    diagnostics =
      diagnostics.slice(0, 100);

    updateDiagnosticsUI();
  }


  /* =======================================================
     SUPABASE KEY
     ======================================================= */

  function getPublishableKey() {

    if (
      window.CROWRULES_SUPABASE_PUBLISHABLE_KEY
    ) {
      return String(
        window.CROWRULES_SUPABASE_PUBLISHABLE_KEY
      ).trim();
    }

    try {
      const stored =
        localStorage.getItem(
          KEY_STORAGE
        );

      if (stored) {
        return stored.trim();
      }
    } catch (error) {
      console.warn(
        '[CrowRules Admin] localStorage unavailable.',
        error
      );
    }

    return '';
  }


  function isUnsafeKey(key) {

    const value =
      String(key || '')
        .trim()
        .toLowerCase();

    return (
      value.startsWith('sb_secret_') ||
      value.includes('service_role') ||
      value.startsWith('eyj')
    );
  }


  /* =======================================================
     SUPABASE LIBRARY
     ======================================================= */

  function loadSupabaseLibrary() {

    return new Promise(
      (resolve, reject) => {

        if (
          window.supabase &&
          typeof window.supabase.createClient ===
            'function'
        ) {
          resolve(window.supabase);
          return;
        }

        const existing =
          document.querySelector(
            'script[data-crowrules-supabase]'
          );

        if (existing) {

          existing.addEventListener(
            'load',
            () => {

              if (
                window.supabase &&
                typeof window.supabase
                  .createClient ===
                  'function'
              ) {
                resolve(window.supabase);
              } else {
                reject(
                  new Error(
                    'Supabase library loaded without createClient.'
                  )
                );
              }

            }
          );

          existing.addEventListener(
            'error',
            () => {
              reject(
                new Error(
                  'Supabase library failed to load.'
                )
              );
            }
          );

          return;
        }


        const script =
          document.createElement(
            'script'
          );

        script.src =
          SUPABASE_CDN;

        script.async = true;

        script.dataset.crowrulesSupabase =
          'true';

        script.onload = () => {

          if (
            window.supabase &&
            typeof window.supabase
              .createClient ===
              'function'
          ) {
            resolve(
              window.supabase
            );
          } else {
            reject(
              new Error(
                'Supabase JS loaded, but createClient is unavailable.'
              )
            );
          }

        };

        script.onerror = () => {
          reject(
            new Error(
              'Unable to load Supabase JS from CDN.'
            )
          );
        };

        document.head.appendChild(
          script
        );
      }
    );
  }


  /* =======================================================
     INITIALIZE SUPABASE
     ======================================================= */

  async function initializeSupabase() {

    connectionState =
      'loading';

    updateConnectionIndicator();


    const key =
      getPublishableKey();


    if (!key) {

      connectionState =
        'missing-key';

      recordDiagnostic(
        'warning',
        'Supabase Publishable key has not been configured.'
      );

      updateConnectionIndicator();

      return false;
    }


    if (isUnsafeKey(key)) {

      connectionState =
        'unsafe-key';

      recordDiagnostic(
        'error',
        'Unsafe Supabase key rejected. Use a Publishable key only.'
      );

      updateConnectionIndicator();

      return false;
    }


    try {

      const sdk =
        await loadSupabaseLibrary();


      supabaseClient =
        sdk.createClient(
          SUPABASE_URL,
          key,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true
            }
          }
        );


      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .getSession();


      if (error) {

        recordDiagnostic(
          'error',
          'Unable to retrieve Supabase session.',
          error.message
        );

      }


      currentSession =
        data?.session ||
        null;

      currentUser =
        currentSession?.user ||
        null;


      supabaseClient
        .auth
        .onAuthStateChange(
          (_event, session) => {

            currentSession =
              session ||
              null;

            currentUser =
              session?.user ||
              null;

            updateConnectionIndicator();

            updateUserPanel();

            refreshPageData();

          }
        );


      supabaseReady =
        true;

      connectionState =
        'connected';


      recordDiagnostic(
        'success',
        'Supabase client initialized.'
      );


      updateConnectionIndicator();

      return true;

    } catch (error) {

      supabaseReady =
        false;

      connectionState =
        'error';


      recordDiagnostic(
        'error',
        'Supabase initialization failed.',
        error.message
      );


      updateConnectionIndicator();

      return false;
    }
  }


  /* =======================================================
     SAFE TABLE COUNT
     ======================================================= */

  async function countTable(
    table
  ) {

    if (
      !supabaseClient
    ) {
      return {
        count: null,
        error:
          'Supabase is not initialized.'
      };
    }


    try {

      const result =
        await supabaseClient
          .from(table)
          .select('*', {
            count: 'exact',
            head: true
          });


      if (result.error) {

        return {
          count: null,
          error:
            result.error.message
        };
      }


      return {
        count:
          result.count ?? 0,
        error:
          null
      };

    } catch (error) {

      return {
        count: null,
        error:
          error.message
      };
    }
  }


  /* =======================================================
     SAFE RECENT RECORDS
     ======================================================= */

  async function recentRecords(
    table,
    limit = 5
  ) {

    if (
      !supabaseClient
    ) {
      return {
        rows: [],
        error:
          'Supabase is not initialized.'
      };
    }


    try {

      /*
       Do NOT assume created_at exists.

       This prevents the same type of error that
       previously affected Dreamscapes administration.
      */

      const result =
        await supabaseClient
          .from(table)
          .select('*')
          .limit(limit);


      if (result.error) {

        return {
          rows: [],
          error:
            result.error.message
        };
      }


      return {
        rows:
          result.data || [],
        error:
          null
      };

    } catch (error) {

      return {
        rows: [],
        error:
          error.message
      };
    }
  }


  /* =======================================================
     DASHBOARD DATA
     ======================================================= */

  async function loadDashboardData() {

    if (
      !supabaseReady ||
      !supabaseClient
    ) {
      return;
    }


    if (isRefreshing) {
      return;
    }


    isRefreshing = true;


    try {

      const definition =
        pageDefinition();


      const metricResults =
        await Promise.all(
          (
            definition.metrics ||
            []
          ).map(
            async ([label, table]) => {

              const result =
                await countTable(
                  table
                );

              return {
                label,
                table,
                ...result
              };
            }
          )
        );


      renderMetrics(
        metricResults
      );


      await loadRecentActivity();


      lastRefresh =
        new Date();


      updateLastRefresh();


      recordDiagnostic(
        'success',
        'Dashboard data refreshed.'
      );

    } catch (error) {

      recordDiagnostic(
        'error',
        'Dashboard refresh failed.',
        error.message
      );

    } finally {

      isRefreshing =
        false;
    }
  }


  async function refreshPageData() {

    if (!supabaseReady) {
      return;
    }

    await loadDashboardData();
  }


  /* =======================================================
     METRIC UI
     ======================================================= */

  function renderMetrics(
    results
  ) {

    const container =
      document.getElementById(
        'adminMetrics'
      );


    if (!container) {
      return;
    }


    container.innerHTML =
      results.map(
        result => {

          const value =
            result.error
              ? '—'
              : formatNumber(
                  result.count
                );


          const status =
            result.error
              ? 'Unavailable'
              : 'Live';


          return `
            <article class="admin-metric">
              <div class="admin-metric-label">
                ${escapeHtml(result.label)}
              </div>

              <div class="admin-metric-value">
                ${escapeHtml(value)}
              </div>

              <div class="admin-metric-status">
                ${escapeHtml(status)}
              </div>

              ${
                result.error
                  ? `
                    <div class="admin-metric-error">
                      ${escapeHtml(result.error)}
                    </div>
                  `
                  : ''
              }
            </article>
          `;
        }
      ).join('');
  }


  /* =======================================================
     RECENT ACTIVITY
     ======================================================= */

  async function loadRecentActivity() {

    const container =
      document.getElementById(
        'recentRecords'
      );


    if (!container) {
      return;
    }


    if (
      !supabaseReady
    ) {

      container.innerHTML = `
        <div class="admin-empty">
          Connect Supabase to load recent records.
        </div>
      `;

      return;
    }


    const sources = [
      'cr_content',
      'cr_member_suggestions',
      'cr_podcaster_applications'
    ];


    const results = [];


    for (
      const table of sources
    ) {

      const result =
        await recentRecords(
          table,
          5
        );


      if (
        result.error
      ) {

        recordDiagnostic(
          'warning',
          `Unable to read ${table}.`,
          result.error
        );

        continue;
      }


      result.rows.forEach(
        row => {

          results.push({
            table,
            row
          });

        }
      );
    }


    results.sort(
      (a, b) => {

        const ad =
          extractDate(
            a.row
          );

        const bd =
          extractDate(
            b.row
          );

        return (
          bd - ad
        );
      }
    );


    const limited =
      results.slice(
        0,
        12
      );


    if (
      !limited.length
    ) {

      container.innerHTML = `
        <div class="admin-empty">
          No accessible recent records were returned.
        </div>
      `;

      return;
    }


    container.innerHTML =
      limited.map(
        item => {

          const title =
            extractRecordTitle(
              item.row
            );

          const date =
            extractDate(
              item.row
            );


          return `
            <article class="admin-record">
              <div class="admin-record-source">
                ${escapeHtml(item.table)}
              </div>

              <div class="admin-record-title">
                ${escapeHtml(title)}
              </div>

              <div class="admin-record-date">
                ${escapeHtml(
                  date
                    ? formatDate(date)
                    : 'Date unavailable'
                )}
              </div>
            </article>
          `;
        }
      ).join('');
  }


  function extractDate(
    row
  ) {

    if (!row || typeof row !== 'object') {
      return null;
    }


    const possible =
      [
        'created_at',
        'updated_at',
        'published_at',
        'submitted_at',
        'scheduled_at',
        'date',
        'timestamp'
      ];


    for (
      const key of possible
    ) {

      if (
        row[key]
      ) {

        const date =
          new Date(
            row[key]
          );


        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          return date.toISOString();
        }
      }
    }


    return null;
  }


  function extractRecordTitle(
    row
  ) {

    if (!row || typeof row !== 'object') {
      return 'Record';
    }


    const keys =
      [
        'title',
        'name',
        'display_name',
        'full_name',
        'subject',
        'email',
        'slug',
        'id'
      ];


    for (
      const key of keys
    ) {

      if (
        row[key] !== undefined &&
        row[key] !== null &&
        String(row[key]).trim()
      ) {

        return String(
          row[key]
        );
      }
    }


    return 'Record';
  }


  /* =======================================================
     NAVIGATION RENDER
     ======================================================= */

  function renderNavigation() {

    const existing =
      document.querySelector(
        '.crowrules-admin-sidebar'
      );


    if (existing) {
      existing.remove();
    }


    const path =
      currentPage();


    const sidebar =
      document.createElement(
        'aside'
      );


    sidebar.className =
      'crowrules-admin-sidebar';


    sidebar.innerHTML = `
      <div class="admin-brand">
        <div class="admin-brand-main">
          CROW<span>RULES</span>
        </div>

        <div class="admin-brand-sub">
          ADMIN OS ${APP_VERSION}
        </div>
      </div>

      <div
        class="admin-connection"
        id="connectionPanel">

        <div
          class="admin-connection-dot"
          id="connectionDot">
        </div>

        <div>
          <div class="admin-connection-title">
            SUPABASE
          </div>

          <div
            class="admin-connection-text"
            id="connectionText">
            Initializing...
          </div>
        </div>

      </div>

      <nav class="admin-navigation">

        ${groups.map(
          ([group, items]) => `

            <div class="admin-nav-group">
              ${escapeHtml(group)}
            </div>

            ${items.map(
              file => {

                const page =
                  pages.find(
                    item =>
                      item[0] === file
                  );

                const label =
                  page
                    ? page[1]
                    : file;


                return `
                  <a
                    class="admin-nav-link ${
                      file === path
                        ? 'active'
                        : ''
                    }"
                    href="${escapeHtml(file)}">

                    ${escapeHtml(label)}

                  </a>
                `;
              }
            ).join('')}

          `
        ).join('')}

      </nav>

      <div class="admin-sidebar-footer">

        <button
          type="button"
          class="admin-nav-button"
          onclick="CrowRulesAdmin.configureSupabase()">

          Configure Supabase

        </button>

        <button
          type="button"
          class="admin-nav-button"
          onclick="CrowRulesAdmin.refresh()">

          Refresh Data

        </button>

        ${
          currentUser
            ? `
              <button
                type="button"
                class="admin-nav-button"
                onclick="CrowRulesAdmin.signOut()">

                Sign Out

              </button>
            `
            : ''
        }

      </div>
    `;


    document.body.prepend(
      sidebar
    );
  }


  /* =======================================================
     PAGE RENDER
     ======================================================= */

  function renderPage() {

    const definition =
      pageDefinition();


    let main =
      document.querySelector(
        'main'
      );


    if (!main) {

      main =
        document.createElement(
          'main'
        );

      document.body.appendChild(
        main
      );
    }


    main.innerHTML = `

      <div class="admin-page">

        <header class="admin-header">

          <div>

            <div class="admin-eyebrow">
              CROWRULES ENTERTAINMENT
              • ADMINISTRATION
            </div>

            <h1 class="admin-title">
              ${escapeHtml(
                definition.title
              )}
            </h1>

            <p class="admin-subtitle">
              ${escapeHtml(
                definition.description
              )}
            </p>

          </div>

          <div class="admin-header-actions">

            <button
              type="button"
              class="admin-action"
              onclick="CrowRulesAdmin.refresh()">

              Refresh

            </button>

            <button
              type="button"
              class="admin-action"
              onclick="CrowRulesAdmin.openDiagnostics()">

              Diagnostics

            </button>

          </div>

        </header>


        <section
          class="admin-status-bar"
          id="adminStatusBar">

          <div>
            <strong>System:</strong>
            <span id="systemStatus">
              Initializing
            </span>
          </div>

          <div>
            <strong>User:</strong>
            <span id="adminUser">
              Not signed in
            </span>
          </div>

          <div>
            <strong>Last Refresh:</strong>
            <span id="lastRefresh">
              Never
            </span>
          </div>

        </section>


        <section
          class="admin-metrics"
          id="adminMetrics">

          <div class="admin-loading">
            Loading live data...
          </div>

        </section>


        ${
          definition.launch
            ? `
              <section class="admin-launch-card">

                <div class="admin-launch-label">
                  PLANNED LAUNCH
                </div>

                <div class="admin-launch-year">
                  ${escapeHtml(
                    definition.launch
                  )}
                </div>

              </section>
            `
            : ''
        }


        <section class="admin-workspace">

          <div class="admin-panel">

            <div class="admin-panel-header">

              <div>
                <div class="admin-panel-kicker">
                  LIVE DATA
                </div>

                <h2>
                  Recent Records
                </h2>
              </div>

            </div>

            <div
              id="recentRecords"
              class="admin-records">

              <div class="admin-empty">
                Loading...
              </div>

            </div>

          </div>


          <div class="admin-panel">

            <div class="admin-panel-header">

              <div>
                <div class="admin-panel-kicker">
                  SYSTEM
                </div>

                <h2>
                  Administration Status
                </h2>
              </div>

            </div>

            <div
              id="systemOverview"
              class="admin-system-overview">

              <div>
                Supabase:
                <strong id="systemSupabase">
                  Checking...
                </strong>
              </div>

              <div>
                Authentication:
                <strong id="systemAuth">
                  Checking...
                </strong>
              </div>

              <div>
                Realtime:
                <strong id="systemRealtime">
                  Standby
                </strong>
              </div>

              <div>
                Automatic Refresh:
                <strong>
                  60 seconds
                </strong>
              </div>

            </div>

          </div>

        </section>


        <section
          id="diagnosticsPanel"
          class="admin-panel admin-diagnostics"
          hidden>

          <div class="admin-panel-header">

            <div>
              <div class="admin-panel-kicker">
                DIAGNOSTICS
              </div>

              <h2>
                System Diagnostics
              </h2>
            </div>

            <button
              type="button"
              class="admin-action"
              onclick="CrowRulesAdmin.clearDiagnostics()">

              Clear

            </button>

          </div>

          <div
            id="diagnosticsList"
            class="admin-diagnostics-list">
          </div>

        </section>


        <footer class="admin-footer">

          <span>
            ${APP_NAME}
            v${APP_VERSION}
          </span>

          <span>
            CrowRules Entertainment
          </span>

        </footer>

      </div>
    `;


    updateUserPanel();

    updateConnectionIndicator();

    updateLastRefresh();

    updateDiagnosticsUI();
  }


  /* =======================================================
     CONNECTION UI
     ======================================================= */

  function updateConnectionIndicator() {

    const dot =
      document.getElementById(
        'connectionDot'
      );


    const text =
      document.getElementById(
        'connectionText'
      );


    const systemStatus =
      document.getElementById(
        'systemStatus'
      );


    const systemSupabase =
      document.getElementById(
        'systemSupabase'
      );


    if (dot) {

      dot.className =
        'admin-connection-dot ' +
        connectionState;
    }


    let label =
      'Initializing';


    switch (
      connectionState
    ) {

      case 'connected':
        label =
          'Connected';
        break;

      case 'loading':
        label =
          'Connecting...';
        break;

      case 'missing-key':
        label =
          'Key Required';
        break;

      case 'unsafe-key':
        label =
          'Unsafe Key';
        break;

      case 'error':
        label =
          'Connection Error';
        break;

      default:
        label =
          'Standby';
    }


    if (text) {
      text.textContent =
        label;
    }


    if (systemStatus) {
      systemStatus.textContent =
        label;
    }


    if (systemSupabase) {
      systemSupabase.textContent =
        label;
    }
  }


  /* =======================================================
     USER UI
     ======================================================= */

  function updateUserPanel() {

    const user =
      document.getElementById(
        'adminUser'
      );


    const auth =
      document.getElementById(
        'systemAuth'
      );


    if (!currentUser) {

      if (user) {
        user.textContent =
          'Not signed in';
      }

      if (auth) {
        auth.textContent =
          'Not signed in';
      }

      return;
    }


    const email =
      currentUser.email ||
      currentUser.id ||
      'Authenticated';


    if (user) {
      user.textContent =
        email;
    }


    if (auth) {
      auth.textContent =
        'Authenticated';
    }
  }


  function updateLastRefresh() {

    const element =
      document.getElementById(
        'lastRefresh'
      );


    if (!element) {
      return;
    }


    element.textContent =
      lastRefresh
        ? formatDate(
            lastRefresh
          )
        : 'Never';
  }


  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  async function signIn() {

    if (!supabaseClient) {

      showToast(
        'Configure Supabase first.',
        'warning'
      );

      return;
    }


    const email =
      window.prompt(
        'CrowRules Admin email:'
      );


    if (!email) {
      return;
    }


    const password =
      window.prompt(
        'CrowRules Admin password:'
      );


    if (!password) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .signInWithPassword({
            email:
              email.trim(),
            password
          });


      if (error) {

        recordDiagnostic(
          'error',
          'Admin sign-in failed.',
          error.message
        );

        showToast(
          error.message,
          'error'
        );

        return;
      }


      currentSession =
        data.session;

      currentUser =
        data.user;


      updateUserPanel();

      renderNavigation();

      updateConnectionIndicator();

      showToast(
        'Signed in successfully.',
        'success'
      );


      await refreshPageData();

    } catch (error) {

      recordDiagnostic(
        'error',
        'Sign-in exception.',
        error.message
      );

      showToast(
        error.message,
        'error'
      );
    }
  }


  async function signOut() {

    if (
      !supabaseClient
    ) {
      return;
    }


    try {

      const {
        error
      } =
        await supabaseClient
          .auth
          .signOut();


      if (error) {

        showToast(
          error.message,
          'error'
        );

        return;
      }


      currentUser =
        null;

      currentSession =
        null;


      renderNavigation();

      updateUserPanel();

      showToast(
        'Signed out.',
        'success'
      );

    } catch (error) {

      showToast(
        error.message,
        'error'
      );
    }
  }


  /* =======================================================
     SUPABASE CONFIGURATION
     ======================================================= */

  function configureSupabase() {

    const current =
      getPublishableKey();


    const key =
      window.prompt(
        'Enter your Supabase Publishable key (sb_publishable_...).',
        current
      );


    if (
      key === null
    ) {
      return;
    }


    const clean =
      key.trim();


    if (!clean) {

      showToast(
        'No key entered.',
        'warning'
      );

      return;
    }


    if (
      isUnsafeKey(clean)
    ) {

      showToast(
        'Rejected. Use a Supabase Publishable key, not service_role, sb_secret, or a JWT secret.',
        'error'
      );

      return;
    }


    if (
      !clean.startsWith(
        'sb_publishable_'
      )
    ) {

      showToast(
        'That does not look like a Supabase Publishable key.',
        'warning'
      );

      return;
    }


    try {

      localStorage.setItem(
        KEY_STORAGE,
        clean
      );

    } catch (error) {

      showToast(
        'Unable to save the key in this browser.',
        'error'
      );

      return;
    }


    showToast(
      'Supabase configuration saved. Reloading...',
      'success'
    );


    setTimeout(
      () => {
        location.reload();
      },
      700
    );
  }


  /* =======================================================
     REALTIME
     ======================================================= */

  async function initializeRealtime() {

    if (
      !supabaseClient
    ) {
      return;
    }


    try {

      if (
        realtimeChannel
      ) {

        await supabaseClient
          .removeChannel(
            realtimeChannel
          );
      }


      realtimeChannel =
        supabaseClient
          .channel(
            'crowrules-admin-live'
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cr_content'
            },
            () => {

              recordDiagnostic(
                'info',
                'Live content change detected.'
              );

              refreshPageData();
            }
          )
          .subscribe(
            status => {

              const element =
                document.getElementById(
                  'systemRealtime'
                );


              if (!element) {
                return;
              }


              if (
                status ===
                'SUBSCRIBED'
              ) {

                element.textContent =
                  'Connected';

                recordDiagnostic(
                  'success',
                  'Realtime channel connected.'
                );

              } else {

                element.textContent =
                  status;
              }
            }
          );

    } catch (error) {

      const element =
        document.getElementById(
          'systemRealtime'
        );


      if (element) {
        element.textContent =
          'Unavailable';
      }


      recordDiagnostic(
        'warning',
        'Realtime is unavailable or not enabled for the selected table.',
        error.message
      );
    }
  }


  /* =======================================================
     AUTOMATIC REFRESH
     ======================================================= */

  function startAutoRefresh() {

    if (
      refreshTimer
    ) {
      clearInterval(
        refreshTimer
      );
    }


    refreshTimer =
      setInterval(
        () => {

          refreshPageData();

        },
        REFRESH_INTERVAL
      );
  }


  /* =======================================================
     DIAGNOSTICS
     ======================================================= */

  function updateDiagnosticsUI() {

    const list =
      document.getElementById(
        'diagnosticsList'
      );


    if (!list) {
      return;
    }


    if (
      !diagnostics.length
    ) {

      list.innerHTML = `
        <div class="admin-empty">
          No diagnostics recorded.
        </div>
      `;

      return;
    }


    list.innerHTML =
      diagnostics.map(
        item => `

          <div class="admin-diagnostic ${escapeHtml(item.type)}">

            <div class="admin-diagnostic-time">
              ${escapeHtml(
                formatDate(
                  item.time
                )
              )}
            </div>

            <div class="admin-diagnostic-message">
              ${escapeHtml(
                item.message
              )}
            </div>

            ${
              item.details
                ? `
                  <pre class="admin-diagnostic-details">${escapeHtml(
                    typeof item.details ===
                    'string'
                      ? item.details
                      : JSON.stringify(
                          item.details,
                          null,
                          2
                        )
                  )}</pre>
                `
                : ''
            }

          </div>

        `
      ).join('');
  }


  function openDiagnostics() {

    const panel =
      document.getElementById(
        'diagnosticsPanel'
      );


    if (!panel) {
      return;
    }


    panel.hidden =
      !panel.hidden;


    if (!panel.hidden) {

      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }


  function clearDiagnostics() {

    diagnostics =
      [];

    updateDiagnosticsUI();
  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(
    message,
    type = 'info'
  ) {

    let container =
      document.getElementById(
        'crowrulesToastContainer'
      );


    if (!container) {

      container =
        document.createElement(
          'div'
        );

      container.id =
        'crowrulesToastContainer';

      container.className =
        'crowrules-toast-container';

      document.body.appendChild(
        container
      );
    }


    const toast =
      document.createElement(
        'div'
      );


    toast.className =
      `crowrules-toast ${type}`;


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


  /* =======================================================
     GLOBAL SEARCH
     ======================================================= */

  async function globalSearch(
    query
  ) {

    const term =
      String(
        query || ''
      ).trim();


    if (
      !term
    ) {

      showToast(
        'Enter something to search.',
        'warning'
      );

      return [];
    }


    if (
      !supabaseClient
    ) {

      showToast(
        'Supabase is not configured.',
        'warning'
      );

      return [];
    }


    const tables = [
      'cr_members',
      'cr_profiles',
      'cr_content',
      'cr_member_suggestions',
      'cr_podcaster_applications'
    ];


    const results = [];


    for (
      const table of tables
    ) {

      try {

        const response =
          await supabaseClient
            .from(table)
            .select('*')
            .limit(10);


        if (
          response.error ||
          !response.data
        ) {
          continue;
        }


        response.data.forEach(
          row => {

            const text =
              JSON.stringify(
                row
              ).toLowerCase();


            if (
              text.includes(
                term.toLowerCase()
              )
            ) {

              results.push({
                table,
                row
              });
            }

          }
        );

      } catch {
        /* Intentionally ignore inaccessible tables. */
      }
    }


    return results.slice(
      0,
      50
    );
  }


  /* =======================================================
     PRIVILEGED OPERATION PLACEHOLDERS
     ======================================================= */

  async function invokeProtectedFunction(
    functionName,
    payload = {}
  ) {

    if (
      !supabaseClient
    ) {

      throw new Error(
        'Supabase is not initialized.'
      );
    }


    if (
      !currentSession
    ) {

      throw new Error(
        'Authentication is required.'
      );
    }


    /*
      Privileged operations should go through
      Edge Functions protected by JWT/RLS/server-side
      authorization.

      This keeps service_role credentials OUT of
      browser JavaScript.
    */

    const {
      data,
      error
    } =
      await supabaseClient
        .functions
        .invoke(
          functionName,
          {
            body: payload
          }
        );


    if (error) {
      throw error;
    }


    return data;
  }


  /* =======================================================
     PAGE ACTIONS
     ======================================================= */

  async function refresh() {

    showToast(
      'Refreshing CrowRules Admin...',
      'info'
    );


    await refreshPageData();


    showToast(
      'Admin data refreshed.',
      'success'
    );
  }


  async function healthCheck() {

    const tables = [
      'cr_members',
      'cr_profiles',
      'cr_content'
    ];


    const results = [];


    for (
      const table of tables
    ) {

      const result =
        await countTable(
          table
        );


      results.push({
        table,
        ...result
      });
    }


    return results;
  }


  /* =======================================================
     EXPORT DATA
     ======================================================= */

  async function exportCurrentData() {

    const definition =
      pageDefinition();


    const output = [];


    for (
      const [, table] of
        definition.metrics || []
    ) {

      const result =
        await recentRecords(
          table,
          100
        );


      if (
        !result.error
      ) {

        output.push({
          table,
          records:
            result.rows
        });
      }
    }


    const blob =
      new Blob(
        [
          JSON.stringify(
            {
              exported_at:
                new Date().toISOString(),
              page:
                currentPage(),
              data:
                output
            },
            null,
            2
          )
        ],
        {
          type:
            'application/json'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;

    link.download =
      `crowrules-admin-${currentPage().replace(
        '.html',
        ''
      )}-${Date.now()}.json`;


    link.click();


    URL.revokeObjectURL(
      url
    );
  }


  /* =======================================================
     BOOT
     ======================================================= */

  async function boot() {

    try {

      renderNavigation();

      renderPage();


      const initialized =
        await initializeSupabase();


      if (!initialized) {

        showToast(
          'Supabase needs configuration before live data can load.',
          'warning'
        );

        return;
      }


      updateUserPanel();


      await loadDashboardData();


      await initializeRealtime();


      startAutoRefresh();


      recordDiagnostic(
        'success',
        'CrowRules Admin OS boot completed.'
      );


    } catch (error) {

      recordDiagnostic(
        'error',
        'Admin OS boot failure.',
        error.message
      );


      console.error(
        '[CrowRules Admin]',
        error
      );
    }
  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.CrowRulesAdmin = {

    version:
      APP_VERSION,

    client:
      () => supabaseClient,

    user:
      () => currentUser,

    session:
      () => currentSession,

    refresh,

    signIn,

    signOut,

    configureSupabase,

    openDiagnostics,

    clearDiagnostics,

    healthCheck,

    globalSearch,

    exportCurrentData,

    invokeProtectedFunction,

    countTable,

    recentRecords

  };


  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot
    );

  } else {

    boot();
  }

})();
