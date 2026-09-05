(function () {
  var C = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function telHref(p) { return "tel:" + String(p || "").replace(/[^+0-9]/g, ""); }

  function load() {
    return fetch("/api/content", { headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return fetch("content.json").then(function (r) { return r.json(); }); });
  }

  /* ---------- vykreslení ---------- */

  function renderHome() {
    el("heroImg").src = C.hero.image;
    el("heroTitle").textContent = C.hero.title;
    el("heroText").textContent = C.hero.text;
    el("heroStats").innerHTML = (C.hero.stats || []).map(function (s) {
      return "<div><b>" + esc(s.value) + "</b>" + esc(s.label) + "</div>";
    }).join("");

    el("homeSvcTitle").textContent = C.home.servicesTitle;
    el("homeTiles").innerHTML = (C.services || []).slice(0, 3).map(function (s) {
      return '<a class="tile" href="#/sluzby"><img src="' + esc(s.image) + '" alt="' + esc(s.name) + '">' +
        '<div class="cap"><h3>' + esc(s.name) + "</h3><p>" + esc(s.summary) + '</p><p class="pr">' + esc(s.price) + "</p></div></a>";
    }).join("");

    el("homeWorksTitle").textContent = C.home.worksTitle;
    el("homeWorksText").textContent = C.home.worksText;
    el("homeStrip").innerHTML = (C.albums || []).slice(0, 4).map(function (a) {
      return '<a href="#/album/' + esc(a.id) + '"><img src="' + esc(a.photos[0]) + '" alt="' + esc(a.title) + '" loading="lazy"></a>';
    }).join("");

    el("homeCtaTitle").textContent = C.home.ctaTitle;
    el("homeCtaText").textContent = C.home.ctaText;
  }

  function renderServices() {
    el("svcList").innerHTML = (C.services || []).map(function (s) {
      var p = String(s.price || "").replace(/^od\s*/i, "").replace(/\s*Kč\s*$/i, "");
      return '<div class="svc"><button class="svc-btn"><div><h3>' + esc(s.name) + ' <span class="chev">▾</span></h3>' +
        '<p class="svc-sub">' + esc(s.summary) + "</p></div>" +
        '<div class="price"><span class="from">od</span><span class="val">' + esc(p) + '</span><span class="cur">Kč</span></div></button>' +
        '<div class="svc-body"><ul>' + (s.items || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
        (s.image ? '<img src="' + esc(s.image) + '" alt="' + esc(s.name) + '" loading="lazy">' : "") + "</div></div>";
    }).join("");
    el("svcNote").textContent = C.priceNote || "";
    Array.prototype.forEach.call(document.querySelectorAll(".svc-btn"), function (b) {
      b.addEventListener("click", function () { b.parentElement.classList.toggle("open"); });
    });
  }

  function renderPrices() {
    var groups = C.priceGroups || [];
    el("priceTabs").innerHTML = groups.map(function (g, i) {
      return '<button data-i="' + i + '"' + (i === 0 ? ' class="on"' : "") + ">" + esc(g.title) + "</button>";
    }).join("");
    function show(i) {
      var g = groups[i] || { items: [] };
      el("priceList").innerHTML = (g.items || []).map(function (it) {
        return '<div class="prow"><b>' + esc(it.name) + "</b><span>" + esc(it.price) + "</span></div>";
      }).join("");
      Array.prototype.forEach.call(el("priceTabs").children, function (b, j) {
        b.classList.toggle("on", i === j);
      });
    }
    Array.prototype.forEach.call(el("priceTabs").children, function (b) {
      b.addEventListener("click", function () { show(+b.dataset.i); });
    });
    show(0);
    el("priceNote").textContent = C.priceNote || "";

    el("pkgs").innerHTML = (C.packages || []).map(function (p) {
      return '<div class="pkg"><div class="top"><h3>' + esc(p.name) + "</h3><strong>" + esc(p.price) + "</strong></div>" +
        "<ul>" + (p.items || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
  }

  function renderAlbums() {
    el("albumGrid").innerHTML = (C.albums || []).map(function (a) {
      var n = (a.photos || []).length;
      return '<a class="album" href="#/album/' + esc(a.id) + '">' +
        '<img src="' + esc(a.photos[0]) + '" alt="' + esc(a.title) + '" loading="lazy">' +
        (n > 1 ? '<span class="count">' + n + " fotek</span>" : "") +
        '<div class="cap"><h3>' + esc(a.title) + "</h3><p>" + esc(a.service) + "</p></div></a>";
    }).join("");
  }

  function renderAlbum(id) {
    var a = (C.albums || []).filter(function (x) { return x.id === id; })[0];
    if (!a) { location.hash = "#/prace"; return; }
    el("albService").textContent = a.service || "";
    el("albTitle").textContent = a.title || "";
    el("albDesc").textContent = a.description || "";
    el("albShots").innerHTML = (a.photos || []).map(function (p) {
      return '<img src="' + esc(p) + '" alt="' + esc(a.title) + '" loading="lazy">';
    }).join("");
    Array.prototype.forEach.call(el("albShots").children, function (img) {
      img.addEventListener("click", function () {
        var lb = el("lb");
        lb.querySelector("img").src = img.src;
        lb.classList.add("on");
      });
    });
  }

  function renderContact() {
    var s = C.site;
    var rows = [["Telefon", s.phone], ["Adresa", s.address], ["Otevřeno", s.hours]];
    if (s.email) rows.push(["E-mail", s.email]);
    rows.push(["Firma", s.company + " — IČO " + s.ico]);
    el("contactInfo").innerHTML = rows.map(function (r) {
      return '<div class="info-row"><small>' + esc(r[0]) + "</small><b>" + esc(r[1]) + "</b></div>";
    }).join("");
    el("mapBox").innerHTML = '<iframe title="Mapa" loading="lazy" src="https://www.google.com/maps?q=' +
      encodeURIComponent(s.address) + '&output=embed"></iframe>';

    var sel = el("f4");
    sel.innerHTML = ['<option>Nevím, poraďte mi</option>']
      .concat((C.services || []).map(function (x) { return "<option>" + esc(x.name) + "</option>"; }))
      .concat((C.packages || []).map(function (x) { return "<option>Balíček " + esc(x.name) + "</option>"; }))
      .join("");
  }

  function renderFooter() {
    var s = C.site;
    el("fTagline").textContent = s.tagline;
    el("fAddress").textContent = s.address;
    el("fPhone").textContent = s.phone;
    el("fLegal").textContent = "© " + new Date().getFullYear() + " " + s.name + " · IČO " + s.ico;
    Array.prototype.forEach.call(document.querySelectorAll("[data-tel]"), function (a) {
      a.href = telHref(s.phone);
      if (!a.textContent.trim()) a.textContent = s.phone;
    });
  }

  /* ---------- poptávka ---------- */

  function bindForm() {
    var form = el("inqForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = el("inqMsg");
      var btn = form.querySelector("button[type=submit]");
      msg.className = "";
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = "Odesílám…";
      var fd = new FormData(form);
      fetch("/api/inquiry", { method: "POST", body: fd })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.error || "Nepodařilo se odeslat.");
          msg.className = "msg ok";
          msg.textContent = "Poptávka odeslána. Ozveme se co nejdřív.";
          form.reset();
        })
        .catch(function (err) {
          msg.className = "msg err";
          msg.textContent = err.message + " Zavolejte prosím na " + C.site.phone + ".";
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = "Odeslat poptávku";
        });
    });
  }

  /* ---------- router ---------- */

  function route() {
    var h = (location.hash || "#/").slice(1);
    var alb = h.indexOf("/album/") === 0 ? h.slice(7) : null;
    var key = alb ? "/album" : h;
    var found = false;
    Array.prototype.forEach.call(document.querySelectorAll(".page"), function (p) {
      var on = p.dataset.page === key;
      p.classList.toggle("on", on);
      if (on) found = true;
    });
    if (!found) document.querySelector('.page[data-page="/"]').classList.add("on");
    if (alb) renderAlbum(alb);
    Array.prototype.forEach.call(document.querySelectorAll(".nav-links a"), function (a) {
      a.classList.toggle("on", a.getAttribute("href") === "#" + h);
    });
    el("menu").classList.remove("open");
    window.scrollTo(0, 0);
  }

  /* ---------- start ---------- */

  load().then(function (data) {
    C = data;
    renderFooter();
    renderHome();
    renderServices();
    renderPrices();
    renderAlbums();
    renderContact();
    bindForm();
    route();
    window.addEventListener("hashchange", route);
  });

  el("burger").addEventListener("click", function () {
    var o = el("menu").classList.toggle("open");
    this.setAttribute("aria-expanded", o);
  });
  var lb = el("lb");
  lb.addEventListener("click", function () { lb.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("on"); });
})();
