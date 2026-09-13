const SUPABASE_URL = 'https://cevylpnoexugwgygvtgu.supabase.co';

/*
CrowRules Entertainment Admin OS
--------------------------------

Supabase-powered browser administration layer.

IMPORTANT:

* Put ONLY a Supabase Publishable key here.
* NEVER put a service_role or sb_secret key in this file.
* RLS must protect every exposed table.
  */

const SUPABASE_PUBLISHABLE_KEY =
window.CROWRULES_SUPABASE_PUBLISHABLE_KEY ||
localStorage.getItem('crowrules_supabase_publishable_key') ||
'sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-';

const SUPABASE_CDN =
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

let supabaseClient = null;
let currentUser = null;
let currentSession = null;
let connectionState = 'initializing';

const pages = [
['index.html','Command Center'],
['notifications.html','Notifications'],
['activity.html','Activity'],
['content.html','Content'],
['episodes.html','Episodes'],
['shows.html','Shows'],
['media.html','Media Library'],
['youtube.html','YouTube'],
['live-events.html','Live Events'],
['members.html','Members'],
['creators.html','Creators'],
['collaborators.html','Collaborators'],
['staff.html','Staff & Volunteers'],
['podcasters.html','Podcasters'],
['dream-library.html','Dream Library'],
['dream-projects.html','Dream Projects'],
['creative-rooms.html','Creative Rooms'],
['agreements.html','Agreements & Rights'],
['earnings.html','Earnings'],
['pitch-room.html','Pitch Room'],
['sports.html','Sports'],
['podcasting.html','Podcasting'],
['tv.html','Universal TV'],
['yearbooks.html','Yearbooks'],
['records.html','Records'],
['studios.html','Studios'],
['spectrum-awards.html','Spectrum Awards'],
['crowspace.html','CrowSpace'],
['business.html','Business & Finance'],
['analytics.html','Analytics']
];

const groups = [
[
'OPERATIONS',
['index.html','notifications.html','activity.html']
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
['business.html','analytics.html']
]
];

const info = {
'index.html': [
'Executive overview of CrowRules Entertainment administration',
['Active Projects','—'],
['Members','—'],
['Dream Submissions','—'],
['System Health','—']
],

'notifications.html': [
'Alerts, approvals, reminders, and system notices',
['Unread','—'],
['Approvals','—'],
['Warnings','—'],
['Resolved','—']
],

'activity.html': [
'Recent administrative and platform activity',
['Today','—'],
['This Week','—'],
['Creators','—'],
['System','—']
],

'content.html': [
'Manage published and draft content',
['Published','—'],
['Drafts','—'],
['Review','—'],
['Archived','—']
],

'episodes.html': [
'Episode production and release control',
['In Production','—'],
['Scheduled','—'],
['Published','—'],
['Needs Review','—']
],

'shows.html': [
'Shows, series, seasons, and programming',
['Active Shows','—'],
['Seasons','—'],
['Episodes','—'],
['Coming Soon','—']
],

'media.html': [
'Media assets, artwork, video, and production files',
['Assets','—'],
['Video','—'],
['Images','—'],
['Audio','—']
],

'youtube.html': [
'YouTube publishing and channel operations',
['Subscribers','—'],
['Videos','—'],
['Scheduled','—'],
['Sync','—']
],

'live-events.html': [
'Live broadcasts and event control',
['Upcoming','—'],
['Live Now','—'],
['Past Events','—'],
['Crew','—']
],

'members.html': [
'Member accounts and community administration',
['Members','—'],
['Active','—'],
['New','—'],
['Pending','—']
],

'creators.html': [
'Creator profiles, submissions, and relationships',
['Creators','—'],
['Active','—'],
['Projects','—'],
['Pending','—']
],

'collaborators.html': [
'Writers, artists, filmmakers, designers, and partners',
['Collaborators','—'],
['Available','—'],
['Assigned','—'],
['Pending','—']
],

'staff.html': [
'Staff and volunteer administration',
['Team','—'],
['Volunteers','—'],
['Paid','—'],
['Open Roles','—']
],

'podcasters.html': [
'Podcaster applications and podcast operations',
['Applications','—'],
['Approved','—'],
['Pending','—'],
['Shows','—']
],

'dream-library.html': [
'The central CrowRules Dreamscapes idea library',
['Total Dreams','—'],
['New','—'],
['In Development','—'],
['Pitch Ready','—']
],

'dream-projects.html': [
'Projects developed from Dreamscapes submissions',
['Projects','—'],
['Writing','—'],
['Production','—'],
['Pitch Ready','—']
],

'creative-rooms.html': [
'Collaborative rooms for developing stories and worlds',
['Rooms','—'],
['Active','—'],
['Writers','—'],
['Open Tasks','—']
],

'agreements.html': [
'Creator rights, agreements, releases, and documentation',
['Agreements','—'],
['Drafts','—'],
['Signed','—'],
['Review','—']
],

'earnings.html': [
'Creator participation, revenue, and payout tracking',
['Creators Paid','—'],
['Pending','—'],
['Revenue Share','—'],
['Statements','—']
],

'pitch-room.html': [
'Internal pitch development and decision workflow',
['Pitches','—'],
['Review','—'],
['Shortlist','—'],
['Approved','—']
],

'sports.html': [
'CrowRules Sports operations and Pick Em administration',
['Leagues','—'],
['Games','—'],
['Pick Em','—'],
['Sync','—']
],

'podcasting.html': [
'Podcasting branch administration',
['Shows','—'],
['Episodes','—'],
['Applications','—'],
['Launch','2027']
],

'tv.html': [
'CrowRules Universal TV 24/7 network control',
['Channels','—'],
['On Air','—'],
['Scheduled','—'],
['Live Events','—']
],

'yearbooks.html': [
'Video school yearbook operations',
['Projects','—'],
['Schools','—'],
['Classes','—'],
['Launch','2029']
],

'records.html': [
'CrowRules Records administration',
['Artists','—'],
['Releases','—'],
['Tracks','—'],
['Launch','2031']
],

'studios.html': [
'CrowRules Studios production operations',
['Projects','—'],
['Stages','—'],
['Crew','—'],
['Launch','2031']
],

'spectrum-awards.html': [
'Spectrum Awards planning and administration',
['Nominations','—'],
['Categories','—'],
['Votes','—'],
['Launch','2029']
],

'crowspace.html': [
'CrowSpace social platform administration',
['Members','—'],
['Posts','—'],
['Groups','—'],
['Launch','2028']
],

'business.html': [
'Business, finance, sponsorships, donations, and campaigns',
['Sponsor Leads','—'],
['Campaigns','—'],
['Donations','—'],
['Pipeline','—']
],

'analytics.html': [
'Cross-platform analytics and performance reporting',
['Visitors','—'],
['Watch Time','—'],
['Creators','—'],
['Releases','—']
]
};

