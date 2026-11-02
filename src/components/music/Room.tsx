/**
 * La habitación: escena ilustrada original (SVG + CSS), sin imágenes de terceros.
 * Pared verde profundo con boiserie, suelo de madera, ventana con cortinas y luz cálida,
 * lámpara de pie, estantería de vinilos, tocadiscos, marcos y alfombra.
 * Tres capas con paralaje suave según el cursor (variables --px / --py).
 */

const VINYL_COLORS = ["#c99a4b", "#e07a5f", "#8fb8de", "#f0ebe0", "#1d1d1d", "#7a2a38", "#c7c07a", "#4b6f8a"];

function vinyls(x0: number, baseY: number, count: number, seed: number) {
  let x = x0;
  return Array.from({ length: count }, (_, i) => {
    const w = 12 + ((i * 7 + seed) % 5) * 3;
    const h = 96 + ((i * 11 + seed * 3) % 6) * 6;
    const el = (
      <g key={`${seed}-${i}`}>
        <rect x={x} y={baseY - h} width={w} height={h} rx="1.5" fill={VINYL_COLORS[(i * 3 + seed) % VINYL_COLORS.length]} />
        <rect x={x + 2} y={baseY - h + 10} width={Math.max(w - 4, 4)} height="3" fill="rgba(0,0,0,.35)" />
      </g>
    );
    x += w + 3;
    return el;
  });
}

const planks = Array.from({ length: 17 }, (_, i) => -1600 + i * 200);
const panels = Array.from({ length: 9 }, (_, i) => 30 + i * 180);

function Frame({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: React.ReactNode }) {
  return (
    <g>
      <rect x={x + 5} y={y + 8} width={w} height={h} fill="rgba(0,0,0,.35)" />
      <rect x={x} y={y} width={w} height={h} fill="url(#wood)" stroke="#2a1a10" strokeWidth="2" />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill="#e9dcc0" />
      <svg x={x + 24} y={y + 24} width={w - 48} height={h - 48} viewBox="0 0 100 100" preserveAspectRatio="none">
        {children}
      </svg>
    </g>
  );
}

