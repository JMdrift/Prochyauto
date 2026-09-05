(function () {
  var C = null, TAB = "uvod", DIRTY = false;

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }
  function set(path, v) {
    var ks = path.split("."), last = ks.pop();
    var o = ks.reduce(function (a, k) { return a[k]; }, C);
    o[last] = v;
    dirty();
  }
  function dirty() {
    DIRTY = true;
    el("status").textContent = "Neuložené změny";
  }
  function slug(s) {
    return String(s).toLowerCase()
      .replace(/[áàâä]/g, "a").replace(/[éěèêë]/g, "e").replace(/[íìîï]/g, "i")
      .replace(/[óòôö]/g, "o").replace(/[úůùûü]/g, "u").replace(/[ý]/g, "y")
      .replace(/[č]/g, "c").replace(/[ď]/g, "d").replace(/[ň]/g, "n").replace(/[ř]/g, "r")
      .replace(/[š]/g, "s").replace(/[ť]/g, "t").replace(/[ž]/g, "z")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || ("album-" + Date.now());
  }

  /* ---------- ovládací prvky ---------- */

  function txt(label, path, ph) {
    return '<label>' + esc(label) + '</label><input data-p="' + path + '" value="' + esc(get(path)) + '" placeholder="' + esc(ph || "") + '">';
  }
  function area(label, path) {
    return '<label>' + esc(label) + '</label><textarea data-p="' + path + '" style="min-height:80px">' + esc(get(path)) + "</textarea>";
  }
  function lines(label, path) {
    return '<label>' + esc(label) + ' <span style="opacity:.7">(každá položka na nový řádek)</span></label>' +
      '<textarea data-lines="' + path + '" style="min-height:110px">' + esc((get(path) || []).join("\n")) + "</textarea>";
  }
  function photo(label, path) {
    var v = get(path);
    return '<label>' + esc(label) + "</label><div class=\"pick\">" +
      '<img src="' + esc(v) + '" alt="">' +
      '<button class="btn btn-ghost" data-act="pick" data-p="' + path + '">Změnit fotku</button></div>';
  }

  /* ---------- panely ---------- */

  var TABS = [
    ["uvod", "Úvod"], ["sluzby", "Služby"], ["cenik", "Ceník"],
    ["balicky", "Balíčky"], ["prace", "Naše práce"], ["kontakt", "Kontakt"], ["poptavky", "Poptávky"]
  ];

  function panelUvod() {
    return '<div class="card"><h3>Hlavní fotka a nadpis</h3>' +
      photo("Fotka na úvodu", "hero.image") +
      txt("Nadpis", "hero.title") + area("Podtitulek", "hero.text") + "</div>" +
      '<div class="card"><h3>Tři údaje pod nadpisem</h3>' +
      (C.hero.stats || []).map(function (s, i) {
        return '<div class="row2">' + txt("Hodnota", "hero.stats." + i + ".value") + txt("Popis", "hero.stats." + i + ".label") + "</div>";
      }).join("") + "</div>" +
      '<div class="card"><h3>Texty na úvodní stránce</h3>' +
      txt("Nadpis nad službami", "home.servicesTitle") +
      txt("Nadpis nad ukázkami", "home.worksTitle") + area("Text pod ním", "home.worksText") +
      txt("Nadpis výzvy dole", "home.ctaTitle") + area("Text výzvy", "home.ctaText") + "</div>";
  }

  function panelSluzby() {
    return (C.services || []).map(function (s, i) {
      return '<div class="card"><h3>' + esc(s.name || "Služba") + "</h3>" +
        '<div class="row2">' + txt("Název", "services." + i + ".name") + txt("Cena", "services." + i + ".price") + "</div>" +
        txt("Krátký popis", "services." + i + ".summary") +
        lines("Co je v ceně", "services." + i + ".items") +
        photo("Fotka služby", "services." + i + ".image") +
        '<div style="margin-top:14px"><button class="del" data-act="rm" data-p="services" data-i="' + i + '">Odebrat službu</button></div></div>';
    }).join("") +
      '<div class="card"><button class="btn btn-ghost" data-act="addService">Přidat službu</button></div>';
  }

  function panelCenik() {
    return (C.priceGroups || []).map(function (g, gi) {
      return '<div class="card">' + txt("Kategorie", "priceGroups." + gi + ".title") +
        (g.items || []).map(function (it, ii) {
          return '<div class="row2" style="margin-top:10px">' +
            txt("Položka", "priceGroups." + gi + ".items." + ii + ".name") +
            txt("Cena", "priceGroups." + gi + ".items." + ii + ".price") +
            '</div><div style="margin-top:6px"><button class="del" data-act="rm" data-p="priceGroups.' + gi + '.items" data-i="' + ii + '">Odebrat položku</button></div>';
        }).join("") +
        '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-ghost" data-act="addItem" data-i="' + gi + '">Přidat položku</button>' +
        '<button class="del" data-act="rm" data-p="priceGroups" data-i="' + gi + '">Odebrat kategorii</button></div></div>';
    }).join("") +
      '<div class="card"><button class="btn btn-ghost" data-act="addGroup">Přidat kategorii</button></div>' +
      '<div class="card"><h3>Poznámka pod ceníkem</h3>' + area("Text", "priceNote") + "</div>";
  }

  function panelBalicky() {
    return (C.packages || []).map(function (p, i) {
      return '<div class="card"><h3>' + esc(p.name || "Balíček") + "</h3>" +
        '<div class="row2">' + txt("Název", "packages." + i + ".name") + txt("Cena", "packages." + i + ".price") + "</div>" +
        lines("Co balíček obsahuje", "packages." + i + ".items") +
        '<div style="margin-top:14px"><button class="del" data-act="rm" data-p="packages" data-i="' + i + '">Odebrat balíček</button></div></div>';
    }).join("") +
      '<div class="card"><button class="btn btn-ghost" data-act="addPackage">Přidat balíček</button></div>';
  }

  function panelPrace() {
    return (C.albums || []).map(function (a, i) {
      return '<div class="card"><h3>' + esc(a.title || "Nové auto") + "</h3>" +
        '<div class="row2">' + txt("Auto", "albums." + i + ".title") + txt("Co se dělalo", "albums." + i + ".service") + "</div>" +
        area("Krátký popis", "albums." + i + ".description") +
        '<label>Fotky (' + (a.photos || []).length + ")</label>" +
        '<div class="mini">' + (a.photos || []).map(function (p, pi) {
          return '<figure><img src="' + esc(p) + '" alt=""><button data-act="rmPhoto" data-i="' + i + '" data-j="' + pi + '" title="Odebrat">✕</button></figure>';
        }).join("") + "</div>" +
        '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-ghost" data-act="addPhotos" data-i="' + i + '">Přidat fotky</button>' +
        '<button class="del" data-act="rm" data-p="albums" data-i="' + i + '">Odebrat auto</button></div></div>';
    }).join("") +
      '<div class="card"><button class="btn btn-ghost" data-act="addAlbum">Přidat auto</button>' +
      '<p class="hint" style="margin-top:10px">Každé auto je jedno album — nadpis, popis a několik fotek.</p></div>';
  }

  function panelKontakt() {
    return '<div class="card"><h3>Kontaktní údaje</h3>' +
      '<div class="row2">' + txt("Telefon", "site.phone") + txt("E-mail", "site.email", "nepovinné") + "</div>" +
      txt("Adresa", "site.address") + txt("Otevírací doba", "site.hours") +
      '<div class="row2">' + txt("Firma", "site.company") + txt("IČO", "site.ico") + "</div>" +
      txt("Věta v patičce", "site.tagline") + "</div>";
  }

  function panelPoptavky() {
    return '<div class="card"><h3>Nové poptávky</h3><div id="inqBox"><p class="hint">Načítám…</p></div></div>';
  }

  function render() {
    el("tabs").innerHTML = TABS.map(function (t) {
      return '<button data-tab="' + t[0] + '"' + (t[0] === TAB ? ' class="on"' : "") + ">" + t[1] + "</button>";
    }).join("");
    var html = { uvod: panelUvod, sluzby: panelSluzby, cenik: panelCenik, balicky: panelBalicky, prace: panelPrace, kontakt: panelKontakt, poptavky: panelPoptavky }[TAB]();
    el("panel").innerHTML = html;
    if (TAB === "poptavky") loadInquiries();
  }

  /* ---------- poptávky ---------- */

  function loadInquiries() {
    fetch("/api/inquiries").then(function (r) { return r.json(); }).then(function (list) {
      var box = el("inqBox");
      if (!list.length) { box.innerHTML = '<p class="hint">Zatím tu není žádná nová poptávka.</p>'; return; }
      box.innerHTML = list.map(function (q) {
        return '<div class="inq"><b>' + esc(q.name) + "</b> — " + esc(q.service) +
          "<p>" + esc(q.message || "") + "</p>" +
          (q.photo ? '<a href="' + esc(q.photo) + '" target="_blank" rel="noreferrer"><img src="' + esc(q.photo) + '" alt="" style="width:130px;margin-top:10px"></a>' : "") +
          '<div class="cts"><a href="tel:' + esc(q.phone) + '">' + esc(q.phone) + "</a>" +
          (q.email ? '<a href="mailto:' + esc(q.email) + '">' + esc(q.email) + "</a>" : "") + "</div>" +
          '<div style="margin-top:10px"><button class="del" data-act="doneInq" data-id="' + q.id + '">Označit jako vyřízené</button></div></div>';
      }).join("");
    }).catch(function () {
      el("inqBox").innerHTML = '<p class="hint">Poptávky se nepodařilo načíst.</p>';
    });
  }

  /* ---------- nahrávání fotek ---------- */

  function upload(file) {
    var fd = new FormData();
    fd.append("photo", file);
    return fetch("/api/upload", { method: "POST", body: fd })
      .then(function (r) { if (!r.ok) throw new Error("Nahrání selhalo"); return r.json(); })
      .then(function (j) { return j.url; });
  }

  function pickOne(path) {
    var inp = el("picker");
    inp.value = "";
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      el("status").textContent = "Nahrávám fotku…";
      upload(f).then(function (url) {
        set(path, url);
        render();
        el("status").textContent = "Fotka nahrána — nezapomeňte uložit";
      }).catch(function (e) { el("status").textContent = e.message; });
    };
    inp.click();
  }

  function pickMany(albumIndex) {
    var inp = el("pickerMulti");
    inp.value = "";
    inp.onchange = function () {
      var files = Array.prototype.slice.call(inp.files);
      if (!files.length) return;
      el("status").textContent = "Nahrávám " + files.length + " fotek…";
      files.reduce(function (chain, f) {
        return chain.then(function () {
          return upload(f).then(function (url) { C.albums[albumIndex].photos.push(url); });
        });
      }, Promise.resolve()).then(function () {
        dirty();
        render();
        el("status").textContent = "Fotky nahrány — nezapomeňte uložit";
      }).catch(function (e) { el("status").textContent = e.message; });
    };
    inp.click();
  }

  /* ---------- události ---------- */

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.p) set(t.dataset.p, t.value);
    else if (t.dataset.lines) set(t.dataset.lines, t.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean));
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.tab) { TAB = b.dataset.tab; render(); return; }
    var a = b.dataset.act;
    if (!a) return;
    e.preventDefault();

    if (a === "pick") pickOne(b.dataset.p);
    else if (a === "addPhotos") pickMany(+b.dataset.i);
    else if (a === "rmPhoto") { C.albums[+b.dataset.i].photos.splice(+b.dataset.j, 1); dirty(); render(); }
    else if (a === "rm") {
      if (!confirm("Opravdu odebrat?")) return;
      get(b.dataset.p).splice(+b.dataset.i, 1);
      dirty(); render();
    }
    else if (a === "addService") { C.services.push({ name: "Nová služba", price: "od 0 Kč", summary: "", image: "detail-myti.jpg", items: [] }); dirty(); render(); }
    else if (a === "addPackage") { C.packages.push({ name: "Nový balíček", price: "od 0 Kč", items: [] }); dirty(); render(); }
    else if (a === "addGroup") { C.priceGroups.push({ title: "Nová kategorie", items: [] }); dirty(); render(); }
    else if (a === "addItem") { C.priceGroups[+b.dataset.i].items.push({ name: "Nová položka", price: "od 0 Kč" }); dirty(); render(); }
    else if (a === "addAlbum") { C.albums.unshift({ id: "auto-" + Date.now(), title: "Nové auto", service: "", description: "", photos: [] }); dirty(); render(); }
    else if (a === "doneInq") {
      fetch("/api/inquiries", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: +b.dataset.id })
      }).then(loadInquiries);
    }
  });

  el("save").addEventListener("click", function () {
    (C.albums || []).forEach(function (al) { if (!al.id) al.id = slug(al.title); });
    el("status").textContent = "Ukládám…";
    fetch("/api/content", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(C)
    }).then(function (r) {
      if (!r.ok) throw new Error("Uložení selhalo");
      DIRTY = false;
      el("status").textContent = "Uloženo. Web je aktualizovaný.";
    }).catch(function (e) { el("status").textContent = e.message; });
  });

  el("logout").addEventListener("click", function () {
    fetch("/api/logout", { method: "POST" }).then(function () { location.reload(); });
  });

  window.addEventListener("beforeunload", function (e) {
    if (DIRTY) { e.preventDefault(); e.returnValue = ""; }
  });

  el("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = el("loginMsg");
    msg.className = ""; msg.textContent = "";
    fetch("/api/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: el("pw").value })
    }).then(function (r) {
      if (!r.ok) throw new Error("Špatné heslo.");
      start();
    }).catch(function (err) {
      msg.className = "msg err";
      msg.textContent = err.message;
    });
  });

  /* ---------- start ---------- */

  function start() {
    fetch("/api/content?admin=1").then(function (r) {
      if (r.status === 401) { el("login").style.display = "block"; el("app").style.display = "none"; return null; }
      return r.json();
    }).then(function (data) {
      if (!data) return;
      C = data;
      el("login").style.display = "none";
      el("app").style.display = "block";
      render();
    }).catch(function () {
      el("login").style.display = "block";
    });
  }
  start();
})();
