/* ========== Data Constants ========== */
const DATA = {
  zeroTrend: {
    labels: ['H26(2014)', 'H27(2015)', 'H28(2016)', 'H29(2017)', 'H30(2018)'],
    values: [58.6, 57.6, 56.8, 55.9, 54.9]
  },
  totalTrend: {
    labels: ['H20(2008)', 'H21(2009)', 'H22(2010)', 'H23(2011)', 'H24(2012)'],
    total:    [326, 262, 267, 378, 371],
    personal: [60, 39, 58, 128, 99],
    corporate:[244, 200, 192, 242, 272]
  },
  taxEffect: {
    labels: ['寄附金収入計', '個人寄附', '法人寄附'],
    all:        [31, 118, 21],
    taxTarget:  [52, 194, 60],
    nonTarget:  [23, 92, 7]
  },
  usage: {
    labels: ['公益目的事業費', '管理費', '資産取得費', '収益事業等事業費'],
    allCorp:   [24.1, 16.9, 12.2, 4.1],
    taxTarget: [64.2, 44.1, 12.6, 5.2]
  }
};

/* ========== Chart Colors ========== */
const COLORS = {
  blue:    '#1565C0',
  lightBlue: '#42A5F5',
  orange:  '#FF8F00',
  green:   '#2E7D32',
  red:     '#C62828',
  grey:    '#78909C',
  blueAlpha: 'rgba(21,101,192,0.15)',
  orangeAlpha: 'rgba(255,143,0,0.15)',
  greenAlpha: 'rgba(46,125,50,0.15)'
};

/* ========== Chart Defaults ========== */
Chart.defaults.font.family = "'Noto Sans JP', sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = '#333';

/* ========== White Background Plugin (for modal export) ========== */
const whiteBgPlugin = {
  id: 'whiteBg',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

/* ========== Value Label Plugin ========== */
const valueLabelPlugin = {
  id: 'valueLabel',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden) return;
      meta.data.forEach((bar, idx) => {
        const value = dataset.data[idx];
        if (value == null) return;
        ctx.save();
        ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(value, bar.x, bar.y - 4);
        ctx.restore();
      });
    });
  }
};

/* ========== Charts ========== */
function createCharts() {
  // 1. 0円法人割合の推移
  new Chart(document.getElementById('chartZeroTrend'), {
    type: 'line',
    data: {
      labels: DATA.zeroTrend.labels,
      datasets: [{
        label: '寄附金0円の法人割合（%）',
        data: DATA.zeroTrend.values,
        borderColor: COLORS.red,
        backgroundColor: 'rgba(198,40,40,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: COLORS.red
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: '寄附金0円法人割合の推移', font: { size: 16, weight: 'bold' } }
      },
      scales: {
        y: { min: 50, max: 62, ticks: { callback: v => v + '%' } }
      }
    },
    plugins: [valueLabelPlugin, whiteBgPlugin]
  });

  // 2. 寄附金収入総額推移
  new Chart(document.getElementById('chartTotalTrend'), {
    type: 'bar',
    data: {
      labels: DATA.totalTrend.labels,
      datasets: [
        {
          label: '個人寄附',
          data: DATA.totalTrend.personal,
          backgroundColor: COLORS.lightBlue,
          stack: 'stack1'
        },
        {
          label: '法人寄附',
          data: DATA.totalTrend.corporate,
          backgroundColor: COLORS.blue,
          stack: 'stack1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '寄附金収入総額の推移（十億円）', font: { size: 16, weight: 'bold' } }
      },
      scales: {
        y: { stacked: true, beginAtZero: true, title: { display: true, text: '十億円' } },
        x: { stacked: true }
      }
    },
    plugins: [whiteBgPlugin]
  });

  // 3. 税額控除効果比較
  new Chart(document.getElementById('chartTaxEffect'), {
    type: 'bar',
    data: {
      labels: DATA.taxEffect.labels,
      datasets: [
        {
          label: '全体',
          data: DATA.taxEffect.all,
          backgroundColor: COLORS.grey
        },
        {
          label: '税額控除対象法人',
          data: DATA.taxEffect.taxTarget,
          backgroundColor: COLORS.blue
        },
        {
          label: '非対象法人',
          data: DATA.taxEffect.nonTarget,
          backgroundColor: COLORS.orange
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '税額控除制度 導入前後の増加率比較（%）', font: { size: 16, weight: 'bold' } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => '+' + v + '%' } }
      }
    },
    plugins: [valueLabelPlugin, whiteBgPlugin]
  });

  // 4. 寄附金使途比較
  new Chart(document.getElementById('chartUsage'), {
    type: 'bar',
    data: {
      labels: DATA.usage.labels,
      datasets: [
        {
          label: '公益法人全体',
          data: DATA.usage.allCorp,
          backgroundColor: COLORS.grey
        },
        {
          label: '税額控除対象法人',
          data: DATA.usage.taxTarget,
          backgroundColor: COLORS.blue
        }
      ]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '寄附金の使途別充当割合（H24年度・%）', font: { size: 16, weight: 'bold' } }
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: v => v + '%' } }
      }
    },
    plugins: [whiteBgPlugin]
  });
}

/* ========== Scroll Animation ========== */
function initScrollAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(sec => observer.observe(sec));
}

/* ========== Chart Modal ========== */
function initChartModal() {
  const modal = document.getElementById('chartModal');
  const modalImg = document.getElementById('chartModalImg');
  const backdrop = modal.querySelector('.chart-modal-backdrop');
  const closeBtn = modal.querySelector('.chart-modal-close');

  function openModal(src) {
    modalImg.src = src;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    modalImg.src = '';
  }

  // Static images
  document.querySelectorAll('.chart-img-wrap img').forEach(img => {
    img.addEventListener('click', () => openModal(img.src));
  });

  // Chart.js canvases (delay for rendering)
  setTimeout(() => {
    document.querySelectorAll('.chartjs-canvas-wrap canvas').forEach(canvas => {
      canvas.addEventListener('click', () => openModal(canvas.toDataURL('image/png')));
    });
  }, 500);

  // Close handlers
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  createCharts();
  initScrollAnimation();
  initChartModal();
});
