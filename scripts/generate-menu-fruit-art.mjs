import { mkdirSync, writeFileSync } from 'node:fs';

// Original vector artwork, shared between cards and kept local for mobile loading.
const leaf =
  '<path d="M58 28Q61 7 87 12Q84 33 58 28Z" fill="#49844b"/><path d="M60 27 79 17" fill="none" stroke="#d9e5b0"/>';
const citrus = (skin, flesh) =>
  `<ellipse cx="43" cy="61" rx="30" ry="34" transform="rotate(-25 43 61)" fill="${skin}"/>${leaf}<circle cx="76" cy="77" r="32" fill="${skin}"/><circle cx="76" cy="77" r="27" fill="#fff4ce"/><circle cx="76" cy="77" r="23" fill="${flesh}"/><path d="M76 54V100M53 77H99M60 61 92 93M60 93 92 61" fill="none" stroke="#fff4ce" stroke-width="2.3"/><circle cx="76" cy="77" r="3" fill="#fff4ce"/>`;
const berry = (x, y, r, color) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><path d="m${x - 7} ${y - 5} 5 2 2-6 3 5 5-1-3 5 2 4-6-1-4 3 1-6Z" fill="#294364" stroke="none"/>`;
const seeds = Array.from(
  { length: 16 },
  (_, i) =>
    `<ellipse cx="${55 + (i % 4) * 10}" cy="${48 + Math.floor(i / 4) * 11}" rx="2" ry="3" transform="rotate(${i * 19} ${55 + (i % 4) * 10} ${48 + Math.floor(i / 4) * 11})" fill="#634a32" stroke="none"/>`,
).join('');
const art = {
  limon: citrus('#83aa43', '#d7df6b'),
  naranja: citrus('#f2a13b', '#f6b956'),
  toronja: citrus('#e6ad55', '#ed9c91'),
  mandarina: `<path d="M62 38C82 28 103 43 102 68S80 101 60 97C37 104 15 89 17 64S39 29 62 38Z" fill="#efa34c"/><path d="M42 42C27 57 30 81 45 94M63 41C53 61 56 83 64 96M78 42C90 60 89 81 76 94" fill="none" stroke="#d98935"/>${leaf}`,
  fresa: `<path d="M60 35C79 21 108 38 99 63S74 104 61 112C43 101 24 82 18 59S40 24 60 35Z" fill="#dd6f6d"/><path d="m60 40-17-17 17 6 7-17 4 19 21-8-15 18 8 9-19-4-12 11 2-13-18 1Z" fill="#56834b"/>${[35, 50, 65, 80].flatMap((x, i) => [52, 69, 86].filter((y) => y < 100 - Math.abs(x - 60) * 0.35).map((y) => `<path d="m${x} ${y + (i % 2) * 5} 1 4" stroke="#f5d999" stroke-width="2.5"/>`)).join('')}`,
  blueberries: `${leaf}${berry(37, 69, 23, '#6f83ab')}${berry(78, 77, 24, '#6a77a5')}${berry(61, 42, 22, '#8193b6')}<path d="M48 35Q53 27 60 28M23 64Q23 53 32 52" stroke="#c6d3e2" fill="none" stroke-width="3"/>`,
  frambuesa: `${leaf}${[
    [60, 39],
    [44, 49],
    [76, 49],
    [34, 65],
    [54, 64],
    [78, 65],
    [42, 82],
    [63, 81],
    [57, 98],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#d78393" stroke="#a65c71"/>`)
    .join('')}<path d="m60 29-20-7 10 15-14 2 23 7 21-10-13-2 5-14Z" fill="#5e8858"/>`,
  mango: `<path d="M73 24C108 32 115 68 89 92S39 119 22 94 35 49 48 36 61 19 73 24Z" fill="#efb34d"/><path d="M64 32C34 52 28 75 29 89" stroke="#e48b58" stroke-width="13" fill="none" stroke-linecap="round"/>${leaf}<path d="M79 46Q102 62 80 85" fill="none" stroke="#f7d38b" stroke-width="3"/>`,
  maracuya: `<circle cx="39" cy="53" r="30" fill="#92718d"/>${leaf}<ellipse cx="77" cy="76" rx="32" ry="35" fill="#987789"/><ellipse cx="77" cy="76" rx="27" ry="30" fill="#fff0d1"/><ellipse cx="77" cy="76" rx="23" ry="26" fill="#eac263"/>${seeds}`,
  platano: `<path d="M27 28Q18 92 86 95L99 82Q47 99 37 32Z" fill="#e9c76a"/><path d="M42 21Q38 78 97 78L107 65Q65 77 52 25Z" fill="#f2d782"/><path d="m26 28 9-6 4 11-12 3M41 22l10-5 4 10-12 2M96 78l9-7 4 7-9 6M86 95l8-9 7 5-9 9" fill="#8f744b"/>`,
  coco: `<circle cx="40" cy="56" r="31" fill="#a47b5b"/><path d="M20 37 60 77M13 59l52-16M29 27l21 58" stroke="#876348" fill="none"/><ellipse cx="75" cy="78" rx="34" ry="31" fill="#89654e"/><ellipse cx="75" cy="75" rx="28" ry="26" fill="#f8eed9"/><ellipse cx="75" cy="76" rx="17" ry="16" fill="#ded2b7"/>`,
  pina: `<path d="M42 42 25 10 49 25 46 3 63 24 77 6 76 31 99 20 82 48Z" fill="#5f8c58"/><path d="M37 42Q60 32 86 46L96 82Q88 113 61 113T27 82Z" fill="#dfb963"/><path d="m32 54 53 47M29 71l40 39M45 42l49 44M31 91l50-47M42 107l50-47M60 111l35-34" fill="none" stroke="#c49449" stroke-width="2"/>`,
  guanabana: `<path d="M64 25C91 30 109 54 99 79S60 121 38 105 14 58 35 39 50 22 64 25Z" fill="#a2bb7a"/>${leaf}<path d="m42 42 3-6 4 5m18-2 4-6 4 7m9 17 5-5 2 7m-35 1 4-5 4 7m-23 9 4-4 3 7m29 9 4-6 2 8m-28 16 3-5 5 7m-11-34 3-6 4 7" fill="none" stroke="#688b53"/>`,
  guayaba: `<ellipse cx="40" cy="54" rx="29" ry="33" fill="#a6b775"/>${leaf}<ellipse cx="77" cy="78" rx="31" ry="34" fill="#9cac6d"/><ellipse cx="77" cy="78" rx="26" ry="29" fill="#f1bead"/><ellipse cx="77" cy="78" rx="16" ry="19" fill="#e7a18e"/>${[64, 75, 86].flatMap((x) => [66, 78, 89].map((y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#f8dfb2" stroke="none"/>`)).join('')}`,
  tamarindo: `<path d="M30 20C9 34 17 48 33 51 18 68 30 84 47 80 44 99 59 110 75 97 96 110 112 91 98 76 111 58 96 43 81 50 81 31 61 25 48 36 47 24 39 18 30 20Z" fill="#b29472"/><path d="M29 34Q43 44 48 54T69 76 91 87M37 57l13 1M59 82l7-10" stroke="#886e51" fill="none" stroke-width="2.5"/>`,
  jamaica: `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="60" cy="39" rx="22" ry="31" transform="rotate(${a} 60 63)" fill="#ba6a79" stroke="#9f596b"/>`).join('')}<circle cx="60" cy="63" r="13" fill="#854e62"/><path d="M60 63Q78 57 86 38" stroke="#e6bd87" stroke-width="4" fill="none"/><circle cx="86" cy="36" r="5" fill="#e6bd87"/>`,
  pepino: `<path d="M27 17Q40 5 54 21L95 85Q99 103 83 111T56 97L18 39Q13 25 27 17Z" fill="#80a66e"/><path d="m29 31 47 67m-38-76 45 64" fill="none" stroke="#578154"/><ellipse cx="55" cy="80" rx="30" ry="24" transform="rotate(-27 55 80)" fill="#5d8e58"/><ellipse cx="55" cy="80" rx="26" ry="20" transform="rotate(-27 55 80)" fill="#dde6b6"/><path d="m43 74 5 5m7-11 2 6m9 3-5 4m-13 7 6-1m5-8 1 7" stroke="#a4b980" stroke-width="3"/>`,
  menta: `<path d="M30 107 76 18M51 65 29 38M61 43 92 31M42 84 76 72" stroke="#5c8252" fill="none" stroke-width="3"/>${[
    [41, 57, -35],
    [59, 81, 40],
    [63, 34, -30],
    [82, 31, 45],
    [28, 35, -40],
  ]
    .map(
      ([x, y, a]) =>
        `<g transform="rotate(${a} ${x} ${y})"><path d="M${x} ${y + 17}Q${x - 22} ${y} ${x} ${y - 20}Q${x + 22} ${y} ${x} ${y + 17}Z" fill="#83a66f"/><path d="M${x} ${y + 12}V${y - 13}" fill="none" stroke="#dce5b7"/></g>`,
    )
    .join('')}`,
  romero: `<path d="M35 113 75 12" stroke="#758654" fill="none" stroke-width="3"/>${[28, 42, 56, 70, 84].map((y, i) => `<path d="M${69 - i * 5} ${y + 10}q-22-8-19-24M${69 - i * 5} ${y + 10}q22-1 24-17" stroke="#6f997d" fill="none" stroke-width="5" stroke-linecap="round"/>`).join('')}`,
  lavanda: `<path d="M34 113 70 20M52 113 92 39" stroke="#809475" fill="none" stroke-width="2.5"/>${Array.from({ length: 5 }, (_, i) => `<ellipse cx="${70 - i * 3}" cy="${24 + i * 10}" rx="9" ry="6" transform="rotate(30 ${70 - i * 3} ${24 + i * 10})" fill="#b5a1c8"/><ellipse cx="${82 - i * 4}" cy="${48 + i * 9}" rx="8" ry="5" fill="#9588b6"/>`).join('')}<path d="M42 89Q15 76 23 64Q43 66 47 82M52 84Q77 69 79 81Q70 94 48 95" fill="#8ca286"/>`,
  rosa: `<path d="M58 115 63 71" stroke="#719060" fill="none" stroke-width="3"/>${leaf}${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="61" cy="43" rx="24" ry="28" transform="rotate(${a} 61 60)" fill="#dba1ab" stroke="#bd7f90"/>`).join('')}<path d="M40 62Q40 37 66 43T81 72 48 82 43 57Q60 44 72 58T57 72 57 58" fill="#d18a9d" stroke="#ac7287"/>`,
  jengibre: `<path d="m29 88 17-25-13-22q-3-13 10-16 10-2 13 10l9 14 10-27q8-12 17-2 5 5 1 16L84 62l20 4q13 7 4 17-5 6-15 1l-21-4-20 27q-12 10-23-2Z" fill="#d1b78a"/><path d="m47 42 11-4m-9 23 11 5m13-29 12 4m-14 16 12 5m-35 23 10 7m31-21-3 11" fill="none" stroke="#a78c62"/>`,
  horchata: `<g transform="rotate(25 60 60)"><rect x="30" y="22" width="20" height="84" rx="7" fill="#b18560"/><rect x="54" y="16" width="22" height="86" rx="8" fill="#c4996e"/><path d="M37 29v67M61 24v67M70 26v66" stroke="#8f674b" fill="none"/><ellipse cx="40" cy="24" rx="9" ry="5" fill="#d6b995"/></g>${[
    [21, 85],
    [31, 103],
    [88, 91],
    [92, 72],
    [77, 107],
  ]
    .map(
      ([x, y]) =>
        `<ellipse cx="${x}" cy="${y}" rx="4" ry="9" transform="rotate(-35 ${x} ${y})" fill="#f0e2bd" stroke="#b8a47b"/>`,
    )
    .join('')}`,
  uva: `${leaf}${[
    [41, 45],
    [64, 43],
    [85, 49],
    [37, 66],
    [60, 64],
    [80, 71],
    [47, 86],
    [69, 90],
    [59, 106],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#95829e" stroke="#73667f"/>`)
    .join('')}`,
  hoja: `<path d="M28 106Q7 42 93 15Q119 84 28 106Z" fill="#a1b48c"/><path d="M30 101 87 23M44 84l-9-26m25 4 25-5M59 64l-7-25M72 45l22-4" stroke="#5f855d" fill="none" stroke-width="2"/>`,
};
const folder = new URL('../public/assets/illustrations/flavors/', import.meta.url);
mkdirSync(folder, { recursive: true });
for (const [name, shapes] of Object.entries(art)) {
  writeFileSync(
    new URL(name + '.svg', folder),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="#496347" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>\n`,
  );
}
console.log(`Generated ${Object.keys(art).length} original fruit illustrations.`);
