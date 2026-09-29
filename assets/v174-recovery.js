/* CrowRules V174 — Recovery Stability Alerts & Escalation */
(function () {
  "use strict";
  const C = window.CROW_CONFIG || {};
  const url = C.supabaseUrl || window.SUPABASE_URL;
  const key = C.supabaseKey || window.SUPABASE_KEY;
  let client = null;

  async function loadClient() {
    if (client) return client;
    if (!url || !key || !window.supabase?.createClient) throw new Error("Supabase configuration unavailable.");
    client = window.supabase.createClient(url, key);
    return client;
  }

  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const statusClass = s => "v174-" + String(s || "stable").toLowerCase();

  async function snapshot() {
    const db = await loadClient();
    const { data: services, error } = await db.from("system_service_status").select("*").order("service_name");
    if (error) throw error;
    const { data: incidents } = await db.from("system_incidents").select("*").in("status", ["open","acknowledged","recovering"]).order("last_detected_at", {ascending:false}).limit(50);
    return { services: services || [], incidents: incidents || [] };
  }

  function render(state) {
    const services = state.services;
    const incidents = state.incidents;
    const critical = services.filter(x => x.status === "critical").length;
    const degraded = services.filter(x => x.status === "degraded").length;
    const watch = services.filter(x => x.status === "watch").length;
    const stable = services.filter(x => x.status === "stable").length;
    document.querySelector("#v174-stable").textContent = stable;
    document.querySelector("#v174-watch").textContent = watch;
    document.querySelector("#v174-degraded").textContent = degraded;
    document.querySelector("#v174-critical").textContent = critical;
    document.querySelector("#v174-incidents").textContent = incidents.length;
    document.querySelector("#v174-services").innerHTML = services.map(s =>
      '<tr><td><span class="v174-pill '+statusClass(s.status)+'">'+esc(s.status)+'</span></td><td>'+esc(s.service_name)+'</td><td>'+esc(s.error_count)+'</td><td>'+esc(s.last_message || "No active error")+'</td><td>'+esc(s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : "Never")+'</td></tr>'
    ).join("") || '<tr><td colspan="5">No services registered.</td></tr>';
    document.querySelector("#v174-incidents-list").innerHTML = incidents.map(i =>
      '<tr><td>'+esc(i.incident_key)+'</td><td>'+esc(i.title)+'</td><td><span class="v174-pill '+statusClass(i.severity)+'">'+esc(i.severity)+'</span></td><td>'+esc(i.status)+'</td><td>'+esc(i.occurrence_count)+'</td><td>'+esc(i.last_detected_at ? new Date(i.last_detected_at).toLocaleString() : "")+'</td></tr>'
    ).join("") || '<tr><td colspan="6">No active incidents.</td></tr>';
  }

  async function refresh() {
    const box = document.querySelector("#v174-message");
    try {
      box.textContent = "Refreshing recovery telemetry…";
      render(await snapshot());
      box.textContent = "Recovery telemetry synchronized.";
      box.className = "v174-message ok";
    } catch (e) {
      box.textContent = "Telemetry unavailable: " + (e.message || e);
      box.className = "v174-message bad";
    }
  }

  window.CrowRulesV174 = { refresh, snapshot };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#v174-refresh")?.addEventListener("click", refresh);
    refresh();
  });
})();