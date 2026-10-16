import { useNavigate } from "react-router-dom";
import { User, Store, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * ChooseLogin — same concept as ChooseRegister/hero:
 * warm cream base, orange/coral brand, Kanit display + Noto Sans Thai body,
 * soft blob background, lifted white cards with a colored icon badge.
 */
const ChooseLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="fd-login">
      <style>{`
        .fd-login {
          --cream: #FFF8F0;
          --orange: #FF6B35;
          --coral: #E8491D;
          --charcoal: #2A1B12;
          --gold: #FFC145;
          --herb: #5B8C5A;
          --herb-deep: #3F6B3F;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          font-family: 'Noto Sans Thai', sans-serif;
          color: var(--charcoal);
          background:
            radial-gradient(circle at 82% 8%, #FFEFDD 0%, transparent 55%),
            linear-gradient(180deg, #FFFCF7 0%, #FFF3E4 55%, #FFF8F0 100%);
        }
        .fd-login * { box-sizing: border-box; }

        .fd-login-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
        .fd-login-blob-1 { top: -160px; right: -140px; width: 460px; height: 460px; background: #FFD9A8; opacity: .5; }
        .fd-login-blob-2 { bottom: -180px; left: -160px; width: 420px; height: 420px; background: #FFE9D0; opacity: .55; }

        .fd-login-back {
          position: absolute; top: 28px; left: 28px; z-index: 5;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--charcoal);
          background: rgba(255,255,255,.8); backdrop-filter: blur(6px);
          border: 1px solid #FFE1BE; border-radius: 999px;
          padding: 8px 16px 8px 12px; text-decoration: none; cursor: pointer;
          transition: transform .2s ease, opacity .2s ease;
        }
          @media (max-width: 720px) {
  .fd-login-back {
    top: 30px;
    left: 12px;
    padding: 7px 12px 7px 10px;
    font-size: 12px;
    gap: 4px;
  }

  .fd-login-back svg {
    width: 13px;
    height: 13px;
  }
}
          
        .fd-login-back:hover { transform: translateX(-2px); opacity: .85; }
        .fd-login-back svg { width: 15px; height: 15px; }

        .fd-login-wrap { position: relative; z-index: 3; max-width: 780px; width: 100%; text-align: center; }

        .fd-login-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.8); backdrop-filter: blur(6px);
          border: 1px solid #FFD9A8; border-radius: 999px;
          padding: 7px 16px; font-size: 13px; font-weight: 600; color: var(--coral);
        }
          @media (max-width: 720px) {
  .fd-login {
    padding: 80px 16px 32px;
    align-items: flex-start;
  }

  .fd-login-wrap {
    margin-top: 12px;
  }
}

        .fd-login h1 {
          font-family: 'Kanit', sans-serif; font-weight: 800;
          font-size: clamp(2rem, 4.4vw, 2.9rem);
          line-height: 1.15; margin-top: 18px; color: var(--charcoal);
        }
        .fd-login-sub { margin-top: 12px; font-size: 1.02rem; color: #6B5647; line-height: 1.7; }

        .fd-login-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 22px;
          margin-top: 40px; text-align: left;
        }
        @media (max-width: 720px) { .fd-login-grid { grid-template-columns: 1fr; } }

        .fd-login-card {
          position: relative;
          background: white; border: 1px solid #FFE9D0; border-radius: 28px;
          padding: 34px 30px; cursor: pointer; text-align: center;
          box-shadow: 0 14px 30px -18px rgba(42,27,18,.3);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .fd-login-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 26px 42px -18px rgba(42,27,18,.32);
          border-color: var(--card-accent, var(--orange));
        }
        .fd-login-card:active { transform: translateY(-2px); }

        .fd-login-icon {
          width: 76px; height: 76px; margin: 0 auto 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--card-icon-bg);
          color: var(--card-accent);
        }

        .fd-login-card h2 {
          font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 1.3rem; color: var(--charcoal);
        }
        .fd-login-card p { margin-top: 8px; font-size: .92rem; color: #6B5647; line-height: 1.6; }

        .fd-login-cta {
          margin-top: 20px; display: inline-flex; align-items: center; gap: 6px;
          font-size: .88rem; font-weight: 700; color: var(--card-accent);
        }
        .fd-login-cta svg { width: 15px; height: 15px; transition: transform .2s ease; }
        .fd-login-card:hover .fd-login-cta svg { transform: translateX(4px); }

        .fd-login-footer { margin-top: 30px; font-size: .9rem; color: #6B5647; }
        .fd-login-footer button {
          background: none; border: none; padding: 0; cursor: pointer;
          font: inherit; font-weight: 700; color: var(--coral); text-decoration: underline;
        }

        @media (prefers-reduced-motion: reduce) {
          .fd-login *, .fd-login *::before, .fd-login *::after { transition: none !important; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
      />

      <div className="fd-login-blob fd-login-blob-1" />
      <div className="fd-login-blob fd-login-blob-2" />

      <button className="fd-login-back" onClick={() => navigate("/")}>
        <ArrowLeft />
        กลับหน้าหลัก
      </button>

      <div className="fd-login-wrap">
        <div className="fd-login-eyebrow">🍽 Food Delivery มมส</div>

        <h1>เข้าสู่ระบบในฐานะไหน?</h1>
        <p className="fd-login-sub">เลือกประเภทบัญชีของคุณเพื่อเข้าสู่ระบบ</p>

        <div className="fd-login-grid">
          {/* สมาชิก */}
          <button
            onClick={() => navigate("/userLogin")}
            className="fd-login-card"
            style={{ "--card-accent": "#FF6B35", "--card-icon-bg": "#FFEDD8" }}
          >
            <div className="fd-login-icon">
              <User size={34} strokeWidth={2.2} />
            </div>
            <h2>สมาชิก</h2>
            <p>เข้าสู่ระบบเพื่อสั่งอาหาร</p>
            <div className="fd-login-cta">
              เข้าสู่ระบบ <ArrowRight />
            </div>
          </button>

          {/* ร้านค้า */}
          <button
            onClick={() => navigate("/StoreLogin")}
            className="fd-login-card"
            style={{ "--card-accent": "#3F6B3F", "--card-icon-bg": "#E4EEDD" }}
          >
            <div className="fd-login-icon">
              <Store size={34} strokeWidth={2.2} />
            </div>
            <h2>ร้านอาหาร</h2>
            <p>เข้าสู่ระบบเพื่อจัดการร้านและออเดอร์ของคุณ</p>
            <div className="fd-login-cta">
              เข้าสู่ระบบ <ArrowRight />
            </div>
          </button>
        </div>

        <p className="fd-login-footer">
          ยังไม่มีบัญชี? <button onClick={() => navigate("/ChooseRegister")}>สมัครสมาชิก</button>
        </p>
      </div>
    </div>
  );
};

export default ChooseLogin;