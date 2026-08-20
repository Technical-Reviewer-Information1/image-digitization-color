(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); return e; }
  const h2 = n => n.toString(16).toUpperCase().padStart(2, '0');

  /* ===== STEP 1 ===== */
  function colorName(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn < 24) return mx > 200 ? '白（に近い色）' : mx < 56 ? '黒（に近い色）' : '灰色';
    const hi = v => v > 170, lo = v => v < 86;
    if (hi(r) && lo(g) && lo(b)) return '赤';
    if (lo(r) && hi(g) && lo(b)) return '緑';
    if (lo(r) && lo(g) && hi(b)) return '青';
    if (hi(r) && hi(g) && lo(b)) return '黄';
    if (lo(r) && hi(g) && hi(b)) return '水（シアン）';
    if (hi(r) && lo(g) && hi(b)) return '紫（マゼンタ）';
    if (r > g && g > b) return '橙〜茶に近い色';
    return '中間の色';
  }
  function drawColor() {
    const r = +$('rIn').value, g = +$('gIn').value, b = +$('bIn').value;
    $('rV').textContent = r; $('gV').textContent = g; $('bV').textContent = b;
    $('rH').textContent = h2(r); $('gH').textContent = h2(g); $('bH').textContent = h2(b);
    $('swatch').style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
    const n = $('colNote');
    n.className = 'note ok';
    n.innerHTML = 'カラーコードは <strong class="mono">' + h2(r) + h2(g) + h2(b) + '</strong>。見えるのは <strong>' + colorName(r, g, b) + '</strong> です。<br>' +
      '<span class="small">R・G・Bをすべて0にすると黒、すべて255にすると白。光を足していくほど明るくなります。</span>';
  }

  /* ===== STEP 2 ===== */
  function drawHex() {
    const raw = $('hexIn').value.trim().replace(/^#/, '').toUpperCase();
    const n = $('hexNote'), t = $('hexTable');
    if (!/^[0-9A-F]{6}$/.test(raw)) { t.innerHTML = ''; n.className = 'note ng'; n.textContent = '00〜FF の16進法を6桁（例：FF0000）で入れてください。'; return; }
    const v = [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map(x => parseInt(x, 16));
    t.innerHTML = '<thead><tr><th></th><th>赤 R</th><th>緑 G</th><th>青 B</th></tr></thead><tbody>' +
      '<tr><td>16進法</td>' + v.map(x => '<td class="mono"><strong>' + h2(x) + '</strong></td>').join('') + '</tr>' +
      '<tr><td>10進法</td>' + v.map(x => '<td class="mono">' + x + '</td>').join('') + '</tr>' +
      '<tr><td>2進法（8ビット）</td>' + v.map(x => '<td class="mono">' + x.toString(2).padStart(8, '0') + '</td>').join('') + '</tr>' +
      '<tr><td>強さ</td>' + v.map(x => '<td>' + Math.round(x / 255 * 100) + '％</td>').join('') + '</tr></tbody>';
    n.className = 'note ok';
    n.innerHTML = '<span class="chip" style="background:#' + raw + '"></span>この色は <strong>' + colorName(v[0], v[1], v[2]) + '</strong>。' +
      (raw === 'FF0000' ? '赤の値だけが最大なので赤色です（本文【エ】＝①）。' :
       raw === '00FFFF' ? '緑と青が最大。この2つを混ぜると水色になります（本文【オ】＝③）。' :
       raw === 'FFFFFF' ? '3色すべて最大なので白。加法混色の考え方です。' :
       raw === '000000' ? '3色すべて0なので黒。光がまったく出ていない状態です。' :
       'スライダー（STEP 1）でも同じ色を作ってみましょう。');
    $('rIn').value = v[0]; $('gIn').value = v[1]; $('bIn').value = v[2]; drawColor();
  }
  const Q3 = [
    { k: 'エ', q: '「FF0000」は何色か。', a: '赤', why: 'R：FF（最大）、G：00、B：00。赤の光だけが出ているので赤色です。' },
    { k: 'オ', q: '「00FFFF」は何色か。', a: '水', why: 'R：00、G：FF、B：FF。緑と青の光を混ぜると水色（シアン）になります。' }
  ];
  const Q3CH = ['青', '赤', '黄', '水', '緑', '紫'];
  let q3Ans = {};
  function drawQ3() {
    $('q3Box').innerHTML = Q3.map((q, i) =>
      '<div' + (i ? ' style="margin-top:16px"' : '') + '><p class="qhead" style="margin:0 0 8px">【' + q.k + '】　' + q.q + '</p>' +
      '<div class="choice4" data-i="' + i + '">' + Q3CH.map((c, j) =>
        '<button class="btn" data-i="' + i + '" data-c="' + c + '" style="text-align:center">' + '⓪①②③④⑤'[j] + '　' + c + '</button>').join('') +
      '</div><div class="note" id="qfb' + i + '" hidden></div></div>').join('');
    $('q3Box').querySelectorAll('button[data-c]').forEach(btn => btn.addEventListener('click', () => {
      const i = +btn.dataset.i, q = Q3[i], ok = btn.dataset.c === q.a;
      const row = $('q3Box').querySelector('.choice4[data-i="' + i + '"]');
      row.classList.add('locked');
      [...row.children].forEach(x => { if (x.dataset.c === q.a) x.classList.add('correct'); else if (x === btn) x.classList.add('wrong'); });
      const fb = $('qfb' + i); fb.hidden = false; fb.className = 'note ' + (ok ? 'ok' : 'ng');
      fb.innerHTML = (ok ? '正解。' : '正解は <strong>' + q.a + '</strong>。') + q.why;
      q3Ans[i] = ok;
      const done = Object.keys(q3Ans).length;
      const n = $('q3Note'); n.className = 'note ' + (done === 2 ? 'ok' : 'info');
      n.innerHTML = done + ' / 2 問解答' + (done === 2 ? '<br>本文の答えは【エ】①　【オ】③ です。' : '');
    }));
    $('q3Note').className = 'note info'; $('q3Note').textContent = '0 / 2 問解答';
  }

  /* ===== STEP 3 ===== */
  function pic(x, y) {                                  // 0..1 → [r,g,b] 0..1
    const r = 0.5 + 0.45 * Math.sin(6.0 * x + 1.2 * y);
    const g = 0.5 + 0.45 * Math.sin(4.5 * y + 0.8);
    const b = 0.5 + 0.45 * Math.sin(5.0 * (x + y) + 2.1);
    return [r, g, b];
  }
  function drawPoster() {
    const bpc = +$('bpc').value, levels = Math.pow(2, bpc), N = 44, S = 240, c = S / N;
    $('bpcV').textContent = bpc; $('bppV').textContent = bpc * 3;
    const svg = el('svg', { viewBox: '0 0 ' + S + ' ' + S, width: '100%', 'shape-rendering': 'crispEdges', role: 'img' });
    svg.setAttribute('style', 'max-width:260px;display:block;margin:0 auto;border:1px solid var(--line)');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = pic((x + 0.5) / N, (y + 0.5) / N).map(u => {
        u = Math.max(0, Math.min(1, u));
        return Math.round(Math.round(u * (levels - 1)) / (levels - 1) * 255);
      });
      svg.appendChild(el('rect', { x: x * c, y: y * c, width: c + 0.6, height: c + 0.6, fill: 'rgb(' + v.join(',') + ')' }));
    }
    const box = $('posterBox'); box.innerHTML = ''; box.appendChild(svg);
    const total = Math.pow(2, bpc * 3);
    $('colorCount').textContent = total.toLocaleString() + ' 色';
    $('colorName').textContent = bpc === 8 ? '24ビットフルカラー' : (bpc * 3) + 'ビットカラー';
    const n = $('bpcNote');
    n.className = 'note ' + (bpc === 8 ? 'ok' : 'warn');
    n.innerHTML = bpc === 8
      ? 'R・G・Bにそれぞれ8ビット。合計24ビットで <strong>2<sup>24</sup>＝16,777,216色</strong>（約1678万色）。これを<strong>24ビットフルカラー</strong>といいます。「256ビットフルカラー」ではないので注意。'
      : '1色 ' + bpc + 'ビットでは各色 ' + levels + '段階しかなく、合計 ' + total.toLocaleString() + '色。' +
        'なめらかな色の変化が帯のように見えます。ビット数を増やすと色は増えますが、データ量も増えます。';
  }

  /* ===== STEP 4 ===== */
  const RN = 20;                                        // ラスタの解像度
  function shape(x, y) {                                // 0..1 座標 → 描くか
    return Math.hypot(x - 0.5, y - 0.5) < 0.40;
  }
  function drawZoom() {
    const z = +$('zoom').value;
    $('zoomV').textContent = z;
    const half = 0.5 / z;
    const edge = 0.5 - 0.40 / Math.SQRT2;                 // 円のふち（左上45°）
    const c0 = Math.max(half, Math.min(1 - half, edge));  // 拡大するほどふちに寄る
    const cx = c0, cy = c0;
    const vb = (cx - half) + ' ' + (cy - half) + ' ' + (2 * half) + ' ' + (2 * half);
    const rs = el('svg', { viewBox: vb, 'shape-rendering': 'crispEdges', role: 'img' });
    for (let y = 0; y < RN; y++) for (let x = 0; x < RN; x++) {
      if (shape((x + 0.5) / RN, (y + 0.5) / RN))
        rs.appendChild(el('rect', { x: x / RN, y: y / RN, width: 1 / RN + 0.001, height: 1 / RN + 0.001, fill: '#123a6b' }));
    }
    $('rasterBox').innerHTML = ''; $('rasterBox').appendChild(rs);
    const vs = el('svg', { viewBox: vb, role: 'img' });
    vs.appendChild(el('circle', { cx: 0.5, cy: 0.5, r: 0.40, fill: '#123a6b' }));
    $('vectorBox').innerHTML = ''; $('vectorBox').appendChild(vs);
    $('rvTable').innerHTML = '<thead><tr><th></th><th>ラスタ形式</th><th>ベクタ形式</th></tr></thead><tbody>' +
      '<tr><td>記録するもの</td><td>画素ごとの色</td><td>点の座標・線の太さなど</td></tr>' +
      '<tr><td>拡大したとき</td><td>ジャギーが出る</td><td>なめらかなまま</td></tr>' +
      '<tr><td>向いている画像</td><td>写真・風景</td><td>ロゴ・アイコン・ピクトグラム</td></tr>' +
      '<tr><td>ソフトウェア</td><td>ペイント系</td><td>ドロー系</td></tr>' +
      '<tr><td>この図のデータ量（目安）</td><td class="mono">' + (RN * RN) + 'ビット（' + (RN * RN / 8) + 'B）</td><td class="mono">数十バイト</td></tr></tbody>';
    const n = $('rvNote');
    n.innerHTML = z === 1
      ? '拡大率を上げてみましょう。同じ形でも、記録のしかたで見え方が変わります。'
      : '<strong>' + z + '倍</strong>に拡大しました。ラスタ形式は四角い画素がそのまま大きくなるので輪郭がギザギザに（<strong>ジャギー</strong>）。' +
        'ベクタ形式は倍率に合わせて描き直すのでなめらかなままです。<strong>ピクトグラムのような単純な図はベクタ形式のほうがデータ量も少なくなります</strong>。';
  }

  /* ===== STEP 5 ===== */
  function drawEq() {
    const w1 = +$('w1').value || 0, h1 = +$('h1').value || 0, w2 = +$('w2').value || 0, h2v = +$('h2').value || 0, g = +$('g2').value;
    const px1 = w1 * h1, bits2 = w2 * h2v * g;
    const x = px1 ? bits2 / px1 : 0;
    $('eqBox').innerHTML =
      '画像② ＝ ' + w2.toLocaleString() + ' × ' + h2v.toLocaleString() + ' × ' + g + '（ビット）<br>＝ ' + bits2.toLocaleString() + '（ビット）<br>' +
      '画像① ＝ ' + w1.toLocaleString() + ' × ' + h1.toLocaleString() + ' × <em>x</em> ＝ ' + px1.toLocaleString() + '<em>x</em><br>' +
      '同じ大きさだから　' + px1.toLocaleString() + '<em>x</em> ＝ ' + bits2.toLocaleString() + '<br>' +
      '<strong><em>x</em> ＝ ' + (Math.round(x * 1000) / 1000) + '（ビット）</strong>';
    $('ansBits').textContent = (Math.round(x * 1000) / 1000) + ' ビット';
    const n = $('eqNote');
    const isBook = w1 === 600 && h1 === 600 && w2 === 1800 && h2v === 1200 && g === 8;
    n.className = 'note ' + (isBook ? 'ok' : 'info');
    n.innerHTML = isBook
      ? '本文の条件です。答えは <strong>48ビット</strong>（＝6バイト）。1色あたり16ビットを3色分使っている計算になります。' +
        '<br><span class="small">解説の解き方（バイトで計算）：1800×1200×1B＝2,160,000B。600×600×x＝360,000x。x＝6バイト＝48ビット。</span>'
      : '画像②のビット数を、画像①の画素数で割ると、1ピクセルあたりのビット数が出ます。' +
        (x % 1 === 0 ? '' : '割り切れない場合は、条件の数値を見直してみましょう。');
  }

  /* ===== STEP 6 ===== */
  const JUDGE = [
    { k: 'a', t: '色や明るさの濃淡を表す段階値を階調といい、nビットでは2ⁿ階調を表現することができる。', ok: true,
      why: '1ビットなら2階調、8ビットなら256階調。定義どおりで正しい記述です。' },
    { k: 'b', t: 'スマートフォンのディスプレイに表示されるカラー画像は、一般的に赤・緑・青の光の三原色の組み合わせによる減法混色により表現される。', ok: false,
      why: 'ディスプレイは光を重ねるので<strong>加法混色</strong>です。減法混色は絵の具やプリンタのインク。' },
    { k: 'c', t: 'RGB各色を8ビットで表現した画像を256ビットフルカラーといい、16,777,216色を表現することができる。', ok: false,
      why: '8×3＝<strong>24ビットフルカラー</strong>です。色数 16,777,216（＝2²⁴）は合っていますが、呼び方が誤りです。' },
    { k: 'd', t: '画素を並べて文字や図形を表現する形式をラスタ形式といい、この形式でつくられた画像を拡大するとジャギーが現れる。', ok: true,
      why: 'STEP 4 で確かめたとおりです。' },
    { k: 'e', t: 'ピクトグラムの画像は、一般的にベクタ形式よりもラスタ形式のほうがデータ量は少ない。', ok: false,
      why: '逆です。単純な図形は<strong>ベクタ形式</strong>のほうが記録する情報が少なく、データ量も小さくなります。' }
  ];
  let jAns = {};
  function drawJudge() {
    $('jBox').innerHTML = JUDGE.map((j, i) =>
      '<div><div class="st"><span class="k">' + j.k + '</span><span class="t">' + j.t + '</span>' +
      '<span class="jb" data-i="' + i + '"><button class="btn" data-i="' + i + '" data-v="1">○</button>' +
      '<button class="btn" data-i="' + i + '" data-v="0">×</button></span></div>' +
      '<div class="note" id="jfb' + i + '" hidden style="margin-top:8px"></div></div>').join('');
    $('jBox').querySelectorAll('button[data-v]').forEach(btn => btn.addEventListener('click', () => {
      const i = +btn.dataset.i, j = JUDGE[i], said = btn.dataset.v === '1', ok = said === j.ok;
      const row = $('jBox').querySelector('.jb[data-i="' + i + '"]');
      row.style.pointerEvents = 'none';
      [...row.children].forEach(x => { const v = x.dataset.v === '1'; if (v === j.ok) x.classList.add('correct'); else if (x === btn) x.classList.add('wrong'); });
      const fb = $('jfb' + i); fb.hidden = false; fb.className = 'note ' + (ok ? 'ok' : 'ng');
      fb.innerHTML = '<strong>' + (j.ok ? '正しい記述です。' : '誤りです。') + '</strong>' + j.why;
      jAns[i] = ok;
      const done = Object.keys(jAns).length;
      const n = $('jNote'); n.className = 'note ' + (done === JUDGE.length ? 'ok' : 'info');
      n.innerHTML = done + ' / ' + JUDGE.length + ' 判定' +
        (done === JUDGE.length ? '<br>正しいものは <strong>a と d の2つ</strong>なので、【ア】の答えは <strong>②（2つ）</strong> です。' : '');
    }));
    $('jNote').className = 'note info'; $('jNote').textContent = '0 / ' + JUDGE.length + ' 判定';
  }

  function init() {
    ['rIn', 'gIn', 'bIn'].forEach(i => $(i).addEventListener('input', drawColor));
    document.querySelectorAll('button[data-hex]').forEach(b => b.addEventListener('click', () => { $('hexIn').value = b.dataset.hex; drawHex(); }));
    $('hexIn').addEventListener('input', drawHex);
    $('bpc').addEventListener('input', drawPoster);
    $('zoom').addEventListener('input', drawZoom);
    ['w1', 'h1', 'w2', 'h2', 'g2'].forEach(i => $(i).addEventListener('input', drawEq));
    $('g2').addEventListener('change', drawEq);
    window.Terms.glossary($('glossBox'), ['加法混色', '減法混色', '光の三原色', '色の三原色', 'カラーコード', 'フルカラー', '階調', 'ラスタ形式', 'ベクタ形式', 'ジャギー', '画素', '解像度', '16進法']);
    drawColor(); drawHex(); drawQ3(); drawPoster(); drawZoom(); drawEq(); drawJudge();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