export function Room() {
  return (
    <div className="room__scene" aria-hidden>
      <svg className="room__svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f4742" />
            <stop offset="1" stopColor="#12292b" />
          </linearGradient>
          <pattern id="stripes" width="64" height="10" patternUnits="userSpaceOnUse">
            <rect width="2" height="10" fill="rgba(255,255,255,.045)" />
          </pattern>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f1b0f" />
            <stop offset="1" stopColor="#6d4527" />
          </linearGradient>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b4428" />
            <stop offset="1" stopColor="#47291a" />
          </linearGradient>
          <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0cf8a" />
            <stop offset="1" stopColor="#a8773a" />
          </linearGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3358" />
            <stop offset=".5" stopColor="#d9724f" />
            <stop offset="1" stopColor="#ffd08a" />
          </linearGradient>
          <linearGradient id="curtain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f1620" />
            <stop offset=".5" stopColor="#7d2b3a" />
            <stop offset="1" stopColor="#3f1620" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd9a0" stopOpacity=".26" />
            <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="#ffd79a" stopOpacity=".75" />
            <stop offset=".45" stopColor="#ffb865" stopOpacity=".22" />
            <stop offset="1" stopColor="#ffb865" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rug" cx=".5" cy=".5" r=".6">
            <stop offset="0" stopColor="#8a3040" />
            <stop offset="1" stopColor="#4c1824" />
          </radialGradient>
        </defs>

        {/* ── Capa lejana: pared, boiserie, ventana, marcos, estantería ── */}
        <g className="room__layer room__layer--far">
          <rect x="-40" y="-20" width="1680" height="730" fill="url(#wall)" />
          <rect x="-40" y="-20" width="1680" height="730" fill="url(#stripes)" />
          <rect x="-40" y="-20" width="1680" height="58" fill="#2a1a10" />
          <rect x="-40" y="38" width="1680" height="6" fill="url(#brass)" opacity=".55" />
          <rect x="-40" y="44" width="1680" height="60" fill="#000" opacity=".16" />

          <rect x="-40" y="538" width="1680" height="170" fill="#0f2628" />
          <rect x="-40" y="532" width="1680" height="10" fill="#4b3220" />
          <rect x="-40" y="532" width="1680" height="2" fill="rgba(255,225,170,.35)" />
          {panels.map((x) => (
            <rect key={x} x={x} y="564" width="150" height="104" rx="3" fill="none" stroke="rgba(201,154,75,.35)" strokeWidth="2" />
          ))}
          <rect x="-40" y="676" width="1680" height="28" fill="#2a1a10" />
          <rect x="-40" y="676" width="1680" height="3" fill="rgba(255,225,170,.25)" />

          {/* Ventana */}
          <g transform="translate(310 130) scale(.9)">
            <polygon points="14,14 286,14 640,590 330,590" fill="url(#beam)" opacity=".9" className="room__beam" />
            <rect x="-6" y="-6" width="312" height="392" fill="#24160d" />
            <rect x="8" y="8" width="284" height="364" fill="url(#sky)" />
            <circle cx="150" cy="300" r="48" fill="#ffe6b0" opacity=".9" />
            <path d="M8 372V300h30v-40h24v60h22v-90h30v110h28v-70h26v50h30v-30h30v72z" fill="#2b1c33" opacity=".92" />
            <rect x="143" y="8" width="14" height="364" fill="#24160d" />
            <rect x="8" y="183" width="284" height="14" fill="#24160d" />
            <rect x="-18" y="384" width="336" height="20" fill="url(#wood)" />
            <rect x="-18" y="384" width="336" height="3" fill="rgba(255,225,170,.4)" />
            <path d="M-60 -34H78C68 120 92 280 46 410H-60Z" fill="url(#curtain)" />
            <path d="M-20 -30C-14 130 -26 280 -20 410M20 -30C30 130 14 280 28 410" stroke="rgba(0,0,0,.28)" strokeWidth="5" fill="none" />
            <path d="M360 -34H222C232 120 208 280 254 410H360Z" fill="url(#curtain)" />
            <path d="M320 -30C314 130 326 280 320 410M280 -30C270 130 286 280 272 410" stroke="rgba(0,0,0,.28)" strokeWidth="5" fill="none" />
            <rect x="-80" y="-44" width="460" height="10" rx="5" fill="url(#brass)" />
            <circle cx="-80" cy="-39" r="9" fill="url(#brass)" />
            <circle cx="380" cy="-39" r="9" fill="url(#brass)" />
          </g>

          {/* Marcos */}
          <Frame x={712} y={96} w={128} h={166}>
            <rect width="100" height="100" fill="#d9c9a6" />
            <circle cx="50" cy="40" r="26" fill="#c25a3c" />
            <rect x="12" y="72" width="76" height="8" fill="#1f4742" />
          </Frame>
          <Frame x={868} y={110} w={176} h={124}>
            <rect width="100" height="100" fill="#1f4742" />
            <path d="M0 70C20 40 40 90 60 60S90 40 100 60V100H0Z" fill="#e8b86a" />
          </Frame>
          <Frame x={1070} y={90} w={96} h={96}>
            <rect width="100" height="100" fill="#efe3c8" />
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="#7d2b3a" strokeWidth="9" />
          </Frame>

          {/* Estantería de vinilos */}
          <g transform="translate(1222 140)">
            <rect x="-12" y="0" width="14" height="420" fill="url(#wood)" />
            <rect x="338" y="0" width="14" height="420" fill="url(#wood)" />
            <rect x="0" y="0" width="338" height="420" fill="#0b1c1d" opacity=".75" />
            {[130, 270, 410].map((y) => (
              <g key={y}>
                <rect x="-12" y={y} width="364" height="14" fill="url(#wood)" />
                <rect x="-12" y={y} width="364" height="2" fill="rgba(255,225,170,.4)" />
              </g>
            ))}
            {vinyls(14, 130, 17, 1)}
            {vinyls(14, 270, 16, 4)}
            <g>
              <rect x="30" y="288" width="100" height="120" fill="#e9dcc0" />
              <circle cx="80" cy="338" r="30" fill="#c25a3c" />
              <rect x="42" y="378" width="76" height="6" fill="#1f4742" />
            </g>
            <rect x="170" y="324" width="56" height="86" rx="4" fill="url(#brass)" />
            <circle cx="198" cy="364" r="14" fill="#2a1a10" />
            <path d="M250 410c-12-40-4-80 14-96 6 30 24 40 24 66 0 12-6 22-16 30z" fill="#2f6b4a" />
            <path d="M278 410c14-34 10-70-8-92 14 14 40 34 34 66-2 10-10 20-26 26z" fill="#3d8a5c" />
            <rect x="244" y="396" width="64" height="14" rx="3" fill="#7d2b3a" />
          </g>
        </g>

        {/* ── Capa media: lámpara y mueble del tocadiscos ── */}
        <g className="room__layer room__layer--mid">
          {/* Aparador con tocadiscos */}
          <g transform="translate(1120 576)">
            <rect x="0" y="20" width="450" height="104" fill="url(#wood)" />
            <rect x="0" y="20" width="450" height="4" fill="rgba(255,225,170,.45)" />
            <rect x="14" y="124" width="12" height="40" fill="#2a1a10" />
            <rect x="424" y="124" width="12" height="40" fill="#2a1a10" />
            {[24, 168, 312].map((x) => (
              <g key={x}>
                <rect x={x} y="36" width="114" height="76" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="3" />
                <circle cx={x + 57} cy="74" r="5" fill="url(#brass)" />
              </g>
            ))}
            <rect x="24" y="-14" width="250" height="34" rx="3" fill="#1b110a" />
            <ellipse cx="124" cy="-14" rx="98" ry="12" fill="#0e0e0e" />
            <ellipse cx="124" cy="-14" rx="26" ry="4" fill="#c25a3c" />
            <ellipse cx="124" cy="-15" rx="4" ry="1.4" fill="#f0e6d0" />
            <path d="M232 -28 164 -16" stroke="url(#brass)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="236" cy="-30" r="7" fill="url(#brass)" />
            <rect x="312" y="-46" width="112" height="66" rx="4" fill="#2a1a10" />
            <circle cx="368" cy="-13" r="22" fill="#14100c" stroke="#a8773a" strokeWidth="3" />
            <circle cx="368" cy="-13" r="8" fill="#3a2d22" />
          </g>

          {/* Lámpara de pie */}
          <g transform="translate(165 0)">
            <circle cx="0" cy="290" r="360" fill="url(#lampGlow)" className="room__lamp" />
            <ellipse cx="0" cy="702" rx="46" ry="9" fill="#14100c" />
            <rect x="-3" y="330" width="6" height="372" fill="url(#brass)" />
            <path d="M-62 336 -42 238H42L62 336Z" fill="#f1d9a2" />
            <path d="M-62 336 -42 238H42L62 336Z" fill="url(#lampGlow)" opacity=".9" />
            <rect x="-42" y="236" width="84" height="5" fill="url(#brass)" />
          </g>
        </g>

        {/* ── Capa cercana: suelo y alfombra ── */}
        <g className="room__layer room__layer--near">
          <rect x="-40" y="702" width="1680" height="220" fill="url(#floor)" />
          {planks.map((xb) => (
            <line key={xb} x1={800 + (xb - 800) * 0.619} y1="702" x2={xb} y2="920" stroke="rgba(0,0,0,.3)" strokeWidth="2" />
          ))}
          {[736, 776, 828, 892].map((y) => (
            <line key={y} x1="-40" y1={y} x2="1640" y2={y} stroke="rgba(0,0,0,.16)" strokeWidth="2" />
          ))}
          <ellipse cx="800" cy="812" rx="560" ry="82" fill="rgba(0,0,0,.3)" />
          <polygon points="360,770 1240,770 1400,890 200,890" fill="url(#rug)" />
          <polygon points="392,780 1208,780 1350,880 250,880" fill="none" stroke="#e8c98a" strokeWidth="3" opacity=".7" />
          <polygon points="430,788 1170,788 1296,872 304,872" fill="none" stroke="#e8c98a" strokeWidth="1.5" opacity=".45" strokeDasharray="10 8" />
        </g>
      </svg>

      <div className="room__dust">
        {Array.from({ length: 16 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--x": `${(i * 53 + 9) % 100}%`,
                "--y": `${(i * 37 + 15) % 70}%`,
                "--d": `${9 + (i % 7) * 2.2}s`,
                "--s": `${2 + (i % 3)}px`,
                animationDelay: `${-i * 1.3}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
