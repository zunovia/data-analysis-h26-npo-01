/* =====================================================
   景気ウォッチャー調査レポート - Chart.js & Interactions
   ===================================================== */

// ===== データ定義 =====
const DATA = {
  // 全国DI年次推移（2003〜2026）
  years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,'2026*'],
  di_current: [45.8,47.6,48.5,49.2,50.1,44.0,34.8,47.9,44.8,45.1,49.2,48.0,48.5,47.7,49.0,50.2,48.3,36.7,44.8,47.9,49.3,49.1,48.5,48.9],
  di_forward: [46.8,48.3,49.2,49.8,49.5,41.6,38.5,48.5,46.2,46.5,49.8,48.3,49.0,47.9,49.5,50.5,48.5,37.2,46.2,48.5,49.8,49.3,48.8,50.0],

  // 直近12ヶ月 (2025-03 〜 2026-02)
  months12: ['2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02'],
  di_m12_cur: [47.8,47.2,48.1,47.6,47.5,48.0,48.2,48.9,49.1,48.3,47.6,48.9],
  di_m12_fwd: [48.5,48.0,49.0,48.2,48.8,49.2,49.4,49.6,50.1,49.2,50.1,50.0],

  // 分野別DI（直近12ヶ月現状判断）
  sector_labels: ['2025-03','2025-05','2025-07','2025-09','2025-11','2026-01'],
  di_household: [47.5,48.0,47.8,48.0,48.9,47.1],
  di_corporate: [48.2,48.8,47.5,48.3,49.2,48.9],
  di_employment:[50.5,51.2,50.8,51.0,51.5,50.6],

  // 地域別DI（最新3ヶ月平均）
  regions: ['全国','北海道','東北','北関東','南関東','甲信越','東海','北陸','近畿','中国','四国','九州'],
  region_di: [48.9,47.1,47.8,48.5,50.2,48.0,50.5,47.6,49.3,47.2,46.8,48.1],

  // 回答構成比（直近6ヶ月、現状判断）
  months6: ['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02'],
  pct_good:       [1.8, 2.1, 2.0, 1.9, 1.5, 1.9],
  pct_fairly_good:[15.2,16.5,17.1,15.8,14.2,16.8],
  pct_same:       [64.3,63.8,63.5,63.9,65.2,63.4],
  pct_fairly_bad: [15.8,14.9,14.5,15.3,15.8,14.9],
  pct_bad:        [2.9, 2.7, 2.9, 3.1, 3.3, 3.0],
};

// ===== Chart.js グローバル設定 =====
Chart.defaults.font.family = "'Segoe UI','Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";
Chart.defaults.color = '#546E7A';
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.padding = 14;

const PALETTE = {
  current: '#1565C0',
  forward: '#E65100',
  household: '#1E88E5',
  corporate: '#F4511E',
  employment: '#43A047',
  good: '#1565C0',
  fairly_good: '#42A5F5',
  same: '#90A4AE',
  fairly_bad: '#EF9A9A',
  bad: '#B71C1C',
};

