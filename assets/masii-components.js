/* Pre-transpiled from MasiiHero.jsx (light hero subset): RotatingHeadline + GlassCursor */
(function () {
  const { useState, useRef, useEffect } = React;

  function GlassCursor({ mouseRef }) {
    const internalRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const mr = mouseRef || internalRef;
    useEffect(() => {
      if (mouseRef) return;
      const onMove = (e) => { internalRef.current.x = e.clientX; internalRef.current.y = e.clientY; };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }, [mouseRef]);
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let raf = 0;
      const pos = { x: mr.current.x, y: mr.current.y };
      const onOver = (e) => {
        const interactive = e.target && e.target.closest && e.target.closest("button, a, input, textarea, select, label");
        el.style.opacity = interactive ? "0" : "1";
      };
      window.addEventListener("mouseover", onOver);
      const loop = () => {
        pos.x += (mr.current.x - pos.x) * 0.35;
        pos.y += (mr.current.y - pos.y) * 0.35;
        el.style.transform = "translate(" + pos.x + "px, " + pos.y + "px) translate(-50%, -50%)";
        raf = requestAnimationFrame(loop);
      };
      loop();
      return () => { cancelAnimationFrame(raf); window.removeEventListener("mouseover", onOver); };
    }, [mr]);
    return React.createElement("div", {
      ref: ref, "aria-hidden": "true",
      className: "liquid-glass fixed top-0 left-0 z-50 rounded-full pointer-events-none",
      style: { width: 28, height: 28, transition: "opacity .15s ease",
        WebkitBackdropFilter: "blur(3px) saturate(1.5)", backdropFilter: "blur(3px) saturate(1.5)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25), inset 0 0 8px rgba(255,255,255,0.25)" }
    });
  }

  const HEADLINES = [
    { parts: [{ t: "Imagine if your impact was a " }, { t: "bigger flex", g: true }, { t: " than your bank balance, outfit or follower count?" }] },
    { parts: [{ t: "What if being a " }, { t: "good person actually paid off?", g: true }] },
    { parts: [{ t: "Good people " }, { t: "finish first.", g: true }] },
    { parts: [{ t: "Doing good is about to get " }, { t: "a lot more fun.", g: true }] },
    { parts: [{ t: "Finally, " }, { t: "a reason to be nice.", g: true }] },
    { parts: [{ t: "It\u2019s time for " }, { t: "a new flex.", g: true }] },
    { parts: [{ t: "The algorithm " }, { t: "didn\u2019t see this coming.", g: true }] },
    { parts: [{ t: "Hot people " }, { t: "help people.", g: true }] }];

  function headlineWords(parts) {
    const chars = [];
    parts.forEach((p) => [...p.t].forEach((ch) => chars.push({ ch, g: !!p.g })));
    const words = [];
    let cur = [];
    chars.forEach((c) => {
      if (c.ch === " ") { if (cur.length) words.push(cur); cur = []; }
      else cur.push(c);
    });
    if (cur.length) words.push(cur);
    return words;
  }

  function RotatingHeadline({ effect = "fade-rise", intervalMs = 4000, light = false }) {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState("in");
    const gradFill = {
      backgroundImage: "linear-gradient(90deg, #76D7F6, #9ED8B1, #E29CCF, #4041E5)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent"
    };
    useEffect(() => {
      const OUT_MS = 380;
      const t = setInterval(() => {
        setPhase("out");
        setTimeout(() => {
          setIdx((i) => (i + 1) % HEADLINES.length);
          setPhase("in");
        }, OUT_MS);
      }, Math.max(1500, intervalMs));
      return () => clearInterval(t);
    }, [intervalMs]);

    const { parts } = HEADLINES[idx % HEADLINES.length];
    const fullText = parts.map((p) => p.t).join("");
    const isIn = phase === "in";
    const h1Class = "mb-0";
    const h1Style = { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.01em", fontSize: "clamp(38px, 5vw, 86px)", lineHeight: 1.06, color: light ? "#101010" : "rgba(255,255,255,0.48)" };

    const LETTER_FX = {
      "letter-cascade": { step: 0.05 },
      "blur-dissolve": { step: 0.05, blur: true },
      "flip-up": { step: 0.045, flip: true },
      "scale-settle": { step: 0.04, scale: true },
      "typewriter": { step: 0.045, type: true }
    };
    if (LETTER_FX[effect]) {
      const { step: STEP, blur, flip, scale, type } = LETTER_FX[effect];
      const words = headlineWords(parts);
      const totalGrad = words.reduce((n, w) => n + w.filter((c) => c.g).length, 0);
      let li = 0;
      let gg = 0;
      const hidden = () => {
        if (flip) return { transform: "rotateX(-90deg) translateY(8px)" };
        if (scale) return { transform: "scale(1.7)", filter: "blur(3px)" };
        if (type) return {};
        return { transform: "translateY(10px)", ...(blur ? { filter: "blur(10px)" } : {}) };
      };
      const trans = (d) => {
        if (type) return "opacity 0s linear " + d + "s";
        if (flip) return "opacity .35s ease-out " + d + "s, transform .55s cubic-bezier(.16,1,.3,1) " + d + "s";
        if (scale) return "opacity .4s ease-out " + d + "s, transform .5s cubic-bezier(.16,1,.3,1) " + d + "s, filter .45s ease " + d + "s";
        return "opacity " + (blur ? ".7s" : ".3s") + " ease-out " + d + "s, transform " + (blur ? ".7s" : ".3s") + " cubic-bezier(.16,1,.3,1) " + d + "s" + (blur ? ", filter .8s ease " + d + "s" : "");
      };
      return React.createElement("h1", { className: h1Class, style: h1Style, "aria-label": fullText },
        words.map((word, wi) => {
          let gi = 0;
          const letters = word.map((c) => {
            const d = isIn ? li * STEP : 0;
            li++;
            const myGi = c.g ? gi++ : 0;
            return { ch: c.ch, g: c.g, d: d, gi: myGi };
          });
          li++;
          return React.createElement(React.Fragment, { key: idx + "-" + wi },
            React.createElement("span", { "aria-hidden": "true", style: { display: "inline-block", whiteSpace: "nowrap", ...(flip ? { perspective: 400 } : {}) } },
              letters.map((L, k) =>
                React.createElement("span", { key: k, style: {
                  display: "inline-block",
                  ...(flip ? { transformOrigin: "center bottom" } : {}),
                  opacity: isIn ? 1 : 0,
                  ...(isIn ? { transform: "none", filter: blur || scale ? "blur(0px)" : undefined } : hidden()),
                  transition: trans(L.d) + (L.g ? ", color .35s ease" : ""),
                  ...(L.g ? {
                    ...gradFill,
                    backgroundSize: totalGrad * 100 + "% 100%",
                    backgroundPosition: (totalGrad > 1 ? gg++ / (totalGrad - 1) * 100 : 0) + "% 0"
                  } : {})
                } }, L.ch)
              )
            ),
            wi < words.length - 1 ? React.createElement("span", { "aria-hidden": "true" }, " ") : null
          );
        })
      );
    }

    if (effect === "mask-rise") {
      const words = headlineWords(parts);
      return React.createElement("h1", { className: h1Class, style: h1Style, "aria-label": fullText },
        words.map((word, i) =>
          React.createElement("span", { key: idx + "-" + i, "aria-hidden": "true", style: { display: "inline-block", overflow: "hidden", verticalAlign: "bottom", whiteSpace: "pre", paddingBottom: "0.12em", marginBottom: "-0.12em" } },
            React.createElement("span", { style: {
              display: "inline-block",
              transform: isIn ? "none" : "translateY(115%)",
              transition: "transform .6s cubic-bezier(.16,1,.3,1) " + (isIn ? i * 0.055 : 0) + "s, color .35s ease",
              ...(word.some((c) => c.g) ? gradFill : {})
            } }, word.map((c) => c.ch).join("") + " ")
          )
        )
      );
    }

    if (effect === "word-cascade") {
      const words = headlineWords(parts);
      return React.createElement("h1", { className: h1Class, style: h1Style, "aria-label": fullText },
        words.map((word, i) =>
          React.createElement("span", { key: idx + "-" + i, style: {
            display: "inline-block",
            whiteSpace: "pre",
            opacity: isIn ? 1 : 0,
            transform: isIn ? "none" : "translateY(14px)",
            transition: "opacity .38s ease-out " + (isIn ? i * 0.04 : 0) + "s, transform .38s cubic-bezier(.16,1,.3,1) " + (isIn ? i * 0.04 : 0) + "s, color .35s ease",
            ...(word.some((c) => c.g) ? gradFill : {})
          } }, word.map((c) => c.ch).join("") + " ")
        )
      );
    }

    let anim;
    if (effect === "wipe") {
      anim = { clipPath: isIn ? "inset(-8px -8px -8px -8px)" : "inset(-8px 100% -8px -8px)", opacity: isIn ? 1 : 0,
        transition: "clip-path .45s cubic-bezier(.16,1,.3,1), opacity .45s ease" };
    } else if (effect === "tracking-in") {
      anim = { opacity: isIn ? 1 : 0, letterSpacing: isIn ? "-0.01em" : "0.14em", filter: isIn ? "blur(0px)" : "blur(8px)",
        transition: "opacity .6s ease-out, letter-spacing .8s cubic-bezier(.16,1,.3,1), filter .7s ease" };
    } else {
      anim = { opacity: isIn ? 1 : 0, transform: isIn ? "none" : "translateY(14px)",
        transition: "opacity .38s ease-out, transform .38s cubic-bezier(.16,1,.3,1)" };
    }
    return React.createElement("h1", { className: h1Class, style: { ...h1Style, ...anim } },
      parts.map((p, i) => p.g
        ? React.createElement("span", { key: i, style: { ...gradFill, transition: "color .35s ease" } }, p.t)
        : React.createElement(React.Fragment, { key: i }, p.t))
    );
  }

  window.RotatingHeadline = RotatingHeadline;
  window.GlassCursor = GlassCursor;
})();
