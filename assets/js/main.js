/* ParametricSkills project page: hero demo, charts, small interactions.
   All result numbers are copied from the paper's Tables 1-5. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";
  var BACKBONES = ["Qwen3-8B", "Qwen3.5-4B", "Qwen3.5-9B"];
  var METHODS = ["SFT (LoRA)", "No-Skill", "SHINE", "ICL", "ParametricSkills"];
  var OURS = "ParametricSkills";

  // ---------- Data ----------
  // ALFWorld success rate (%): Pick, Look, Clean, Heat, Cool, Pick2, Overall.
  var ALF_COLS = ["Pick", "Look", "Clean", "Heat", "Cool", "Pick2", "Overall"];
  var ALF = {
    "Qwen3-8B": {
      "SFT (LoRA)":       [94.92, 87.10, 93.10, 84.62, 91.30, 92.68, 91.24],
      "No-Skill":         [98.31, 51.61, 48.28, 25.64, 32.61, 68.29, 56.57],
      "SHINE":            [40.68,  9.68, 15.52, 12.82, 10.87, 12.20, 18.61],
      "ICL":              [94.92, 74.19, 82.76, 82.05, 50.00, 63.41, 75.91],
      "ParametricSkills": [100.00, 90.32, 96.55, 87.18, 89.13, 92.68, 93.43]
    },
    "Qwen3.5-4B": {
      "SFT (LoRA)":       [84.75, 93.55, 82.76, 92.31, 84.78, 56.10, 82.12],
      "No-Skill":         [55.93,  9.68, 17.24, 23.08, 15.22, 26.83, 26.64],
      "SHINE":            [50.85,  3.23,  1.72,  5.13,  4.35, 31.71, 17.88],
      "ICL":              [22.03, 48.39, 29.31, 17.95,  8.70, 26.83, 24.45],
      "ParametricSkills": [93.22, 90.32, 91.38, 92.31, 86.96, 85.37, 90.15]
    },
    "Qwen3.5-9B": {
      "SFT (LoRA)":       [98.31, 96.77, 93.10, 97.44, 93.48, 87.80, 94.53],
      "No-Skill":         [96.61, 51.61, 39.66, 56.41, 19.57, 73.17, 57.30],
      "SHINE":            [84.75, 32.26, 51.72, 23.08,  6.52, 34.15, 42.34],
      "ICL":              [77.97, 54.84, 56.90, 61.54, 52.17, 73.17, 63.50],
      "ParametricSkills": [96.61, 100.00, 98.28, 97.44, 95.65, 82.93, 95.26]
    }
  };
  // SkillEval: [mean, std] for K1, K2, K3, Overall (four runs).
  var SE_COLS = ["K1", "K2", "K3", "Overall"];
  var SE = {
    "Qwen3-8B": {
      "SFT (LoRA)":       [[56.17, 3.52], [49.33, 1.11], [56.07, 5.72], [53.00, 2.17]],
      "No-Skill":         [[41.53, 6.13], [39.75, 4.96], [53.46, 4.81], [43.57, 3.15]],
      "SHINE":            [[16.43, 2.63], [17.43, 4.51], [21.26, 2.03], [18.05, 2.87]],
      "ICL":              [[40.54, 4.68], [42.31, 4.57], [45.22, 3.78], [42.48, 2.69]],
      "ParametricSkills": [[48.88, 5.29], [44.11, 2.70], [58.06, 3.73], [48.89, 1.73]]
    },
    "Qwen3.5-4B": {
      "SFT (LoRA)":       [[63.96, 5.96], [57.93, 1.14], [64.92, 2.05], [61.42, 2.06]],
      "No-Skill":         [[57.33, 3.52], [55.58, 1.74], [65.82, 2.69], [58.56, 1.33]],
      "SHINE":            [[12.81, 6.17], [12.62, 3.53], [16.16, 6.48], [13.53, 1.34]],
      "ICL":              [[58.14, 1.98], [54.32, 1.73], [63.98, 2.54], [57.79, 0.86]],
      "ParametricSkills": [[57.72, 2.63], [55.10, 2.21], [63.19, 3.17], [57.83, 1.49]]
    },
    "Qwen3.5-9B": {
      "SFT (LoRA)":       [[60.71, 2.14], [59.28, 1.00], [68.75, 3.27], [61.98, 1.28]],
      "No-Skill":         [[56.07, 0.88], [59.49, 2.17], [66.84, 1.69], [60.23, 0.88]],
      "SHINE":            [[20.47, 5.69], [14.91, 3.23], [14.09, 4.71], [16.38, 1.62]],
      "ICL":              [[61.56, 3.01], [57.11, 0.72], [67.59, 2.56], [60.96, 1.08]],
      "ParametricSkills": [[61.82, 1.61], [60.52, 0.67], [69.73, 5.78], [63.12, 1.74]]
    }
  };
  var EVO = [
    { label: "No evolution", value: 46.89, err: 1.09 },
    { label: "Self-evolution", value: 53.18, err: 1.30 },
    { label: "Continual learning", value: 56.47, err: 3.05, ours: true }
  ];
  var COMPOSE = [
    { label: "Linear merge", value: 44.28 },
    { label: "Rank-concat merge", value: 47.01 },
    { label: "Text concatenation", value: 50.93, ours: true }
  ];
  var STAGES = [
    { label: "W/o Stage 1", value: 59.86, err: 0.97 },
    { label: "W/o Stage 2", value: 50.13, err: 1.74 },
    { label: "W/o Stage 3", value: 53.98, err: 3.97 },
    { label: "Full pipeline", value: 63.12, err: 1.74, ours: true }
  ];

  function fmt(v) { return v.toFixed(2); }
  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // ---------- Tooltip ----------
  var tip = document.getElementById("tooltip");
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.classList.add("show");
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(window.innerWidth - w - 8, Math.max(8, x + 14));
    var top = y - h - 12 < 8 ? y + 16 : y - h - 12;
    tip.style.transform = "none";
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hideTip() { tip.classList.remove("show"); }

  // Horizontal bar: square at the baseline, 4px rounded data end.
  function barPath(x0, y, w, h) {
    if (w <= 0.01) return "";
    var r = Math.min(4, w / 2, h / 2);
    return "M" + x0 + "," + y + "H" + (x0 + w - r) +
      "Q" + (x0 + w) + "," + y + " " + (x0 + w) + "," + (y + r) +
      "V" + (y + h - r) +
      "Q" + (x0 + w) + "," + (y + h) + " " + (x0 + w - r) + "," + (y + h) +
      "H" + x0 + "Z";
  }

  /* Horizontal bar chart drawn in CSS pixels (re-rendered on resize), so text
     stays at its CSS size however wide the panel is.
     rows: [{label, value, err?, ours?}]; opts: {max, ticks, labelW, unit, title}. */
  var charts = [];
  function hbars(container, rows, opts) {
    var entry = { container: container, rows: rows, opts: opts, drawn: false };
    charts.push(entry);
    drawChart(entry, !reduceMotion);
    return entry;
  }
  function drawChart(entry, animate) {
    var container = entry.container, rows = entry.rows, opts = entry.opts;
    var W = Math.max(240, container.clientWidth || 360);
    var hasErr = rows.some(function (r) { return r.err != null; });
    var valW = hasErr ? 104 : 56;

    container.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "chart";
    var svg = el("svg", { role: "list", "aria-label": opts.title });
    wrap.appendChild(svg);
    container.appendChild(wrap);

    // Measure the longest label (bold, the widest case) so labels never spill
    // out of the panel. If labels plus values leave too little room for the
    // bars, stack each label above its bar instead.
    var probe = el("text", { class: "label ours", x: 0, y: -100 }, svg);
    var need = 0;
    rows.forEach(function (r) { probe.textContent = r.label; need = Math.max(need, probe.getComputedTextLength()); });
    svg.removeChild(probe);
    need = Math.ceil(need) + 12;
    var stacked = need > W * 0.45 || W - need - valW < 90;

    var labelW = stacked ? 8 : need;
    var barH = stacked ? 16 : 20, gap = 14, top = 6, axisH = 24, labH = stacked ? 20 : 0;
    var rowH = labH + barH + gap;
    var plotW = Math.max(60, W - labelW - valW);
    var H = top + rows.length * rowH - gap + axisH + 4;
    var sx = function (v) { return labelW + (v / opts.max) * plotW; };
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    opts.ticks.forEach(function (t) {
      var x = Math.round(sx(t)) + 0.5;
      el("line", { class: t === 0 ? "base" : "grid", x1: x, x2: x, y1: top - 4, y2: H - axisH }, svg);
      el("text", { class: "tick", x: x, y: H - 6, "text-anchor": "middle" }, svg).textContent = t;
    });

    var bars = [];
    rows.forEach(function (r, i) {
      var y = top + i * rowH + labH;   // top of the bar
      var desc = r.label + ": " + fmt(r.value) + (r.err != null ? " plus or minus " + fmt(r.err) : "") + (opts.unit || "");
      var g = el("g", { class: "row", tabindex: "0", role: "listitem", "aria-label": desc }, svg);
      el("rect", { class: "hit", x: 0, y: y - labH - gap / 2, width: W, height: rowH, rx: 8 }, g);
      if (stacked) {
        el("text", { class: "label" + (r.ours ? " ours" : ""), x: labelW, y: y - 6 }, g).textContent = r.label;
      } else {
        el("text", { class: "label" + (r.ours ? " ours" : ""), x: labelW - 10, y: y + barH / 2 + 4.5, "text-anchor": "end" }, g).textContent = r.label;
      }
      var w = sx(r.value) - sx(0);
      var bar = el("path", { class: "bar" + (r.ours ? " ours" : ""), d: barPath(sx(0), y, animate ? 0 : w, barH) }, g);
      bars.push({ node: bar, x0: sx(0), y: y, w: w, h: barH });
      var endX = sx(r.value);
      if (r.err != null) {
        var e0 = sx(Math.max(0, r.value - r.err)), e1 = sx(Math.min(opts.max, r.value + r.err)), cy = y + barH / 2;
        el("line", { class: "err", x1: e0, x2: e1, y1: cy, y2: cy }, g);
        el("line", { class: "err", x1: e0, x2: e0, y1: cy - 5, y2: cy + 5 }, g);
        el("line", { class: "err", x1: e1, x2: e1, y1: cy - 5, y2: cy + 5 }, g);
        endX = Math.max(endX, e1);
      }
      el("text", { class: "val" + (r.ours ? "" : " muted"), x: endX + 8, y: y + barH / 2 + 4.5 }, g).textContent =
        fmt(r.value) + (r.err != null ? " ± " + fmt(r.err) : "");

      var html = '<div class="tt-k">' + r.label + '</div><div class="tt-v">' + fmt(r.value) +
        (r.err != null ? " ± " + fmt(r.err) : "") + (opts.unit || "") + "</div>";
      g.addEventListener("mousemove", function (ev) { showTip(html, ev.clientX, ev.clientY); });
      g.addEventListener("mouseleave", hideTip);
      g.addEventListener("focus", function () { var b = g.getBoundingClientRect(); showTip(html, b.left + b.width / 2, b.top); });
      g.addEventListener("blur", hideTip);
    });

    if (animate) growWhenVisible(svg, bars);
    entry.drawn = true;
  }

  // Bars grow from the baseline the first time a chart scrolls into view.
  var growObs = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      growObs.unobserve(en.target);
      en.target._grow();
    });
  }, { threshold: 0.2 }) : null;
  function growWhenVisible(svg, bars) {
    svg._grow = function () {
      var t0 = null, dur = 800;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        bars.forEach(function (b, i) {
          var q = Math.max(0, Math.min(1, (p * dur - i * 60) / (dur - 240)));
          var eq = 1 - Math.pow(1 - q, 3);
          b.node.setAttribute("d", barPath(b.x0, b.y, b.w * eq, b.h));
        });
        if (p < 1) requestAnimationFrame(frame);
        else bars.forEach(function (b) { b.node.setAttribute("d", barPath(b.x0, b.y, b.w, b.h)); });
      }
      requestAnimationFrame(frame);
    };
    if (growObs) growObs.observe(svg); else svg._grow();
  }

  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      charts.forEach(function (c) { if (c.container.isConnected) drawChart(c, false); });
    }, 120);
  });
  // ---------- Results: one panel per backbone ----------
  var bench = "alfworld";
  var chartsEl = document.getElementById("results-charts");
  var tableEl = document.getElementById("results-table");
  var titleEl = document.getElementById("results-title");
  var noteEl = document.getElementById("results-note");
  var legendEl = document.getElementById("results-legend");
  var errLegend = document.getElementById("legend-err");
  var tableOn = false;

  function renderResults() {
    var isAlf = bench === "alfworld";
    // Drop the old panels' chart entries before drawing new ones.
    charts = charts.filter(function (c) { return !chartsEl.contains(c.container); });
    chartsEl.innerHTML = "";
    titleEl.textContent = isAlf
      ? "ALFWorld overall success rate (%), 274 tasks"
      : "SkillEval overall score, mean ± std over four runs";
    noteEl.textContent = isAlf
      ? "Highest overall success on all three backbones. Per-task-type results are in the table view."
      : "Best overall on Qwen3.5-9B; SFT (LoRA) leads on Qwen3-8B and Qwen3.5-4B. K1/K2/K3 breakdowns are in the table view.";
    errLegend.hidden = isAlf;
    BACKBONES.forEach(function (bb) {
      var panel = document.createElement("div");
      panel.className = "panel glass";
      var h = document.createElement("h3");
      h.textContent = bb;
      panel.appendChild(h);
      var holder = document.createElement("div");
      panel.appendChild(holder);
      chartsEl.appendChild(panel);
      var rows = METHODS.map(function (m) {
        if (isAlf) return { label: m, value: ALF[bb][m][6], ours: m === OURS };
        var o = SE[bb][m][3];
        return { label: m, value: o[0], err: o[1], ours: m === OURS };
      });
      hbars(holder, rows, {
        max: isAlf ? 100 : 80, ticks: isAlf ? [0, 25, 50, 75, 100] : [0, 20, 40, 60, 80],
        unit: isAlf ? "%" : "", labelW: 126,
        title: (isAlf ? "ALFWorld overall success, " : "SkillEval overall score, ") + bb
      });
    });
    renderTable();
  }

  function renderTable() {
    var isAlf = bench === "alfworld";
    var cols = isAlf ? ALF_COLS : SE_COLS;
    var html = "<table><caption>" +
      (isAlf ? "ALFWorld success rate (%) by task type" : "SkillEval scores, mean ± std over four runs") +
      "</caption><thead><tr><th scope=\"col\">Method</th>";
    cols.forEach(function (c) { html += "<th scope=\"col\">" + c + "</th>"; });
    html += "</tr></thead><tbody>";
    BACKBONES.forEach(function (bb) {
      html += "<tr class=\"grp\"><td colspan=\"" + (cols.length + 1) + "\">" + bb + "</td></tr>";
      // Highest mean per column within the backbone, bolded as in the paper.
      var best = cols.map(function (_, j) {
        return Math.max.apply(null, METHODS.map(function (m) { return isAlf ? ALF[bb][m][j] : SE[bb][m][j][0]; }));
      });
      METHODS.forEach(function (m) {
        html += "<tr" + (m === OURS ? " class=\"ours\"" : "") + "><th scope=\"row\">" + m + "</th>";
        cols.forEach(function (_, j) {
          var v = isAlf ? ALF[bb][m][j] : SE[bb][m][j][0];
          var s = isAlf ? fmt(v) : fmt(v) + " ± " + fmt(SE[bb][m][j][1]);
          html += "<td" + (v === best[j] ? " class=\"best\"" : "") + ">" + s + "</td>";
        });
        html += "</tr>";
      });
    });
    tableEl.innerHTML = html + "</tbody></table>";
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.seg-ctl [role="tab"]'));
  function selectTab(t) {
    tabs.forEach(function (o) {
      o.setAttribute("aria-selected", o === t ? "true" : "false");
      o.tabIndex = o === t ? 0 : -1;
    });
    document.getElementById("panel-results").setAttribute("aria-labelledby", t.id);
    if (bench !== t.dataset.bench) { bench = t.dataset.bench; renderResults(); }
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (ev) {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      var i = tabs.indexOf(t);
      var n = tabs[(i + (ev.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); selectTab(n);
    });
  });
  var toggle = document.getElementById("toggle-table");
  toggle.addEventListener("click", function () {
    tableOn = !tableOn;
    toggle.setAttribute("aria-pressed", tableOn ? "true" : "false");
    toggle.textContent = tableOn ? "Chart view" : "Table view";
    tableEl.hidden = !tableOn;
    chartsEl.hidden = tableOn;
    legendEl.hidden = tableOn;
    if (!tableOn) charts.forEach(function (c) { if (chartsEl.contains(c.container)) drawChart(c, false); });
  });

  renderResults();
  hbars(document.getElementById("evo-chart"), EVO, { max: 70, ticks: [0, 20, 40, 60], labelW: 140, title: "SkillEval K1, single-skill subset, Qwen3-8B" });
  hbars(document.getElementById("abl-compose"), COMPOSE, { max: 60, ticks: [0, 20, 40, 60], labelW: 140, title: "Multi-skill composition, SkillEval overall, Qwen3-8B" });
  hbars(document.getElementById("abl-stage"), STAGES, { max: 70, ticks: [0, 20, 40, 60], labelW: 120, title: "Training-stage ablation, SkillEval overall, Qwen3.5-9B" });

  // ---------- Count-up stats (the final value is already in the HTML) ----------
  var statEls = document.querySelectorAll(".stat-v[data-count]");
  function countUp(n) {
    var target = parseFloat(n.dataset.count), dec = parseInt(n.dataset.dec || "0", 10);
    var pre = n.dataset.prefix || "", suf = n.dataset.suffix || "";
    var f = function (v) { return pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
      n.textContent = f(p < 1 ? target * e : target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduceMotion && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { so.unobserve(e.target); countUp(e.target); } });
    }, { threshold: 0.6 });
    statEls.forEach(function (n) { so.observe(n); });
  }

  // ---------- Section reveal, active nav, progress bar ----------
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section"));
  var navLinks = document.querySelectorAll(".nav nav a");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var vh = window.innerHeight;
    sections.forEach(function (s) {
      // Only hide sections that start below the fold, so nothing flashes.
      if (s.getBoundingClientRect().top > vh * 0.9) s.querySelector(".wrap").classList.add("reveal");
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.querySelector(".wrap").classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.06 });
    sections.forEach(function (s) { io.observe(s); });
  }
  var bar = document.getElementById("progress-bar");
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    var current = "";
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
    navLinks.forEach(function (a) { a.classList.toggle("active", current !== "" && a.getAttribute("href") === "#" + current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Copy BibTeX ----------
  var copyBtn = document.getElementById("copy-bib");
  copyBtn.addEventListener("click", function () {
    var text = document.getElementById("bibtex").innerText;
    var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { copyBtn.textContent = "Select to copy"; });
    else copyBtn.textContent = "Select to copy";
  });
  // Placeholder buttons do nothing until real links are filled in.
  document.querySelectorAll('.btn[aria-disabled="true"]').forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); });
  });
  // ---------- Hero demo: skill text -> hypernetwork -> LoRA factors ----------
  var DOC = [
    ["h", "# skill: debug-flaky-tests"],
    ["k", "when:"], ["t", " passes locally, fails in CI\n"],
    ["k", "1."], ["t", " re-run with a fixed seed\n"],
    ["k", "2."], ["t", " isolate shared state and fixtures\n"],
    ["k", "3."], ["t", " pin time, network, and ordering\n"],
    ["k", "4."], ["t", " add a regression test, then fix"]
  ];
  var docEl = document.getElementById("demo-doc");
  var netSvg = document.getElementById("demo-net");
  var matB = document.getElementById("mat-b"), matA = document.getElementById("mat-a");
  var PAL = ["#5b6cff", "#7c6cf0", "#8b5cf6", "#a855f7", "#d946ef", "#ec6fb4", "#14b8c8", "#3b82f6"];
  var cellsB = [], cellsA = [];
  for (var i = 0; i < 40; i++) { var c = document.createElement("span"); matB.appendChild(c); cellsB.push(c); }
  for (var j = 0; j < 40; j++) { var d = document.createElement("span"); matA.appendChild(d); cellsA.push(d); }

  // Network: 3 layers of nodes with edges; pulses travel left to right.
  var layers = [[40, 55, 85, 115, 145], [140, 40, 80, 120, 160], [240, 70, 100, 130]];
  var nodes = layers.map(function (L) { return L.slice(1).map(function (y) { return { x: L[0], y: y }; }); });
  var defs = el("defs", {}, netSvg);
  var lg = el("linearGradient", { id: "edgeg", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
  el("stop", { offset: "0", "stop-color": "#7c6cf0", "stop-opacity": "0.25" }, lg);
  el("stop", { offset: "1", "stop-color": "#14b8c8", "stop-opacity": "0.35" }, lg);
  var edges = [];
  for (var l = 0; l < nodes.length - 1; l++) {
    nodes[l].forEach(function (a) {
      nodes[l + 1].forEach(function (b) {
        edges.push({ a: a, b: b, line: el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "url(#edgeg)", "stroke-width": 1.2 }, netSvg) });
      });
    });
  }
  // Input and output stubs connect the net to the two cards.
  el("line", { x1: 0, y1: 100, x2: 40, y2: 100, stroke: "#c9cddb", "stroke-width": 1.5, "stroke-dasharray": "3 4" }, netSvg);
  el("line", { x1: 240, y1: 100, x2: 280, y2: 100, stroke: "#c9cddb", "stroke-width": 1.5, "stroke-dasharray": "3 4" }, netSvg);
  var nodeEls = [];
  nodes.forEach(function (L, li) {
    L.forEach(function (n) {
      el("circle", { cx: n.x, cy: n.y, r: 9, fill: "#fff", stroke: "rgba(98,80,214,0.25)", "stroke-width": 1 }, netSvg);
      nodeEls.push(el("circle", { cx: n.x, cy: n.y, r: 5, fill: PAL[li * 2 + 1] }, netSvg));
    });
  });
  var pulseG = el("g", {}, netSvg);

  function renderDoc(nChars, caret) {
    var out = "", left = nChars;
    for (var k = 0; k < DOC.length && left > 0; k++) {
      var cls = DOC[k][0], txt = DOC[k][1].slice(0, left);
      left -= DOC[k][1].length;
      txt = txt.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      out += cls === "t" ? txt : '<span class="c-' + cls + '">' + txt + "</span>";
      if (cls === "h" && left > 0) { out += "\n"; }
    }
    docEl.innerHTML = out + (caret ? '<span class="caret"></span>' : "");
  }
  var DOC_LEN = DOC.reduce(function (s, p) { return s + p[1].length; }, 0);

  function setCells(p) {
    // p in [0,1]: fraction of cells "written"; colors come from a fixed hash so each run looks the same.
    var all = cellsB.concat(cellsA), n = Math.round(all.length * p);
    all.forEach(function (c, idx) {
      var on = ((idx * 37) % all.length) < n;
      c.style.backgroundColor = on ? PAL[(idx * 7 + (idx >> 2)) % PAL.length] : "#e9e8f8";
      c.style.opacity = on ? String(0.45 + ((idx * 53) % 55) / 100) : "1";
    });
  }

  if (reduceMotion) {
    renderDoc(DOC_LEN, false);
    setCells(1);
  } else {
    var cycle = 9000, tStart = null;
    var pulses = edges.map(function (e, k) {
      return { e: e, off: (k * 0.137) % 1, dot: el("circle", { r: 2.6, fill: k % 2 ? "#8b5cf6" : "#14b8c8", opacity: 0 }, pulseG) };
    });
    var demoVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { demoVisible = es[0].isIntersecting; }, { threshold: 0 }).observe(netSvg);
    }
    var tick = function (t) {
      if (tStart === null) tStart = t;
      if (demoVisible) {
        var ph = ((t - tStart) % cycle) / cycle;          // 0..1 loop
        // 0.00-0.40 type the skill, 0.30-0.70 run the net, 0.55-0.85 fill the matrices, hold, reset.
        renderDoc(Math.round(DOC_LEN * Math.min(1, ph / 0.4)), ph < 0.42 || ph > 0.9);
        var netOn = ph > 0.3 && ph < 0.75;
        pulses.forEach(function (p) {
          var q = ((t / 1400) + p.off) % 1;
          p.dot.setAttribute("cx", p.e.a.x + (p.e.b.x - p.e.a.x) * q);
          p.dot.setAttribute("cy", p.e.a.y + (p.e.b.y - p.e.a.y) * q);
          p.dot.setAttribute("opacity", netOn ? (0.9 * Math.sin(Math.PI * q)).toFixed(2) : 0);
        });
        nodeEls.forEach(function (n, k) {
          n.setAttribute("r", netOn ? 5 + 1.6 * Math.max(0, Math.sin(t / 260 + k)) : 5);
        });
        setCells(ph < 0.55 ? 0 : Math.min(1, (ph - 0.55) / 0.3));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
