/* Discount Vai · shared dummy catalogue and helpers for every artboard.
   Placeholder data only. Prices in Taka; sale price in `s`. */
(function () {
  var SIL = {
    panjabi: 'M37 14 L45 11 Q50 17 55 11 L63 14 L77 21 L86 74 L77 76 L70 38 L71 116 L29 116 L30 38 L23 76 L14 74 L23 21 Z M49.2 16 L50.8 16 L50.8 44 L49.2 44 Z',
    tee: 'M31 24 L42 19 Q50 26 58 19 L69 24 L87 38 L79 51 L70 45 L70 102 L30 102 L30 45 L21 51 L13 38 Z',
    jersey: 'M31 24 L43 19 L50 30 L57 19 L69 24 L86 36 L78 48 L70 43 L70 102 L30 102 L30 43 L22 48 L14 36 Z',
    jacket: 'M33 21 L44 17 L50 23 L56 17 L67 21 L80 29 L87 86 L77 88 L70 44 L70 100 L30 100 L30 44 L23 88 L13 86 L20 29 Z M49.3 23 L50.7 23 L50.7 100 L49.3 100 Z',
    trouser: 'M32 12 L68 12 L73 116 L56 116 L50 44 L44 116 L27 116 Z',
    shorts: 'M29 32 L71 32 L75 86 L54 88 L50 58 L46 88 L25 86 Z',
    half: 'M30 34 L70 34 L73 80 L54 82 L50 58 L46 82 L27 80 Z',
    three4: 'M31 18 L69 18 L73 100 L55 100 L50 52 L45 100 L27 100 Z',
    tote: 'M27 50 L73 50 L77 112 L23 112 Z M38 50 Q38 25 50 25 Q62 25 62 50 L58 50 Q58 30 50 30 Q42 30 42 50 Z',
    backpack: 'M29 36 Q29 22 50 22 Q71 22 71 36 L73 110 L27 110 Z M44 22 Q44 12 50 12 Q56 12 56 22 L53 22 Q53 15.5 50 15.5 Q47 15.5 47 22 Z M36 76 L64 76 L64 100 L36 100 Z',
    sling: 'M28 62 Q28 54 36 54 L64 54 Q72 54 72 62 L72 98 Q72 106 64 106 L36 106 Q28 106 28 98 Z M33 54 L66 12 L69.5 14.5 L38 54 Z',
    duffel: 'M18 58 Q18 48 28 48 L72 48 Q82 48 82 58 L82 96 Q82 104 74 104 L26 104 Q18 104 18 96 Z M38 48 Q38 32 50 32 Q62 32 62 48 L58 48 Q58 36 50 36 Q42 36 42 48 Z',
    waist: 'M18 70 Q18 58 32 58 L68 58 Q82 58 82 70 Q82 84 68 86 L32 86 Q18 84 18 70 Z M6 66 L18 66 L18 72 L6 72 Z M82 66 L94 66 L94 72 L82 72 Z'
  };
  var TYPE = { panjabi: 'Panjabi', tee: 'Drop tee', jersey: 'Club jersey', jacket: 'Jacket', trouser: 'Trousers', shorts: 'Shorts', half: '2/4 pant', three4: '3/4 pant', tote: 'Tote bag', backpack: 'Backpack', sling: 'Sling bag', duffel: 'Duffel bag', waist: 'Waist bag' };
  var B = 'One size';
  var CAT = {
    1: { n: 'Slim Fit Cotton Chino', c: 'Khaki', k: 'trouser', p: 1850, s: 1450, f: '#B9A57E', sw: ['#B9A57E', '#2F3B4C', '#3B3B39'], z: '28–40' },
    2: { n: 'Relaxed Twill Trouser', c: 'Charcoal', k: 'trouser', p: 1950, f: '#47484C', sw: ['#47484C', '#B9A57E'], z: '28–40' },
    3: { n: 'Everyday Cotton Shorts', c: 'Navy', k: 'shorts', p: 890, s: 690, f: '#2E3B57', sw: ['#2E3B57', '#7C8A6A', '#D8D2C4'] },
    4: { n: 'Drawstring Linen-Blend Shorts', c: 'Olive', k: 'shorts', p: 990, f: '#737A52', sw: ['#737A52', '#D9CFBA'] },
    5: { n: 'Cargo 3/4 Pant', c: 'Stone', k: 'three4', p: 1150, s: 950, f: '#BDB4A3', sw: ['#BDB4A3', '#3C3C3A', '#6E7550'], nw: 1 },
    6: { n: 'Jogger 3/4 Pant', c: 'Black', k: 'three4', p: 1050, f: '#2B2B2C', sw: ['#2B2B2C', '#7D7F84'] },
    7: { n: 'Cotton Half Pant', c: 'Grey Melange', k: 'half', p: 750, s: 590, f: '#A9A9A6', sw: ['#A9A9A6', '#2E3B57', '#2B2B2C'] },
    8: { n: 'Printed Half Pant', c: 'Teal', k: 'half', p: 790, f: '#3E7A78', sw: ['#3E7A78', '#C7B79A'] },
    9: { n: 'Home Club Jersey 25/26', c: 'Red/White', k: 'jersey', p: 1250, f: '#B5524A', sw: ['#B5524A'] },
    10: { n: 'Away Club Jersey 25/26', c: 'Sky Blue', k: 'jersey', p: 1250, s: 1050, f: '#8DB3D3', sw: ['#8DB3D3', '#F2F0EA'], nw: 1 },
    11: { n: 'Lightweight Bomber Jacket', c: 'Olive', k: 'jacket', p: 3250, s: 2650, f: '#66704A', sw: ['#66704A', '#2B2B2C', '#BDB4A3'], nw: 1, z: 'M–XXL' },
    12: { n: 'Denim Trucker Jacket', c: 'Mid Blue', k: 'jacket', p: 3450, f: '#5D7A9E', sw: ['#5D7A9E', '#2F3B4C'], z: 'M–XXL' },
    13: { n: 'Oversized Drop-Shoulder Tee', c: 'Off-White', k: 'tee', p: 690, s: 550, f: '#F3F0E8', sw: ['#F3F0E8', '#2B2B2C', '#9DAE97', '#C9A98A'], nw: 1 },
    14: { n: 'Graphic Drop-Shoulder Tee', c: 'Black', k: 'tee', p: 750, f: '#2A2A2B', sw: ['#2A2A2B', '#F3F0E8'] },
    15: { n: 'Classic Cotton Panjabi', c: 'White', k: 'panjabi', p: 2450, s: 1990, f: '#F7F5F0', sw: ['#F7F5F0', '#9DAE97', '#2E3A57'] },
    16: { n: 'Embroidered Festive Panjabi', c: 'Maroon', k: 'panjabi', p: 3850, f: '#7A2E36', sw: ['#7A2E36', '#2F5146'] },
    17: { n: 'Slub Cotton Panjabi', c: 'Sage', k: 'panjabi', p: 2250, f: '#9DAE97', sw: ['#9DAE97', '#F7F5F0', '#D6C6A6'] },
    18: { n: 'Everyday Canvas Tote', c: 'Natural', k: 'tote', p: 950, f: '#E3D7BE', sw: ['#E3D7BE', '#2B2B2C'], nw: 1, z: B },
    19: { n: 'Urban Backpack', c: 'Black', k: 'backpack', p: 2450, s: 1990, f: '#2C2C2E', sw: ['#2C2C2E', '#66704A'], z: B },
    20: { n: 'Crossbody Sling Bag', c: 'Brown', k: 'sling', p: 1350, f: '#7B5638', sw: ['#7B5638', '#2C2C2E'], z: B },
    21: { n: 'Linen-Blend Panjabi', c: 'Sand', k: 'panjabi', p: 2650, s: 2190, f: '#D6C6A6', sw: ['#D6C6A6', '#F7F5F0'], nw: 1 },
    22: { n: 'Kabli-Collar Panjabi', c: 'Navy', k: 'panjabi', p: 2850, f: '#2E3A57', sw: ['#2E3A57', '#47484C'] },
    23: { n: 'Printed Cotton Panjabi', c: 'Indigo', k: 'panjabi', p: 2350, s: 1850, f: '#44507A', sw: ['#44507A', '#7A2E36'] },
    24: { n: 'Short Kurta Panjabi', c: 'Off-White', k: 'panjabi', p: 1950, f: '#EFEBE1', sw: ['#EFEBE1'], out: 1 },
    25: { n: 'Jacquard Festive Panjabi', c: 'Bottle Green', k: 'panjabi', p: 3650, s: 2990, f: '#2F5146', sw: ['#2F5146', '#7A2E36', '#CDB98A'], nw: 1 },
    26: { n: 'Pintuck Cotton Panjabi', c: 'Sky', k: 'panjabi', p: 2550, f: '#A9C3D6', sw: ['#A9C3D6', '#F7F5F0'] },
    27: { n: 'Mandarin-Collar Panjabi', c: 'Charcoal', k: 'panjabi', p: 2750, s: 2290, f: '#4A4B50', sw: ['#4A4B50', '#2E3A57'] },
    28: { n: 'Check Cotton Panjabi', c: 'Rust', k: 'panjabi', p: 2150, f: '#A0583A', sw: ['#A0583A', '#D6C6A6'], nw: 1 },
    29: { n: 'Silk-Blend Festive Panjabi', c: 'Gold Beige', k: 'panjabi', p: 4250, s: 3450, f: '#CDB98A', sw: ['#CDB98A', '#F7F5F0'] },
    30: { n: 'Mini Crossbody Bag', c: 'Olive', k: 'sling', p: 1150, s: 890, f: '#66704A', sw: ['#66704A', '#7B5638'], z: B },
    31: { n: 'Laptop Backpack', c: 'Grey', k: 'backpack', p: 2850, f: '#7D7F84', sw: ['#7D7F84', '#2C2C2E'], nw: 1, z: B },
    32: { n: 'Weekender Duffel', c: 'Navy', k: 'duffel', p: 3250, s: 2690, f: '#2E3B57', sw: ['#2E3B57', '#7B5638'], z: B },
    33: { n: 'Canvas Drawstring Bag', c: 'Black', k: 'tote', p: 650, f: '#2B2B2C', sw: ['#2B2B2C', '#E3D7BE'], z: B },
    34: { n: 'Everyday Waist Bag', c: 'Black', k: 'waist', p: 850, f: '#2C2C2E', sw: ['#2C2C2E', '#66704A'], z: B },
    35: { n: 'Market Tote', c: 'Indigo', k: 'tote', p: 1050, s: 850, f: '#44507A', sw: ['#44507A', '#E3D7BE'], z: B }
  };
  var LISTS = {
    na: [21, 13, 11, 25, 10, 5, 18, 28],
    bs: [15, 1, 3, 19, 14, 7, 12, 16],
    fe: [15, 16, 25, 23],
    panjabi: [15, 25, 16, 21, 24, 23, 17, 22, 27, 26, 28, 29],
    men: [21, 1, 13, 11, 15, 3, 25, 10, 5, 2, 14, 7],
    bags: [18, 19, 20, 30, 31, 32, 33, 34, 35],
    sale: [15, 1, 11, 3, 25, 19, 5, 13, 21, 7, 10, 23, 27, 29, 30, 32, 35],
    search: [15, 25, 16, 21, 23, 17, 22, 27, 26, 28, 29, 24],
    like: [17, 21, 25, 22, 26, 23],
    recent: [1, 13, 18, 11],
    picks: [15, 13, 19, 1]
  };
  var PALS = {
    sage: { label: 'Sage & Sand', d: ['#E6ECE3', '#3D5643', '#A0452B'] },
    harbour: { label: 'Harbour', d: ['#E2E9F0', '#22385A', '#A94B2E'] },
    clay: { label: 'Clay & Stone', d: ['#F1E2D7', '#4B3529', '#9A3F2B'] },
    olive: { label: 'Olive & Ivory', d: ['#ECEEDF', '#4B5729', '#984820'] }
  };
  function taka(n) { return '৳' + Number(n).toLocaleString('en-US'); }
  function bp(w) { return w < 768 ? 'm' : (w < 1024 ? 't' : 'd'); }
  function flag(v) { return v === true || v === '1' || v === 'true'; }
  function base(props, st) {
    props = props || {}; st = st || {};
    var W = Number(st.width || props.width || 1440);
    var pal = st.palette || props.palette || 'sage';
    if (!PALS[pal]) pal = 'sage';
    var b = bp(W);
    return {
      W: W, pal: pal, bp: b, rootCls: 'dv pal-' + pal + ' bp-' + b + ' L-D',
      bpM: b === 'm', bpT: b === 't', bpDk: b === 'd', notM: b !== 'm', notDk: b !== 'd',
      n3: function (d, t, m) { return b === 'd' ? d : (b === 't' ? t : m); }
    };
  }
  function item(id) {
    var p = CAT[id];
    var onSale = !!p.s && !p.out;
    var badges = [];
    if (p.out) badges.push({ label: 'SOLD OUT', cls: 'b b-out' });
    else {
      if (onSale) badges.push({ label: '-' + Math.round((1 - p.s / p.p) * 100) + '%', cls: 'b b-sale' });
      if (p.nw) badges.push({ label: 'NEW', cls: 'b b-new' });
    }
    return {
      id: id, name: p.n, colour: p.c, type: TYPE[p.k], sil: SIL[p.k], fill: p.f, onSale: onSale,
      price: onSale ? p.s : p.p, was: p.p,
      nowF: taka(onSale ? p.s : p.p), wasF: taka(p.p), saveF: onSale ? taka(p.p - p.s) : '',
      nowCls: onSale ? 'now sale' : 'now', badges: badges,
      sw: p.sw.map(function (c) { return { c: c }; }),
      cardCls: p.out ? 'is-out' : '', out: !!p.out, sizes: p.z || 'S–XXL'
    };
  }
  function items(ids) { return ids.map(item); }
  function nav(props, to) {
    return function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (props && typeof props.go === 'function') props.go(to);
    };
  }
  window.DVD = { SIL: SIL, TYPE: TYPE, CAT: CAT, LISTS: LISTS, PALS: PALS, taka: taka, bp: bp, flag: flag, base: base, item: item, items: items, nav: nav };
})();
