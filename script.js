(function () {
  var rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach(function (el, k) {
    el.style.transitionDelay = (k % 3) * 100 + "ms";
    io.observe(el);
  });
  var stackSection = document.getElementById("stack");
  if (stackSection) io.observe(stackSection);
  var certCards = document.querySelectorAll("#certs .cert");
  if (certCards.length > 1) {
    var certDimFrame = 0;
    function updateCertDimming() {
      if (certDimFrame) return;
      certDimFrame = requestAnimationFrame(function () {
        certDimFrame = 0;
        certCards.forEach(function (card, index) {
          var rect = card.getBoundingClientRect(),
            dim = 0;
          for (var nextIndex = index + 1; nextIndex < certCards.length; nextIndex++) {
            var nextRect = certCards[nextIndex].getBoundingClientRect(),
              overlap =
                Math.min(rect.bottom, nextRect.bottom) -
                Math.max(rect.top, nextRect.top);
            if (overlap > 0) {
              dim = Math.max(dim, Math.min(1, overlap / rect.height));
            }
          }
          card.style.setProperty("--cert-dim", (dim * 0.45).toFixed(3));
        });
      });
    }
    addEventListener("scroll", updateCertDimming, { passive: true });
    addEventListener("resize", updateCertDimming);
    updateCertDimming();
  }

  // mobile side panel
  var bg = document.getElementById("burger"),
    pn = document.getElementById("panel"),
    sc = document.getElementById("scrim");
  function setP(o) {
    pn.classList.toggle("open", o);
    sc.classList.toggle("open", o);
    bg.setAttribute("aria-expanded", o);
    if (o) document.getElementById("close").focus();
    else bg.focus({ preventScroll: true });
  }
  bg.addEventListener("click", function () {
    setP(true);
  });
  document.getElementById("close").addEventListener("click", function () {
    setP(false);
  });
  sc.addEventListener("click", function () {
    setP(false);
  });
  pn.querySelectorAll("nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      pn.classList.remove("open");
      sc.classList.remove("open");
      bg.setAttribute("aria-expanded", false);
    });
  });
  addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pn.classList.contains("open")) setP(false);
  });

  // contact form
  var contactForm = document.getElementById("contact-form"),
    contactMessage = document.getElementById("contact-message"),
    contactNote = document.getElementById("contact-note");
  if (contactForm && contactMessage && contactNote) {
    var reasons = [
        "You have a project idea",
        "You'd like to collaborate",
        "You're hiring a developer",
        "You have a question about my work",
      ],
      reasonIndex = 0,
      characterIndex = 0,
      deleting = false,
      placeholderTimer;
    function typePlaceholder() {
      if (
        document.activeElement === contactMessage ||
        contactMessage.value
      ) {
        return;
      }
      var reason = reasons[reasonIndex];
      if (deleting) {
        characterIndex--;
        contactMessage.placeholder = reason.slice(0, characterIndex);
        if (characterIndex === 0) {
          deleting = false;
          reasonIndex = (reasonIndex + 1) % reasons.length;
        }
        placeholderTimer = setTimeout(typePlaceholder, 35);
      } else {
        characterIndex++;
        contactMessage.placeholder = reason.slice(0, characterIndex);
        if (characterIndex === reason.length) {
          deleting = true;
          placeholderTimer = setTimeout(typePlaceholder, 1400);
          return;
        }
        placeholderTimer = setTimeout(typePlaceholder, 65);
      }
    }
    if (rm) {
      contactMessage.placeholder = "Tell me about your project idea";
    } else {
      placeholderTimer = setTimeout(typePlaceholder, 500);
      contactMessage.addEventListener("focus", function () {
        clearTimeout(placeholderTimer);
        contactMessage.placeholder = "";
      });
      contactMessage.addEventListener("blur", function () {
        if (!contactMessage.value) {
          placeholderTimer = setTimeout(typePlaceholder, 300);
        }
      });
    }
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(contactForm),
        email = data.get("email").trim(),
        message = data.get("message").trim(),
        subject = "Message from my portfolio",
        body =
          "Hi Joseph,\n\n" +
          message +
          "\n\nMy email address: " +
          email,
        gmailUrl =
          "https://mail.google.com/mail/?view=cm&fs=1&to=" +
          encodeURIComponent("josephawolola16@gmail.com") +
          "&su=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body),
        draftWindow = window.open(gmailUrl, "_blank");
      if (draftWindow) {
        contactNote.textContent =
          "Gmail draft opened. Review your message and press Send.";
        return;
      }
      contactNote.textContent = "Your browser blocked the new tab. ";
      var fallback = document.createElement("a");
      fallback.href = gmailUrl;
      fallback.target = "_blank";
      fallback.rel = "noopener";
      fallback.textContent = "Open your prefilled Gmail draft";
      contactNote.appendChild(fallback);
    });
  }

  // hero letters
  var h = document.getElementById("h1"),
    hl = document.getElementById("hl"),
    hero = document.querySelector(".hero"),
    glow = document.getElementById("glow"),
    gridbg = document.querySelector(".gridbg"),
    txt = h.textContent;
  h.setAttribute("aria-label", txt);
  h.textContent = "";
  txt.split(" ").forEach(function (w) {
    var ws = document.createElement("span");
    ws.className = "w";
    ws.setAttribute("aria-hidden", "true");
    w.split("").forEach(function (ch) {
      var s = document.createElement("span");
      s.className = "c";
      s.textContent = ch;
      ws.appendChild(s);
    });
    h.appendChild(ws);
    h.appendChild(document.createTextNode(" "));
  });
  var cs = [].slice.call(h.querySelectorAll(".c")),
    off = cs.map(function () {
      return [0, 0];
    });
  function half() {
    return glow.offsetWidth / 2;
  }
  function positionGlow(x, y) {
    var box = gridbg.getBoundingClientRect();
    glow.style.transform =
      "translate(" +
      (x - box.left - half()) +
      "px," +
      (y - box.top - half()) +
      "px)";
  }
  function rest() {
    var hbox = h.getBoundingClientRect(),
      box = gridbg.getBoundingClientRect();
    glow.style.transform =
      "translate(" +
      (hbox.left + hbox.width / 2 - box.left - half()) +
      "px," +
      (hbox.top + hbox.height / 2 - box.top - half()) +
      "px)";
  }
  var focusSelector = ".btn, .glance, .fx";
  function hasFocusTarget(target) {
    return target instanceof Element && target.closest(focusSelector);
  }
  function setGlowFocus(focused, x, y) {
    glow.classList.toggle("is-focused", focused);
    if (typeof x === "number" && typeof y === "number") {
      positionGlow(x, y);
    }
  }
  rest();
  addEventListener("resize", rest);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(rest);
  function reset() {
    cs.forEach(function (c, i) {
      c.style.transform = "";
      off[i] = [0, 0];
    });
  }
  if (!rm) {
    addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var box = gridbg.getBoundingClientRect();
      if (
        e.clientX < box.left ||
        e.clientX > box.right ||
        e.clientY < box.top ||
        e.clientY > box.bottom
      ) {
        rest();
        return;
      }
      positionGlow(e.clientX, e.clientY);
    });
    addEventListener("pointerout", function (e) {
      if (!e.relatedTarget) {
        setGlowFocus(false);
        rest();
      }
    });
    hero.addEventListener("pointerover", function (e) {
      if (e.pointerType === "touch" || !hasFocusTarget(e.target)) return;
      setGlowFocus(true, e.clientX, e.clientY);
    });
    hero.addEventListener("pointerout", function (e) {
      if (e.pointerType === "touch" || !hasFocusTarget(e.target)) return;
      var nextTarget = hasFocusTarget(e.relatedTarget);
      setGlowFocus(!!nextTarget, e.clientX, e.clientY);
    });
    hl.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") {
        return;
      }
      var R = 120,
        P = 24;
      cs.forEach(function (c, i) {
        var r = c.getBoundingClientRect(),
          cx = r.left + r.width / 2 - off[i][0],
          cy = r.top + r.height / 2 - off[i][1],
          dx = cx - e.clientX,
          dy = cy - e.clientY,
          d = Math.sqrt(dx * dx + dy * dy) || 1,
          f = d < R ? 1 - d / R : 0,
          mx = (dx / d) * f * P,
          my = (dy / d) * f * P;
        off[i] = [mx, my];
        c.style.transform = f
          ? "translate(" +
            mx +
            "px," +
            my +
            "px) rotate(" +
            mx * 0.5 +
            "deg)"
          : "";
      });
    });
    hl.addEventListener("pointerleave", reset);
    hl.addEventListener("pointercancel", reset);
  }
  // placeholder images
  function phSrc(n) {
    var s =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'><rect width='1600' height='900' fill='#DCE8FF'/><rect x='620' y='240' width='360' height='270' rx='28' fill='none' stroke='#3A6DE0' stroke-opacity='.55' stroke-width='14'/><circle cx='720' cy='330' r='34' fill='#3A6DE0' fill-opacity='.55'/><path d='M640 490L760 380L850 460L910 410L960 490Z' fill='#3A6DE0' fill-opacity='.55'/><text x='800' y='610' font-family='system-ui,sans-serif' font-size='44' font-weight='700' fill='#2650B8' text-anchor='middle'>" +
      String(n).replace(/[&<>]/g, "") +
      "</text><text x='800' y='670' font-family='system-ui,sans-serif' font-size='30' fill='#4A5873' text-anchor='middle'>Replace with a screenshot (1600 x 900)</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(s);
  }
  function fb(img) {
    img.onerror = null;
    img.src = phSrc(img.getAttribute("data-ph") || "Project");
  }
  function wire(img) {
    img.onerror = function () {
      fb(img);
    };
    if (img.complete && img.naturalWidth === 0) fb(img);
  }
  document.querySelectorAll(".pimg").forEach(wire);

  document.querySelectorAll(".cert-image").forEach(function (img) {
    var slot = img.closest(".cert-image-slot");
    function showCertificate() {
      slot.classList.add("has-image");
    }
    img.addEventListener("load", showCertificate);
    img.addEventListener("error", function () {
      img.hidden = true;
    });
    if (img.complete) {
      if (img.naturalWidth > 0) showCertificate();
      else img.hidden = true;
    }
  });

  // project pages
  var P = {
    portfolio: {
      t: "Portfolio Showcase",
      lead: "A rich portfolio display that presents projects clearly on any screen.",
      w: "This site showcases projects in one place. Visitors can browse interactive project cards, see what each project is, and jump to the live version. The layout is responsive, so it reads well on phones, tablets and desktops, and a clean visual style keeps the focus on the work.",
      f: [
        "Responsive layout for every screen size",
        "Interactive project cards",
        "Clean, consistent visual style",
      ],
      s: ["HTML", "CSS", "JavaScript"],
    },
    ecommerce: {
      t: "E-commerce",
      lead: "An online store built to browse, pick and buy.",
      w: "A storefront where visitors can look through products, add what they like to a cart and check out. It is designed to be easy for customers to use and easy for the owner to run.",
      f: [
        "Product browsing",
        "Cart and checkout flow",
        "Responsive design for phones and desktops",
      ],
      s: ["[Add your stack]"],
    },
    dashboard: {
      t: "Dashboard",
      lead: "A single view of the numbers that matter.",
      w: "A dashboard that brings key figures and recent activity together, so users can see how things are going at a glance and spot what needs attention.",
      f: [
        "Key figures at a glance",
        "Recent activity overview",
        "Clear, readable layout",
      ],
      s: ["[Add your stack]"],
    },
    landing: {
      t: "Landing Page",
      lead: "A focused page that turns visitors into customers.",
      w: "A single-page site that introduces a product or service, explains why it matters and points visitors toward one clear action.",
      f: [
        "Clear message at the top of the page",
        "One focused call to action",
        "Fast, responsive layout",
      ],
      s: ["[Add your stack]"],
    },
  };
  var pv = document.getElementById("pview"),
    home = document.getElementById("top"),
    keys = Object.keys(P),
    cur = null;
  function mk(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function openP(k) {
    var d = P[k];
    if (!d || cur === k) return;
    cur = k;
    pv.textContent = "";
    var back = mk("button", "back in", "\u2190 All projects");
    back.type = "button";
    back.addEventListener("click", function () {
      closeP("projects");
    });
    var t = mk("h2", "ptitle in", d.t);
    t.style.animationDelay = ".1s";
    var l = mk("p", "plead in", d.lead);
    l.style.animationDelay = ".2s";
    var big = mk("div", "pbig in");
    big.style.animationDelay = ".3s";
    var src = document.querySelector('.pc[data-p="' + k + '"] .pimg'),
      bi = mk("img", "pimg");
    bi.alt = src ? src.alt : d.t;
    bi.setAttribute("data-ph", d.t);
    bi.setAttribute("src", src ? src.getAttribute("src") : "");
    wire(bi);
    big.appendChild(bi);
    var g = mk("div", "pgrid in");
    g.style.animationDelay = ".4s";
    var left = mk("div");
    left.appendChild(mk("h3", null, "What it does"));
    left.appendChild(mk("p", null, d.w));
    left.appendChild(mk("h3", null, "Key features"));
    var ul = mk("ul", "ft");
    d.f.forEach(function (x) {
      ul.appendChild(mk("li", null, x));
    });
    left.appendChild(ul);
    var side = mk("aside", "pside");
    side.appendChild(mk("h3", null, "Built with"));
    var tg = mk("div", "tags");
    d.s.forEach(function (x) {
      tg.appendChild(mk("span", null, x));
    });
    side.appendChild(tg);
    var vl = mk("a", "btn main", "View live");
    vl.href = "#";
    side.appendChild(vl);
    g.appendChild(left);
    g.appendChild(side);
    var more = mk("div", "more in");
    more.style.animationDelay = ".5s";
    more.appendChild(mk("h3", null, "More projects"));
    keys.forEach(function (x) {
      if (x !== k) {
        var a = mk("a", null, P[x].t);
        a.href = "#project-" + x;
        more.appendChild(a);
      }
    });
    [back, t, l, big, g, more].forEach(function (n) {
      pv.appendChild(n);
    });
    home.style.display = "none";
    pv.style.display = "block";
    window.scrollTo(0, 0);
    back.focus({ preventScroll: true });
  }
  function closeP(target) {
    cur = null;
    pv.style.display = "none";
    home.style.display = "";
    var t = target && document.getElementById(target);
    if (t) t.scrollIntoView();
    else if (target === undefined) window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    var h = a.getAttribute("href");
    if (h.indexOf("#project-") === 0) {
      e.preventDefault();
      openP(h.slice(9));
      return;
    }
    if (h === "#" && pv.contains(a)) {
      e.preventDefault();
      return;
    }
    if (cur) closeP(null);
  });
  document.querySelectorAll(".pc[data-p]").forEach(function (c) {
    c.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && !a.closest("h3")) return;
      openP(c.getAttribute("data-p"));
    });
  });
  function route() {
    var h = location.hash;
    if (h.indexOf("#project-") === 0) openP(h.slice(9));
  }
  addEventListener("hashchange", route);
  route();
})();