/* ---------------------------------------------------------
SUPABASE LOADER
--------------------------------------------------------- */

function loadSupabaseLibrary() {
return new Promise((resolve, reject) => {

```
if (window.supabase && typeof window.supabase.createClient === 'function') {
  resolve(window.supabase);
  return;
}

const existing = document.querySelector(
  'script[data-crowrules-supabase="true"]'
);

if (existing) {
  existing.addEventListener('load', () => resolve(window.supabase));
  existing.addEventListener('error', reject);
  return;
}

const script = document.createElement('script');

script.src = SUPABASE_CDN;
script.async = true;
script.dataset.crowrulesSupabase = 'true';

script.onload = () => {
  if (
    window.supabase &&
    typeof window.supabase.createClient === 'function'
  ) {
    resolve(window.supabase);
  } else {
    reject(
      new Error('Supabase JS loaded, but createClient is unavailable.')
    );
  }
};

script.onerror = () => {
  reject(new Error('Unable to load Supabase JS.'));
};

document.head.appendChild(script);
```

});
}

/* ---------------------------------------------------------
SUPABASE INITIALIZATION
--------------------------------------------------------- */

async function initializeSupabase() {

connectionState = 'loading';

updateConnectionIndicator();

if (!SUPABASE_PUBLISHABLE_KEY) {

```
connectionState = 'missing-key';

updateConnectionIndicator();

console.warn(
  '[CrowRules Admin] Supabase publishable key is missing.'
);

return false;
```

}

try {

```
const sdk = await loadSupabaseLibrary();

supabaseClient = sdk.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

const sessionResult =
  await supabaseClient.auth.getSession();

currentSession = sessionResult.data?.session || null;

currentUser = currentSession?.user || null;

if (sessionResult.error) {
  console.error(
    '[CrowRules Admin] Session error:',
    sessionResult.error
  );
}

supabaseClient.auth.onAuthStateChange(
  async (_event, session) => {

    currentSession = session || null;
    currentUser = session?.user || null;

    updateConnectionIndicator();

    if (currentUser) {
      await loadDashboardData();
    }
  }
);

connectionState = 'connected';

updateConnectionIndicator();

return true;
```

} catch (error) {

```
console.error(
  '[CrowRules Admin] Supabase initialization failed:',
  error
);

connectionState = 'error';

updateConnectionIndicator();

return false;
```

}
}

/* ---------------------------------------------------------
NAVIGATION
--------------------------------------------------------- */

function nav() {

const path =
location.pathname.split('/').pop() || 'index.html';

return ` <aside class="sidebar">

```
  <div class="brand">
    CROW<span>RULES</span> OS
  </div>

  <div class="connection-panel">
    <div class="connection-dot" id="connectionDot"></div>

    <div>
      <div class="connection-title">
        SUPABASE
      </div>

      <div
        class="connection-text"
        id="connectionText">
        Connecting...
      </div>
    </div>
  </div>

  ${
    groups.map(([group, items]) => `
      <div class="group">
        ${escapeHtml(group)}
      </div>

      ${
        items.map(file => {

          const page =
            pages.find(p => p[0] === file);

          return `
            <a
              class="nav ${file === path ? 'active' : ''}"
              href="${file}">
              ${escapeHtml(page ? page[1] : file)}
            </a>
          `;

        }).join('')
      }

    `).join('')
  }

  <div class="sidebar-footer">

    <button
      class="nav-action"
      onclick="configureSupabase()">
      Configure Supabase
    </button>

    ${
      currentUser
        ? `
          <button
            class="nav-action"
            onclick="signOutAdmin()">
            Sign Out
          </button>
        `
        : ''
    }

  </div>

</aside>
```

`;
}

/* ---------------------------------------------------------
PAGE RENDERING
--------------------------------------------------------- */

function render() {

const path =
location.pathname.split('/').pop() || 'index.html';

const d =
info[path] || info['index.html'];

document.body.insertAdjacentHTML(
'afterbegin',
nav()
);

const main =
document.querySelector('main');

if (!main) {
console.error(
'[CrowRules Admin] <main> element not found.'
);
return;
}

main.innerHTML = `

```
<div class="top">

  <div>

    <div class="eyebrow">
      CrowRules Entertainment • Admin
    </div>

    <h1 class="title">
      ${escapeHtml(d[0])}
    </h1>

    <div class="subtitle">
      Secure operational workspace for the
      CrowRules Entertainment universe.
      Supabase-powered administration with
      authentication, RLS, live data, and
      protected backend workflows.
    </div>

  </div>

  <div class="actions">