// ===== Chart 1: 年次DI推移（折れ線） =====
function initAnnualTrend() {
  const ctx = document.getElementById('chartAnnualTrend');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: DATA.years,
      datasets: [
        {
          label: '現状判断DI',
          data: DATA.di_current,
          borderColor: PALETTE.current,
          backgroundColor: PALETTE.current + '22',
          borderWidth: 2.5,
          pointRadius: 3,
          tension: 0.3,
          fill: false,
        },
        {
          label: '先行き判断DI',
          data: DATA.di_forward,
          borderColor: PALETTE.forward,
          backgroundColor: PALETTE.forward + '22',
          borderWidth: 2,
          borderDash: [5,3],
          pointRadius: 3,
          tension: 0.3,
          fill: false,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
          }
        },
        annotation: {
          annotations: {
            baseline: {
              type: 'line',
              yMin: 50, yMax: 50,
              borderColor: '#90A4AE',
              borderWidth: 1.5,
              borderDash: [4,4],
              label: { content: '基準値 50', display: true, position: 'end', font: { size: 11 }, color: '#78909C' }
            }
          }
        }
      },
      scales: {
        y: {
          min: 25, max: 60,
          grid: { color: '#ECEFF1' },
          ticks: { stepSize: 5 }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== Chart 2: 直近12ヶ月DI（折れ線） =====
function initRecentTrend() {
  const ctx = document.getElementById('chartRecentTrend');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: DATA.months12,
      datasets: [
        {
          label: '現状判断DI',
          data: DATA.di_m12_cur,
          borderColor: PALETTE.current,
          backgroundColor: PALETTE.current + '18',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: true,
        },
        {
          label: '先行き判断DI',
          data: DATA.di_m12_fwd,
          borderColor: PALETTE.forward,
          borderWidth: 2,
          borderDash: [5,3],
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`
          }
        },
        annotation: {
          annotations: {
            baseline: {
              type: 'line',
              yMin: 50, yMax: 50,
              borderColor: '#90A4AE',
              borderWidth: 1.5,
              borderDash: [4,4],
            }
          }
        }
      },
      scales: {
        y: {
          min: 44, max: 54,
          grid: { color: '#ECEFF1' },
          ticks: { stepSize: 2 }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== Chart 3: 分野別DI（折れ線） =====
function initSectorTrend() {
  const ctx = document.getElementById('chartSectorTrend');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: DATA.sector_labels,
      datasets: [
        {
          label: '家計動向関連',
          data: DATA.di_household,
          borderColor: PALETTE.household,
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
        {
          label: '企業動向関連',
          data: DATA.di_corporate,
          borderColor: PALETTE.corporate,
          borderWidth: 2,
          borderDash: [5,3],
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
        {
          label: '雇用関連',
          data: DATA.di_employment,
          borderColor: PALETTE.employment,
          borderWidth: 2,
          borderDash: [2,2],
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
        annotation: {
          annotations: {
            baseline: {
              type: 'line', yMin: 50, yMax: 50,
              borderColor: '#90A4AE', borderWidth: 1.5, borderDash: [4,4]
            }
          }
        }
      },
      scales: {
        y: { min: 44, max: 54, grid: { color: '#ECEFF1' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== Chart 4: 地域別DI（水平バー） =====
function initRegionalBar() {
  const ctx = document.getElementById('chartRegionalBar');
  if (!ctx) return;

  const sorted = DATA.regions.map((r, i) => ({ r, v: DATA.region_di[i] }))
    .sort((a, b) => a.v - b.v);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.r),
      datasets: [{
        label: 'DI（季節調整値）',
        data: sorted.map(d => d.v),
        backgroundColor: sorted.map(d => d.v >= 50 ? PALETTE.current + 'CC' : '#EF9A9A'),
        borderColor: sorted.map(d => d.v >= 50 ? PALETTE.current : '#C62828'),
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` DI: ${ctx.parsed.x.toFixed(1)}`
          }
        },
        annotation: {
          annotations: {
            baseline: {
              type: 'line', xMin: 50, xMax: 50,
              borderColor: '#EF5350', borderWidth: 1.5, borderDash: [4,4],
              label: { content: '50', display: true, position: 'start', font: { size: 10 }, color: '#EF5350' }
            }
          }
        }
      },
      scales: {
        x: { min: 44, max: 54, grid: { color: '#ECEFF1' } },
        y: { grid: { display: false } }
      }
    }
  });
}

// ===== Chart 5: 回答構成比（積み上げ棒） =====
function initResponseShare() {
  const ctx = document.getElementById('chartResponseShare');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.months6,
      datasets: [
        { label: '良くなっている',      data: DATA.pct_good,       backgroundColor: PALETTE.good,        borderRadius: 0 },
        { label: 'やや良くなっている',   data: DATA.pct_fairly_good,backgroundColor: PALETTE.fairly_good, borderRadius: 0 },
        { label: '変わらない',          data: DATA.pct_same,       backgroundColor: PALETTE.same,        borderRadius: 0 },
        { label: 'やや悪くなっている',   data: DATA.pct_fairly_bad, backgroundColor: PALETTE.fairly_bad,  borderRadius: 0 },
        { label: '悪くなっている',       data: DATA.pct_bad,        backgroundColor: PALETTE.bad,         borderRadius: 0 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          mode: 'index',
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
          }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, min: 0, max: 100, grid: { color: '#ECEFF1' },
             ticks: { callback: v => v + '%' } }
      }
    }
  });
}

// ===== ナビゲーション アクティブ =====
function initNavHighlight() {
  const sections = document.querySelectorAll('.report-section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ===== フェードイン =====
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
  initAnnualTrend();
  initRecentTrend();
  initSectorTrend();
  initRegionalBar();
  initResponseShare();
  initNavHighlight();
  initFadeIn();
});
