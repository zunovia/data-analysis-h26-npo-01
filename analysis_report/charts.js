/* ============================================
   平成26年度 市民の社会貢献に関する実態調査
   Analysis Report — Charts & Interactions
   ============================================ */

'use strict';

// ── Chart.js global defaults ──────────────────
Chart.defaults.font.family = "'BIZ UDPGothic', 'Noto Sans JP', sans-serif";
Chart.defaults.color = '#4a5568';
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,22,40,0.9)';
Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '700' };
Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxWidth = 10;
Chart.defaults.plugins.tooltip.boxHeight = 10;
Chart.defaults.plugins.tooltip.boxPadding = 4;

// ── Colour palette (matches CSS variables) ────
const C = {
  navy900: '#0a1628', navy800: '#0d2137', navy600: '#1e3a5f', navy200: '#4a90a4',
  red600:  '#c1121f', red400:  '#e63946', red200:  '#f4a5a5',
  blue500: '#4361ee', blue300: '#7b9af0',
  teal500: '#2a9d8f',
  amber:   '#e9c46a',
  green:   '#2d6a4f',
  gray200: '#e2e8f0', gray500: '#718096',
};

const INTEREST_COLORS = ['#1A237E', '#5C6BC0', '#EF9A9A', '#B71C1C'];
const EXP_COLORS      = [C.blue500, C.gray200];

/* ─────────────────────────────────────────────
   1. Scroll reveal observer
───────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─────────────────────────────────────────────
   2. Stat-bar animated fills (intersection)
───────────────────────────────────────────── */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = e.target.dataset.target;
      e.target.style.width = target + '%';
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-bar-fill').forEach(el => barObs.observe(el));

/* ─────────────────────────────────────────────
   3. Stacked bar animation (interest section)
───────────────────────────────────────────── */
const stackedObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const segs = e.target.querySelectorAll('.stacked-seg');
      segs.forEach(seg => {
        const w = seg.dataset.pct + '%';
        setTimeout(() => { seg.style.width = w; }, 100);
      });
      stackedObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.stacked-bar-track').forEach(el => stackedObs.observe(el));

/* ─────────────────────────────────────────────
   4. Hero gap bars animation
───────────────────────────────────────────── */
setTimeout(() => {
  document.querySelectorAll('.gap-bar-fill').forEach(el => el.classList.add('animated'));
}, 600);

/* ─────────────────────────────────────────────
   5. Counter animation for KPI values
───────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const isFloat = String(target).includes('.');
  const decimals = isFloat ? 1 : 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = eased * target;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const kpiObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, 1600, suffix);
      kpiObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => kpiObs.observe(el));

/* ─────────────────────────────────────────────
   6. Navigation: active section highlight
───────────────────────────────────────────── */
const sections = document.querySelectorAll('[data-section]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navObs.observe(s));

/* ─────────────────────────────────────────────
   7. Participation fields chart (horizontal bar)
───────────────────────────────────────────── */
(function buildFieldsChart() {
  const el = document.getElementById('chart-fields');
  if (!el) return;

  const labels = [
    'まちづくり・まちおこし',
    '子ども・青少年育成',
    '自然・環境保全',
    '保健・医療・福祉',
    'スポーツ・文化・芸術',
    '高齢者支援',
    '地域安全・防犯',
    '国際協力・交流',
    '平成25年度は参加せず',
    'その他'
  ];

  const values = [29.0, 23.2, 20.7, 18.4, 16.1, 14.3, 12.6, 8.2, 10.1, 7.4];

  const colors = values.map((_, i) =>
    i < 3 ? C.navy600 : i < 6 ? C.blue500 : C.gray500
  );

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x.toFixed(1)}%`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 35,
          grid: { color: '#e2e8f0', lineWidth: 1 },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12 }, color: '#1a1a2e' },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   8. Gender × Fields comparison chart
───────────────────────────────────────────── */
(function buildGenderFieldChart() {
  const el = document.getElementById('chart-gender-fields');
  if (!el) return;

  const labels = [
    'まちづくり', '子ども育成', '自然・環境', '保健・福祉', 'スポーツ文化', '地域安全', '高齢者支援'
  ];

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '男性',
          data: [30.1, 18.4, 33.2, 12.1, 17.3, 19.8, 11.6],
          backgroundColor: C.navy600,
          borderRadius: 3,
        },
        {
          label: '女性',
          data: [27.8, 27.5, 11.9, 27.1, 14.8, 5.6, 17.2],
          backgroundColor: C.red400,
          borderRadius: 3,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { font: { size: 11 }, boxWidth: 12, boxHeight: 12, padding: 16 }
        },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.x.toFixed(1)}%` }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 40,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   9. Participation reasons chart
───────────────────────────────────────────── */
(function buildReasonsChart() {
  const el = document.getElementById('chart-reasons');
  if (!el) return;

  const labels = [
    '社会の役に立ちたい',
    '自己啓発・自らの成長',
    '地域・社会への貢献感',
    '楽しそう・興味があった',
    '友人・知人の誘い',
    '職場の取組の一環',
    'スキルを活かしたい',
    '余暇の有効活用'
  ];
  const values = [61.8, 45.2, 40.7, 34.6, 27.9, 18.3, 15.6, 22.1];

  const bgColors = values.map((v, i) =>
    i === 0 ? C.navy600 : i === 1 ? C.blue500 : i === 2 ? C.teal500 : '#94a3b8'
  );

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(1)}%` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 75,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   10. Barriers chart
───────────────────────────────────────────── */
(function buildBarriersChart() {
  const el = document.getElementById('chart-barriers');
  if (!el) return;

  const labels = [
    '仕事・学業が忙しい',
    'きっかけ・機会がない',
    '十分な情報がない',
    '家事・育児・介護で時間がない',
    '体力・健康上の問題',
    '費用・経費がかかる',
    '活動の成果が見えにくい',
    '周囲に仲間がいない'
  ];
  const values = [47.8, 37.2, 28.4, 22.1, 18.6, 14.9, 11.7, 10.3];

  const bgColors = values.map((v, i) =>
    i === 0 ? C.red600 : i <= 2 ? '#f87171' : '#fca5a5'
  );

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(1)}%` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 56,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   11. Government requests chart
───────────────────────────────────────────── */
(function buildRequestsChart() {
  const el = document.getElementById('chart-requests');
  if (!el) return;

  const labels = [
    '情報提供・情報発信の充実',
    'マッチング人材・団体の養成',
    'ボランティア休暇制度の普及',
    '税制上の優遇措置',
    '活動費用の助成・補助',
    '表彰・社会的認知向上',
    '学校教育での体験促進',
    '特に要望なし'
  ];
  const values = [51.6, 44.3, 38.1, 25.4, 22.8, 16.7, 14.2, 8.9];

  const bgColors = values.map((_, i) =>
    i < 3 ? C.navy600 : i < 5 ? C.blue500 : '#94a3b8'
  );

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x.toFixed(1)}%` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 62,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   12. Volunteer × Donation doughnut charts
───────────────────────────────────────────── */
(function buildDonationCharts() {
  const buildDonut = (id, value, colors) => {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [value, 100 - value],
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          animateRotate: true,
          duration: 1400,
          easing: 'easeOutQuart',
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.toFixed(1)}%`
            }
          }
        }
      }
    });
  };

  buildDonut('chart-donation-exp',   73.7, [C.blue500, '#e2e8f0']);
  buildDonut('chart-donation-noexp', 47.1, [C.gray500, '#e2e8f0']);
})();

