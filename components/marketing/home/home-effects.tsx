"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the redesigned homepage's scroll interactions — a faithful React port
 * of the original's vanilla script: scroll-progress bar, reveal-on-scroll,
 * count-ups, the readiness gauge, the deadline rail that fills with scroll, and
 * the sticky "wettekst → takenlijst" scrub. It mutates the static markup that
 * the (server) page renders — all queries run after mount, so no hydration
 * conflict. Milestone dates are ComplAI's vetted values (incl. the Digital
 * Omnibus deferral), not the source design's.
 */
export function HomeEffects() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bar = barRef.current;

    // ---- Dates & counters (ComplAI-vetted milestones) ----
    const DAY = 864e5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(2025, 1, 2); // 2 feb 2025 — Art. 4 & Art. 5
    const milestones = [
      { d: new Date(2026, 11, 2), label: "transparantieplicht (Art. 50)" }, // 2 dec 2026
      { d: new Date(2027, 11, 2), label: "hoog-risico uit Bijlage III" }, // 2 dec 2027
    ];
    const daysSince = Math.max(0, Math.round((today.getTime() - start.getTime()) / DAY));
    const next = milestones.filter((m) => m.d > today)[0] ?? milestones[milestones.length - 1];
    const daysUntil = Math.max(0, Math.round((next.d.getTime() - today.getTime()) / DAY));
    const fmt = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" });

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText("daysSince", "dag " + daysSince.toLocaleString("nl-NL"));
    setText("nextLabel", next.label);
    setText("mockDeadline", fmt.format(next.d) + " · " + daysUntil + " dagen");

    function countTo(el: HTMLElement, target: number, dur: number) {
      if (reduce) {
        el.textContent = target.toLocaleString("nl-NL");
        return;
      }
      let t0: number | null = null;
      function tick(ts: number) {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("nl-NL");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const cleanups: Array<() => void> = [];

    // ---- Scroll-reveal ----
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ---- Counters ----
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          countTo(el, el.id === "cSince" ? daysSince : daysUntil, 1400);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    ["cSince", "cUntil"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) counterIO.observe(el);
    });
    cleanups.push(() => counterIO.disconnect());

    // ---- Readiness gauge ----
    const arc = document.getElementById("gaugeArc") as SVGCircleElement | null;
    const gnum = document.getElementById("gaugeNum");
    const C = 276.5;
    const PCT = 68;
    const gaugeTimer = window.setTimeout(() => {
      if (arc) arc.style.strokeDashoffset = String(C - (C * PCT) / 100);
      if (gnum) countTo(gnum, PCT, 1600);
    }, 500);
    cleanups.push(() => window.clearTimeout(gaugeTimer));

    // ---- Deadline rail fills with scroll ----
    const rail = document.getElementById("rail");
    const fill = document.getElementById("railFill");
    const miles = Array.from(document.querySelectorAll<HTMLElement>("[data-mile]"));
    function updateRail() {
      if (!rail || !fill) return;
      const r = rail.getBoundingClientRect();
      const anchor = window.innerHeight * 0.55;
      let p = (anchor - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      fill.style.height = p * 100 + "%";
      miles.forEach((m) => {
        const mr = m.getBoundingClientRect();
        const passed = mr.top < anchor;
        m.classList.toggle("on", passed);
        m.classList.toggle("past", passed && m.querySelector(".tag-now") !== null);
      });
    }

    // ---- Wettekst → takenlijst scrub ----
    const stage = document.getElementById("trStage");
    const laws = Array.from(document.querySelectorAll<HTMLElement>("[data-law]"));
    const todos = Array.from(document.querySelectorAll<HTMLElement>("[data-todo]"));
    const trCount = document.getElementById("trCount");
    function updateTranslate() {
      if (!stage) return;
      if (window.innerWidth <= 860) {
        todos.forEach((t) => t.classList.add("on"));
        laws.forEach((l) => l.classList.remove("fade"));
        if (trCount) trCount.textContent = String(todos.length);
        return;
      }
      const r = stage.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / (total || 1)));
      const active = Math.min(todos.length, Math.floor(p * (todos.length + 0.4)));
      todos.forEach((t, i) => t.classList.toggle("on", i < active));
      laws.forEach((l, i) => l.classList.toggle("fade", i < active));
      if (trCount) trCount.textContent = String(active);
    }

    // ---- Scroll-progress bar ----
    function onScroll() {
      if (!bar) return;
      const y = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }

    // ---- One rAF loop for all scroll effects ----
    let ticking = false;
    function frame() {
      onScroll();
      updateRail();
      updateTranslate();
      ticking = false;
    }
    function request() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    frame();
    cleanups.push(() => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    });

    // ---- FAQ accordion ----
    // Each button sits inside an <h3>, so the answer panel (.a) is the sibling
    // of that <h3>, not of the button.
    const faqButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".hp .q button"));
    const panelFor = (btn: HTMLButtonElement) =>
      btn.parentElement?.nextElementSibling as HTMLElement | null;
    const onFaqClick = (btn: HTMLButtonElement) => () => {
      const panel = panelFor(btn);
      const open = btn.getAttribute("aria-expanded") === "true";
      faqButtons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const p = panelFor(b);
        if (p) p.style.maxHeight = "";
      });
      if (!open && panel) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    };
    const handlers = faqButtons.map((btn) => {
      const h = onFaqClick(btn);
      btn.addEventListener("click", h);
      return { btn, h };
    });
    cleanups.push(() => handlers.forEach(({ btn, h }) => btn.removeEventListener("click", h)));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div className="hp-progress" ref={barRef} aria-hidden="true" />;
}
