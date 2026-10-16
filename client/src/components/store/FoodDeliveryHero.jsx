import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hero — Food Delivery มมส
 * Drop-in React version of the illustrated hero. Swap the two onClick
 * handlers for your real navigate("/ChooseRegister") / navigate("/ChooseLoing").
 * All styling lives in the <style> block below (plain CSS + keyframes,
 * not Tailwind) so animations/gradients transfer over untouched.
 */
export default function FoodDeliveryHero() {
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const illoRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const illo = illoRef.current;
    const blob = blobRef.current;
    if (!hero || !illo || !blob) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || window.innerWidth <= 900) return;

    const handleMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      illo.style.transform = `translate(${x * 14}px, ${y * 10}px)`;
      blob.style.transform = `translate(${x * -20}px, ${y * -14}px)`;
    };

    hero.addEventListener("mousemove", handleMove);
    return () => hero.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section className="fd-hero" ref={heroRef}>
      <style>{`
        .fd-hero {
          --cream: #FFF8F0;
          --peach: #FFE4C4;
          --orange: #FF6B35;
          --coral: #E8491D;
          --charcoal: #2A1B12;
          --gold: #FFC145;
          --cocoa: #8A6A54;

          position: relative;
          min-height: 100vh;
          background:
            radial-gradient(circle at 78% 12%, #FFEFDD 0%, transparent 55%),
            linear-gradient(180deg, #FFFCF7 0%, #FFF3E4 55%, #FFF8F0 100%);
          overflow: hidden;
          font-family: 'Noto Sans Thai', sans-serif;
          color: var(--charcoal);
        }
        .fd-hero * { box-sizing: border-box; }

        .fd-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
        .fd-blob-1 { top: -180px; right: -160px; width: 520px; height: 520px; background: #FFD9A8; opacity: .55; }
        .fd-blob-2 { top: 260px; left: -180px; width: 380px; height: 380px; background: #FFE9D0; opacity: .6; }

        .fd-topbar { position: relative; z-index: 5; max-width: 1240px; margin: 0 auto; padding: 28px 32px 0; display: flex; align-items: center; justify-content: space-between; }
        .fd-logo { display: flex; align-items: center; gap: 10px; }
        .fd-logo-mark { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, var(--orange), var(--coral)); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Kanit', sans-serif; font-weight: 800; font-size: 16px; box-shadow: 0 8px 18px -6px rgba(232,73,29,.55); }
        .fd-logo-text { font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 15px; color: var(--charcoal); }
        .fd-logo-text span { color: var(--coral); }
        .fd-topbar-link { font-size: 14px; font-weight: 500; color: var(--charcoal); text-decoration: none; opacity: .75; background: none; border: none; cursor: pointer; font-family: inherit; }
        .fd-topbar-link:hover { opacity: 1; }

        .fd-content { position: relative; z-index: 3; max-width: 1240px; margin: 0 auto; padding: 56px 32px 40px; display: grid; grid-template-columns: 1.05fr 1fr; gap: 40px; align-items: center; min-height: calc(100vh - 90px); }
        @media (max-width: 900px) {
          .fd-content { grid-template-columns: 1fr; text-align: center; padding-top: 24px; }
          .fd-actions, .fd-pill-row { justify-content: center; }
        }

        .fd-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.8); backdrop-filter: blur(6px); border: 1px solid #FFD9A8; border-radius: 999px; padding: 7px 16px; font-size: 13px; font-weight: 600; color: var(--coral); }
        .fd-eyebrow svg { width: 15px; height: 15px; }

        .fd-hero h1 { font-family: 'Kanit', sans-serif; font-weight: 800; font-size: clamp(2.6rem, 5.2vw, 4.3rem); line-height: 1.08; letter-spacing: -0.01em; color: var(--charcoal); margin-top: 22px; }
        .fd-accent { position: relative; color: var(--orange); display: inline-block; }
        .fd-squiggle { position: absolute; left: 0; bottom: -10px; width: 100%; height: 16px; stroke: var(--gold); stroke-width: 6; fill: none; stroke-linecap: round; stroke-dasharray: 240; stroke-dashoffset: 240; animation: fd-draw 1.1s .5s ease-out forwards; }

        .fd-subcopy { margin-top: 22px; font-size: 1.08rem; line-height: 1.85; color: #6B5647; max-width: 480px; }
        @media (max-width: 900px) { .fd-subcopy { margin-left: auto; margin-right: auto; } }

        .fd-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 34px; }
        .fd-btn { font-family: 'Noto Sans Thai', sans-serif; font-weight: 700; font-size: 15.5px; padding: 16px 34px; border-radius: 16px; border: none; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
        .fd-btn-primary { background: linear-gradient(135deg, var(--orange), var(--coral)); color: white; box-shadow: 0 14px 28px -10px rgba(232,73,29,.55); }
        .fd-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 18px 34px -8px rgba(232,73,29,.65); }
        .fd-btn-secondary { background: var(--charcoal); color: white; box-shadow: 0 10px 22px -10px rgba(42,27,18,.45); }
        .fd-btn-secondary:hover { transform: translateY(-3px); background: #3d2a1c; }
        .fd-btn:active { transform: translateY(0); }

        .fd-pill-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
        .fd-pill { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #FFE1BE; border-radius: 999px; padding: 8px 14px; font-size: 12.5px; font-weight: 500; color: #6B5647; box-shadow: 0 6px 14px -10px rgba(42,27,18,.25); }
        .fd-pill svg { width: 14px; height: 14px; color: var(--orange); flex-shrink: 0; }

        .fd-illo-wrap { position: relative; display: flex; justify-content: center; }
        .fd-illo-wrap svg.fd-scene { width: 100%; max-width: 620px; }

        .fd-float-card { position: absolute; bottom: 6%; left: 4%; background: white; border-radius: 18px; padding: 12px 18px 12px 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 20px 40px -16px rgba(42,27,18,.35); border: 1px solid #FFE9D0; animation: fd-cardFloat 4s ease-in-out infinite; }
        @media (max-width: 900px) { .fd-float-card { position: static; margin: 18px auto 0; width: fit-content; } }
        .fd-float-card .fd-icon-circle { width: 40px; height: 40px; border-radius: 50%; background: #FFEDD8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fd-float-card .fd-icon-circle svg { width: 18px; height: 18px; color: var(--orange); }
        .fd-float-card p { font-family: 'Kanit', sans-serif; font-weight: 600; font-size: 14.5px; color: var(--charcoal); margin: 0; }
        .fd-float-card span { font-size: 12px; color: #8A6A54; }

        .fd-scroll-cue { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); z-index: 4; animation: fd-bounce 1.8s infinite; }
        .fd-scroll-cue svg { width: 26px; height: 26px; color: var(--orange); }

        @keyframes fd-draw { to { stroke-dashoffset: 0; } }
        @keyframes fd-bounce { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 10px); } }
        @keyframes fd-cardFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fd-riderBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes fd-floatItem { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-16px) rotate(2deg); } }
        @keyframes fd-twinkle { 0%,100% { opacity: .25; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes fd-dashMove { to { stroke-dashoffset: -60; } }

        .fd-g-rider { animation: fd-riderBob 2.4s ease-in-out infinite; transform-origin: center; }
        .fd-g-bowl { animation: fd-floatItem 3.4s ease-in-out infinite; transform-origin: center; }
        .fd-g-cup { animation: fd-floatItem 3.8s ease-in-out infinite .4s; transform-origin: center; }
        .fd-g-motion path { stroke-dasharray: 14 10; animation: fd-dashMove 1s linear infinite; }
        .fd-g-road .fd-dashline { stroke-dasharray: 16 14; animation: fd-dashMove 1.4s linear infinite; }
        .fd-sparkle { animation: fd-twinkle 2.2s ease-in-out infinite; transform-origin: center; }
        .fd-sparkle:nth-child(2) { animation-delay: .5s; }
        .fd-sparkle:nth-child(3) { animation-delay: 1s; }
        .fd-sparkle:nth-child(4) { animation-delay: 1.5s; }

        @media (prefers-reduced-motion: reduce) {
          .fd-hero *, .fd-hero *::before, .fd-hero *::after { animation: none !important; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
      />

      <div className="fd-blob fd-blob-1" ref={blobRef} />
      <div className="fd-blob fd-blob-2" />

      <div className="fd-topbar">
        <div className="fd-logo">
          <div className="fd-logo-mark">RF</div>
          <div className="fd-logo-text">
            RobMorFood 
          </div>
        </div>
      </div>

      <div className="fd-content">
        {/* copy */}
        <div>
          <div className="fd-eyebrow">
            🍽 Food Delivery มมส
          </div>

          <h1>
            สั่งอาหาร<br />
            <span className="fd-accent">
              ส่งถึงหน้าหอ
              <svg className="fd-squiggle" viewBox="0 0 200 16" preserveAspectRatio="none">
                <path d="M2 10 Q 25 2, 50 10 T 100 10 T 150 10 T 198 8" />
              </svg>
            </span>
          </h1>

          <p className="fd-subcopy">
            รวมร้านอาหารรอบมหาวิทยาลัยมหาสารคามไว้ในที่เดียว
            สั่งง่าย จ่ายผ่านพร้อมเพย์ ให้ไรเดอร์ส่งถึงหน้าหอของคุณ
          </p>

          <div className="fd-actions">
            <button className="fd-btn fd-btn-primary" onClick={() => navigate("/ChooseRegister")}>
              สมัครสมาชิก
            </button>
            <button className="fd-btn fd-btn-secondary" onClick={() => navigate("/ChooseLoing")}>
              เข้าสู่ระบบ
            </button>
          </div>

          
        </div>

        {/* illustration */}
        <div className="fd-illo-wrap">
          <svg className="fd-scene" ref={illoRef} viewBox="0 0 700 560">
            <defs>
              <radialGradient id="fdSunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFC145" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFC145" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="fdVisorGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE9BE" />
                <stop offset="100%" stopColor="#FFC145" />
              </linearGradient>
              <linearGradient id="fdCupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF3E4" />
                <stop offset="100%" stopColor="#FFD9A8" />
              </linearGradient>
            </defs>

            <circle cx="520" cy="150" r="230" fill="url(#fdSunGlow)" />

            <g opacity="0.9">
              <rect x="30" y="270" width="86" height="180" rx="6" fill="#F3D9BC" opacity=".55" />
              <rect x="48" y="290" width="14" height="14" fill="#FFC145" opacity=".5" />
              <rect x="76" y="290" width="14" height="14" fill="#FFC145" opacity=".5" />
              <rect x="48" y="316" width="14" height="14" fill="#FFC145" opacity=".4" />
              <rect x="76" y="316" width="14" height="14" fill="#FFC145" opacity=".4" />

              <rect x="130" y="235" width="70" height="215" rx="6" fill="#EFCBA6" opacity=".6" />
              <rect x="146" y="256" width="12" height="12" fill="#FFC145" opacity=".5" />
              <rect x="168" y="256" width="12" height="12" fill="#FFC145" opacity=".5" />
              <rect x="146" y="280" width="12" height="12" fill="#FFC145" opacity=".4" />
              <rect x="168" y="280" width="12" height="12" fill="#FFC145" opacity=".4" />

              <rect x="560" y="260" width="96" height="190" rx="6" fill="#F3D9BC" opacity=".5" />
            </g>

            <g className="fd-g-road">
              <rect x="0" y="452" width="700" height="46" fill="#3A281C" opacity=".14" />
              <line className="fd-dashline" x1="0" y1="475" x2="700" y2="475" stroke="#FFFFFF" strokeWidth="4" opacity=".5" />
            </g>

            <g fill="#FFC145">
              <path className="fd-sparkle" d="M170 120 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 z" />
              <path className="fd-sparkle" d="M600 340 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
              <path className="fd-sparkle" d="M110 380 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
              <path className="fd-sparkle" d="M470 90 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
            </g>

            <g className="fd-g-motion" fill="none" strokeLinecap="round">
              <path d="M20 210 Q100 210 150 210" stroke="#FFC145" strokeWidth="6" opacity=".55" />
              <path d="M0 270 Q95 270 160 270" stroke="#FF6B35" strokeWidth="6" opacity=".6" />
              <path d="M35 330 Q110 330 165 330" stroke="#FFC145" strokeWidth="6" opacity=".4" />
            </g>

            <g className="fd-g-bowl" transform="translate(90,150)">
              <ellipse cx="0" cy="34" rx="10" ry="3" fill="#2A1B12" opacity=".12" />
              <path d="M-38 10 a38 20 0 0 0 76 0 z" fill="#FFF3E4" stroke="#2A1B12" strokeWidth="3" />
              <path d="M-38 10 a38 20 0 0 0 76 0" fill="none" stroke="#2A1B12" strokeWidth="3" />
              <path d="M-24 8 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="none" stroke="#E8491D" strokeWidth="4" strokeLinecap="round" />
              <line x1="14" y1="-6" x2="26" y2="-30" stroke="#8A6A54" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="-4" x2="34" y2="-26" stroke="#8A6A54" strokeWidth="3" strokeLinecap="round" />
              <path d="M-6 -8 C-10 -18 -2 -22 -6 -32" stroke="#FFD9A8" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".9" />
              <path d="M8 -8 C4 -18 12 -22 8 -32" stroke="#FFD9A8" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".9" />
            </g>

            <g className="fd-g-cup" transform="translate(560,190)">
              <path d="M-16 -20 L16 -20 L12 32 L-12 32 Z" fill="url(#fdCupGrad)" stroke="#2A1B12" strokeWidth="3" />
              <rect x="-18" y="-26" width="36" height="8" rx="3" fill="#2A1B12" />
              <line x1="4" y1="-34" x2="4" y2="-24" stroke="#2A1B12" strokeWidth="3" strokeLinecap="round" />
              <circle cx="-4" cy="24" r="3" fill="#2A1B12" />
              <circle cx="4" cy="26" r="3" fill="#2A1B12" />
              <circle cx="0" cy="20" r="3" fill="#2A1B12" />
            </g>

            <g className="fd-g-rider" transform="translate(0,10)">
              <ellipse cx="345" cy="452" rx="150" ry="14" fill="#2A1B12" opacity=".1" />

              <circle cx="255" cy="418" r="40" fill="#2A1B12" />
              <circle cx="255" cy="418" r="17" fill="#FFF8F0" />
              <circle cx="440" cy="418" r="40" fill="#2A1B12" />
              <circle cx="440" cy="418" r="17" fill="#FFF8F0" />

              <path
                d="M222 418
                   C222 368 256 340 304 338
                   C332 336 342 320 366 306
                   C390 292 418 297 438 320
                   L438 368
                   C420 368 402 386 384 396
                   C346 412 278 418 222 418 Z"
                fill="#FF6B35"
              />
              <path d="M304 338 C328 336 342 328 356 318" stroke="#E8491D" strokeWidth="8" strokeLinecap="round" />

              <path d="M422 320 L440 272" stroke="#2A1B12" strokeWidth="8" strokeLinecap="round" />
              <circle cx="441" cy="268" r="8" fill="#2A1B12" />
              <circle cx="450" cy="328" r="9" fill="#FFC145" />

              <rect x="160" y="262" width="92" height="82" rx="12" fill="#2A1B12" />
              <rect x="160" y="262" width="92" height="15" rx="7" fill="#3d2a1c" />
              <path d="M176 262 L176 248 M236 262 L236 248" stroke="#FFC145" strokeWidth="5" strokeLinecap="round" />
              <path d="M190 248 C186 238 196 233 192 223" stroke="#FFD9A8" strokeWidth="5" strokeLinecap="round" opacity=".85" />
              <path d="M214 248 C210 236 220 231 216 219" stroke="#FFD9A8" strokeWidth="5" strokeLinecap="round" opacity=".85" />

              <path d="M306 338 C316 368 336 384 362 390" stroke="#2A1B12" strokeWidth="16" strokeLinecap="round" />
              <path d="M362 390 C372 388 382 383 389 373" stroke="#2A1B12" strokeWidth="16" strokeLinecap="round" />

              <path d="M300 330 C305 292 324 262 358 247" stroke="#FF6B35" strokeWidth="30" strokeLinecap="round" />
              <path d="M296 306 C276 311 260 320 250 335" stroke="#E8491D" strokeWidth="14" strokeLinecap="round" opacity=".88" />
              <path d="M352 262 C378 267 402 277 426 292" stroke="#FF6B35" strokeWidth="16" strokeLinecap="round" />

              <circle cx="367" cy="222" r="28" fill="#2A1B12" />
              <path d="M342 220 A28 28 0 0 1 394 220" fill="url(#fdVisorGrad)" />
              <rect x="354" y="222" width="34" height="14" rx="7" fill="#5C4636" />
            </g>
          </svg>

          
        </div>
      </div>

      <div className="fd-scroll-cue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}