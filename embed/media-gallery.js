/* The Real Z Studios - media gallery (trailers, teasers, screenshots) for any website page.
   Usage (one HTML/embed block on the page):
     <div class="trzs-media" data-game="clash"></div>
     <script src="https://feed.therealzstudios.com/embed/media-gallery.js" defer></script>
   data-game     = the feed folder: "clash" (Clash of Crests) or "defy" (DEFY).
   Optional:
     data-section  = section ids to show, comma separated, in that order (default: all), e.g. "trailers,screenshots".
                     Clash sections: trailers, teasers, screenshots, expansions, sable_cross, camelot, highseas, wildmarches.
     data-status   = "available" | "soon" (only sections with that status - "soon" makes a Coming Soon teaser block).
     data-titles   = "off" hides the section headings.
     data-limit    = show at most N items per section.
     data-columns  = minimum tile width in px (default 260; use 400 for big tiles).
   Reads https://feed.therealzstudios.com/<game>/media.json, which each release refreshes, so the page updates itself.
   Click a tile for the full-size picture or the trailer; arrows / swipe step through; Esc closes.
   Public data only; nothing is sent about the visitor (YouTube items, if any, use youtube-nocookie.com). */
(function () {
  var FEED = "https://feed.therealzstudios.com/";
  var css = "" +
    ".trzs-msec{margin:0 0 28px}" +
    ".trzs-mh{font-family:'Cinzel',Georgia,serif;color:#e9c46a;font-size:22px;font-weight:700;letter-spacing:.03em;" +
    "margin:0 0 12px;display:flex;align-items:center;gap:10px}" +
    ".trzs-msoon{font:600 11px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#b8913f;" +
    "color:#16120d;padding:3px 9px;border-radius:3px}" +
    ".trzs-mgrid{display:grid;gap:14px}" +
    ".trzs-tile{position:relative;aspect-ratio:16/9;background:#0c0a07;border:1px solid #6d5a33;border-radius:5px;" +
    "overflow:hidden;cursor:pointer;padding:0;display:block;width:100%}" +
    ".trzs-tile:hover,.trzs-tile:focus-visible{border-color:#e9c46a;outline:none}" +
    ".trzs-tile img,.trzs-tile video{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}" +
    ".trzs-tile:hover img,.trzs-tile:hover video{transform:scale(1.04)}" +
    ".trzs-cap{position:absolute;left:0;right:0;bottom:0;padding:18px 10px 7px;font:14px Georgia,serif;color:#efe6d2;" +
    "text-align:left;background:linear-gradient(transparent,rgba(0,0,0,.8))}" +
    ".trzs-play{position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;" +
    "background:rgba(22,18,13,.75);border:2px solid #e9c46a}" +
    ".trzs-play:after{content:'';position:absolute;left:24px;top:18px;border-style:solid;border-width:13px 0 13px 21px;" +
    "border-color:transparent transparent transparent #e9c46a}" +
    ".trzs-lb{position:fixed;inset:0;z-index:2147483000;background:rgba(8,6,4,.94);display:flex;flex-direction:column;" +
    "align-items:center;justify-content:center;padding:16px}" +
    ".trzs-lb-stage{max-width:min(1600px,100%);max-height:calc(100vh - 110px);display:flex;align-items:center;justify-content:center}" +
    ".trzs-lb-stage img,.trzs-lb-stage video{max-width:100%;max-height:calc(100vh - 110px);display:block;border:1px solid #6d5a33}" +
    ".trzs-lb-stage iframe{width:min(1280px,92vw);aspect-ratio:16/9;border:0}" +
    ".trzs-lb-cap{color:#e9c46a;font:17px Georgia,serif;margin-top:12px;text-align:center}" +
    ".trzs-lb button{position:absolute;background:rgba(22,18,13,.8);color:#e9c46a;border:1px solid #b8913f;border-radius:4px;" +
    "font:700 22px Arial,sans-serif;width:46px;height:46px;cursor:pointer}" +
    ".trzs-lb button:hover{background:#e9c46a;color:#16120d}" +
    ".trzs-lb-x{top:14px;right:14px}.trzs-lb-p{left:14px;top:50%}.trzs-lb-n{right:14px;top:50%}" +
    ".trzs-mmsg{color:#b8913f;font-family:Georgia,serif}";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;   // text only: feed content is never inserted as HTML
    return e;
  }

  function feedUrl(u) {   // media must come from our feed
    return typeof u === "string" && u.indexOf(FEED) === 0 ? u : null;
  }

  function ytId(id) {
    return typeof id === "string" && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  }

  // ---- lightbox -------------------------------------------------------------------------------------------------
  var lb = null, list = [], at = 0, touchX = null;

  function closeLb() {
    if (!lb) return;
    document.removeEventListener("keydown", onKey);
    lb.parentNode.removeChild(lb);
    lb = null;
    document.documentElement.style.overflow = "";
  }

  function onKey(e) {
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowRight") show(at + 1);
    else if (e.key === "ArrowLeft") show(at - 1);
  }

  function show(i) {
    at = (i + list.length) % list.length;
    var it = list[at], stage = lb.querySelector(".trzs-lb-stage");
    stage.textContent = "";
    if (it.type === "image") {
      var img = el("img"); img.src = feedUrl(it.src); img.alt = it.caption || ""; stage.appendChild(img);
    } else if (it.type === "youtube") {
      var f = el("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + ytId(it.youtube) + "?autoplay=1&rel=0";
      f.allow = "autoplay; encrypted-media; fullscreen"; f.allowFullscreen = true; f.title = it.caption || "Video";
      stage.appendChild(f);
    } else {
      var v = el("video"); v.src = feedUrl(it.src); v.poster = feedUrl(it.poster) || "";
      v.controls = true; v.autoplay = true; v.playsInline = true;
      if (it.type === "loop") { v.loop = true; v.muted = true; }
      stage.appendChild(v);
    }
    lb.querySelector(".trzs-lb-cap").textContent = it.caption || "";
    var many = list.length > 1;
    lb.querySelector(".trzs-lb-p").style.display = many ? "" : "none";
    lb.querySelector(".trzs-lb-n").style.display = many ? "" : "none";
  }

  function openLb(items, i) {
    closeLb();
    list = items;
    lb = el("div", "trzs-lb");
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.appendChild(el("div", "trzs-lb-stage"));
    lb.appendChild(el("div", "trzs-lb-cap"));
    var x = el("button", "trzs-lb-x", "×"), p = el("button", "trzs-lb-p", "‹"), n = el("button", "trzs-lb-n", "›");
    x.setAttribute("aria-label", "Close"); p.setAttribute("aria-label", "Previous"); n.setAttribute("aria-label", "Next");
    x.onclick = closeLb; p.onclick = function () { show(at - 1); }; n.onclick = function () { show(at + 1); };
    lb.appendChild(x); lb.appendChild(p); lb.appendChild(n);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
    document.documentElement.style.overflow = "hidden";
    show(i);
    x.focus();
  }

  // ---- tiles ----------------------------------------------------------------------------------------------------
  function tile(it, items, i) {
    var b = el("button", "trzs-tile");
    b.type = "button";
    b.setAttribute("aria-label", it.caption || "Open");
    if (it.type === "loop" && feedUrl(it.src)) {
      var v = el("video"); v.src = feedUrl(it.src); v.poster = feedUrl(it.poster) || "";
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", "");
      b.appendChild(v);
    } else {
      var src = it.type === "image" ? feedUrl(it.thumb) || feedUrl(it.src)
              : it.type === "youtube" ? "https://i.ytimg.com/vi/" + ytId(it.youtube) + "/hqdefault.jpg"
              : feedUrl(it.poster);
      if (src) { var img = el("img"); img.src = src; img.alt = it.caption || ""; img.loading = "lazy"; b.appendChild(img); }
      if (it.type === "video" || it.type === "youtube") b.appendChild(el("span", "trzs-play"));
    }
    if (it.caption) b.appendChild(el("span", "trzs-cap", it.caption));
    b.onclick = function () { openLb(items, i); };
    return b;
  }

  function render(host) {
    var game = (host.getAttribute("data-game") || "clash").replace(/[^a-z0-9_-]/gi, "");
    var want = (host.getAttribute("data-section") || "").toLowerCase().split(",").map(function (s) { return s.trim(); })
      .filter(Boolean);
    var only = (host.getAttribute("data-status") || "").toLowerCase();
    var titles = (host.getAttribute("data-titles") || "on").toLowerCase() !== "off";
    var limit = parseInt(host.getAttribute("data-limit"), 10) || 0;
    var col = Math.max(140, parseInt(host.getAttribute("data-columns"), 10) || 260);
    host.textContent = "";
    var msg = el("p", "trzs-mmsg", "Loading media...");
    host.appendChild(msg);
    fetch(FEED + game + "/media.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (doc) {
        var secs = doc.sections || [];
        if (want.length) secs = want.map(function (id) { return secs.filter(function (s) { return s.id === id; })[0]; })
          .filter(Boolean);
        if (only) secs = secs.filter(function (s) { return (s.status || "available").toLowerCase() === only; });
        host.textContent = "";
        secs.forEach(function (s) {
          var items = (s.items || []).filter(function (it) {
            return it.type === "youtube" ? ytId(it.youtube) : feedUrl(it.src);
          });
          if (limit) items = items.slice(0, limit);
          if (!items.length) return;
          var sec = el("section", "trzs-msec");
          if (titles) {
            var h = el("h3", "trzs-mh", s.title || "");
            if ((s.status || "").toLowerCase() === "soon") h.appendChild(el("span", "trzs-msoon", "Coming soon"));
            sec.appendChild(h);
          }
          var grid = el("div", "trzs-mgrid");
          grid.style.gridTemplateColumns = "repeat(auto-fill,minmax(" + col + "px,1fr))";
          items.forEach(function (it, i) { grid.appendChild(tile(it, items, i)); });
          sec.appendChild(grid);
          host.appendChild(sec);
        });
      })
      .catch(function () { msg.textContent = "Screenshots and trailers are on our Steam page."; });
  }

  function init() {
    if (!document.getElementById("trzs-media-css")) {
      var s = el("style"); s.id = "trzs-media-css"; s.textContent = css; document.head.appendChild(s);
    }
    var hosts = document.querySelectorAll(".trzs-media");
    for (var i = 0; i < hosts.length; i++) render(hosts[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