/* ─────────────────────────────────────────────
   13. Donation methods comparison chart
───────────────────────────────────────────── */
(function buildDonationMethodChart() {
  const el = document.getElementById('chart-donation-methods');
  if (!el) return;

  const labels = [
    '銀行振込・口座引落',
    'NPO等への直接振込',
    '街頭募金',
    '共同募金',
    'コンビニ・スーパー',
    'クレジット・ネット',
    '職場・自治会',
  ];

  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'ボランティア経験あり',
          data: [42.1, 35.6, 28.3, 31.4, 14.2, 18.7, 22.1],
          backgroundColor: C.blue500,
          borderRadius: 3,
        },
        {
          label: 'ボランティア経験なし',
          data: [21.8, 15.2, 38.9, 27.6, 24.3, 12.1, 18.4],
          backgroundColor: '#94a3b8',
          borderRadius: 3,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { font: { size: 11 }, boxWidth: 12, boxHeight: 12, padding: 16 }
        },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.x.toFixed(1)}%` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 50,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   14. Age × Experience radar / bar chart
───────────────────────────────────────────── */
(function buildExpByAgeChart() {
  const el = document.getElementById('chart-exp-age');
  if (!el) return;

  new Chart(el, {
    type: 'bar',
    data: {
      labels: ['20歳代', '30歳代', '40歳代', '50歳代', '60歳代'],
      datasets: [
        {
          label: '経験あり',
          data: [17.8, 22.1, 26.8, 30.4, 36.6],
          backgroundColor: C.blue500,
          borderRadius: 6,
          stack: 'a',
        },
        {
          label: '経験なし',
          data: [82.2, 77.9, 73.2, 69.6, 63.4],
          backgroundColor: '#e2e8f0',
          borderRadius: 6,
          stack: 'a',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { font: { size: 11 }, boxWidth: 12, boxHeight: 12, padding: 16 }
        },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 12 } },
          border: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          grid: { color: '#e2e8f0' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
          border: { display: false }
        }
      }
    }
  });
})();

/* ─────────────────────────────────────────────
   15. Interest by age stacked chart
       (using custom HTML bars, not Chart.js)
───────────────────────────────────────────── */
// Already handled in HTML/CSS via .stacked-bar-track animation

/* ─────────────────────────────────────────────
   16. Smooth scroll for nav links
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─────────────────────────────────────────────
   17. Age heatmap cell colors
───────────────────────────────────────────── */
document.querySelectorAll('.age-cell[data-val]').forEach(cell => {
  const val = parseFloat(cell.dataset.val);
  const max = parseFloat(cell.dataset.max || 70);
  const ratio = Math.min(val / max, 1);

  // Interpolate between white and navy
  const r = Math.round(255 + (10 - 255) * ratio * 0.85);
  const g = Math.round(255 + (22 - 255) * ratio * 0.85);
  const b = Math.round(255 + (64 - 255) * ratio * 0.85);
  const textColor = ratio > 0.45 ? 'white' : '#1a1a2e';

  cell.style.background = `rgb(${r},${g},${b})`;
  cell.style.color = textColor;
});

/* ─────────────────────────────────────────────
   18. Mobile nav toggle
───────────────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

console.log('%c📊 平成26年度 市民の社会貢献 分析レポート', 'font-size:14px;font-weight:bold;color:#1e3a5f');
console.log('%c内閣府 調査データ可視化レポート — Charts initialized', 'color:#4361ee');
