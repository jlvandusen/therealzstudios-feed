/* The Real Z Studios - expansion cards for any website page.
   Usage (one HTML/embed block on the page):
     <div class="trzs-dlc" data-game="clash"></div>
     <script src="https://feed.therealzstudios.com/embed/dlc-cards.js" defer></script>
   data-game = the feed folder: "clash" (Clash of Crests) or "defy" (DEFY).
   Optional: data-show="dlc" (only expansions) | "all" (default: base game + expansions);
             data-status="available" | "soon" (only that status).
   Reads https://feed.therealzstudios.com/<game>/dlc.json - the same list the games read - so the website updates
   itself whenever a build refreshes the feed. Public data only; nothing is sent about the visitor. */
(function () {
  var FEED = "https://feed.therealzstudios.com/";
  var css = "" +
    ".trzs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;margin:10px 0}" +
    ".trzs-card{background:#16120d;border:1px solid #b8913f;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;" +
    "box-shadow:0 4px 18px rgba(0,0,0,.45);font-family:Georgia,'Times New Roman',serif;color:#efe6d2}" +
    ".trzs-art{position:relative;aspect-ratio:460/215;background:#0c0a07}" +
    ".trzs-art img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".trzs-badge{position:absolute;top:8px;left:8px;padding:3px 9px;border-radius:3px;font:600 11px/1.4 Arial,sans-serif;" +
    "letter-spacing:.08em;text-transform:uppercase}" +
    ".trzs-badge.av{background:#2f6b3a;color:#fff}.trzs-badge.soon{background:#b8913f;color:#16120d}" +
    ".trzs-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px;flex:1}" +
    ".trzs-title{font-family:'Cinzel',Georgia,serif;font-size:19px;font-weight:700;color:#e9c46a;margin:0;letter-spacing:.02em}" +
    ".trzs-blurb{font-size:14px;line-height:1.5;color:#d9cdb4;margin:0;flex:1}" +
    ".trzs-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}" +
    ".trzs-price{font:600 15px Arial,sans-serif;color:#e9c46a}" +
    ".trzs-btn{display:inline-block;padding:8px 14px;border:1px solid #e9c46a;border-radius:4px;color:#16120d;background:#e9c46a;" +
    "font:700 13px Arial,sans-serif;text-decoration:none;letter-spacing:.03em}" +
    ".trzs-btn:hover{background:#f4d98d}" +
    ".trzs-btn.off{background:transparent;color:#b8913f;border-color:#6d5a33;cursor:default}" +
    ".trzs-msg{color:#b8913f;font-family:Georgia,serif}";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;   // text only: feed content is never inserted as HTML
    return e;
  }

  function safeUrl(u) {
    return typeof u === "string" && /^https?:\/\//i.test(u) ? u.replace(/^http:\/\/feed\./i, "https://feed.") : null;
  }

  function card(p) {
    var soon = (p.status || "").toLowerCase() === "soon";
    var c = el("div", "trzs-card");
    var art = el("div", "trzs-art");
    var src = safeUrl(p.card) || safeUrl(p.header);
    if (src) { var img = el("img"); img.src = src; img.alt = p.title || ""; img.loading = "lazy"; art.appendChild(img); }
    art.appendChild(el("span", "trzs-badge " + (soon ? "soon" : "av"), soon ? "Coming soon" : "Available"));
    c.appendChild(art);
    var body = el("div", "trzs-body");
    body.appendChild(el("h3", "trzs-title", p.title || ""));
    body.appendChild(el("p", "trzs-blurb", p.blurb || ""));
    var row = el("div", "trzs-row");
    row.appendChild(el("span", "trzs-price", soon ? "" : (p.price || "")));
    var link = safeUrl(p.storeUrl);
    var a;
    if (link) {
      a = el("a", "trzs-btn", soon ? "Wishlist on Steam" : (p.kind === "base" ? "Buy on Steam" : "Get it on Steam"));
      a.href = link; a.target = "_blank"; a.rel = "noopener";
    } else {
      a = el("span", "trzs-btn off", "Coming soon");
    }
    row.appendChild(a);
    body.appendChild(row);
    c.appendChild(body);
    return c;
  }

  function render(host) {
    var game = (host.getAttribute("data-game") || "clash").replace(/[^a-z0-9_-]/gi, "");
    var show = (host.getAttribute("data-show") || "all").toLowerCase();
    var only = (host.getAttribute("data-status") || "").toLowerCase();
    host.textContent = "";
    var msg = el("p", "trzs-msg", "Loading expansions...");
    host.appendChild(msg);
    fetch(FEED + game + "/dlc.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (feed) {
        var g = (feed.games || [])[0] || {};
        var items = (g.products || []).filter(function (p) {
          if (show === "dlc" && p.kind === "base") return false;
          if (only && (p.status || "available").toLowerCase() !== only) return false;
          return true;
        });
        host.textContent = "";
        var grid = el("div", "trzs-grid");
        items.forEach(function (p) { grid.appendChild(card(p)); });
        host.appendChild(grid);
      })
      .catch(function () { msg.textContent = "Expansions are listed on our Steam page."; });
  }

  function init() {
    if (!document.getElementById("trzs-dlc-css")) {
      var s = el("style"); s.id = "trzs-dlc-css"; s.textContent = css; document.head.appendChild(s);
    }
    var hosts = document.querySelectorAll(".trzs-dlc");
    for (var i = 0; i < hosts.length; i++) render(hosts[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
