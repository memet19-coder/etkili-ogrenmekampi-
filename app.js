const STORAGE_KEY = "yaz-kampi-takip-v4";

const weeks = [
  {
    id: 1,
    title: "Çalışma Alışkanlığını Tanıma",
    skill: "Öz farkındalık",
    product: "Mini test + 3 gün 20 dk takip",
    parentEvidence: "Öğrenci çalışırken nerede zorlandığını fark eder.",
    badge: "Başlangıç Kaşifi",
  },
  {
    id: 2,
    title: "Tatilde Sıkılmadan Plan Yapma",
    skill: "Planlama",
    product: "Günlük ve haftalık mini plan",
    parentEvidence: "Dinlenme, gelişim ve sorumluluk dengesini kurar.",
    badge: "Plan Ustası",
  },
  {
    id: 3,
    title: "Unutma Eğrisi ve Aralıklı Tekrar",
    skill: "Tekrar sistemi",
    product: "Tekrar çizelgesi",
    parentEvidence: "Unutmanın normal olduğunu ve kısa tekrarların işe yaradığını görür.",
    badge: "Tekrar Stratejisti",
  },
  {
    id: 4,
    title: "Aktif Hatırlama",
    skill: "Kendini test etme",
    product: "Kapat-anlat kaydı veya notu",
    parentEvidence: "Sadece okumak yerine bakmadan anlatmayı dener.",
    badge: "Hatırlama Dedektifi",
  },
  {
    id: 5,
    title: "Odaklanma ve Dikkat",
    skill: "Dikkat yonetimi",
    product: "3 odak denemesi formu",
    parentEvidence: "Dikkat dağıtıcılarını tanır ve kısa odak rutini kurar.",
    badge: "Odak Kahramanı",
  },
  {
    id: 6,
    title: "Okuma-Anlama ve Paragraf",
    skill: "Okuma stratejisi",
    product: "3 gün okuma + tek cümle özet",
    parentEvidence: "Konu, ana fikir, kanıt ve özetleme çalışır.",
    badge: "Okuma Kaşifi",
  },
  {
    id: 7,
    title: "Not Tutma ve Zihin Haritası",
    skill: "Bilgiyi düzenleme",
    product: "Zihin haritası + 3 cümle özet",
    parentEvidence: "Anahtar kelime, özet ve görsel düzenleme becerisi gelişir.",
    badge: "Harita Uzmanı",
  },
  {
    id: 8,
    title: "Yeni Döneme Güçlü Başlangıç",
    skill: "Hedef ve sürdürme",
    product: "Yeni dönem planı + kendime mektup",
    parentEvidence: "Kendi güçlü yönlerini ve yeni dönem hedeflerini belirler.",
    badge: "Yeni Dönem Hazırım",
  },
];

const extraBadges = [
  "Düzenli Katılım",
  "Sorumluluk Alanı",
  "Güzel Paylaşım",
  "Gelişim Cesareti",
  "Kısa Ama Düzenli",
];

const defaultState = {
  activeView: "dashboard",
  activeStudentId: null,
  activeWeek: 1,
  students: [],
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      students: Array.isArray(parsed.students) ? parsed.students : [],
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function blankWeeklyRecord(weekId) {
  return {
    weekId,
    attendance: false,
    productDone: false,
    reflectionDone: false,
    familyShared: false,
    scores: {
      participation: 0,
      strategy: 0,
      turkish: 0,
    },
    artifact: "",
    teacherNote: "",
    studentReflection: "",
    recommendation: "",
    badges: [],
    portfolio: {
      title: "",
      type: "Çalışma formu",
      link: "",
      note: "",
      showcase: false,
    },
  };
}

function createStudent({ name, grade, note }) {
  const weekly = {};
  weeks.forEach((week) => {
    weekly[week.id] = blankWeeklyRecord(week.id);
  });
  return {
    id: uid(),
    name: name.trim(),
    grade,
    note: note.trim(),
    overallComment: "",
    nextStep: "",
    weekly,
    createdAt: new Date().toISOString(),
  };
}

function getActiveStudent() {
  return state.students.find((student) => student.id === state.activeStudentId) || null;
}

function getWeeklyRecord(student, weekId = state.activeWeek) {
  if (!student) return blankWeeklyRecord(weekId);
  if (!student.weekly) student.weekly = {};
  if (!student.weekly[weekId]) student.weekly[weekId] = blankWeeklyRecord(weekId);
  const blank = blankWeeklyRecord(weekId);
  student.weekly[weekId] = {
    ...blank,
    ...student.weekly[weekId],
    scores: {
      ...blank.scores,
      ...(student.weekly[weekId].scores || {}),
    },
    portfolio: {
      ...blank.portfolio,
      ...(student.weekly[weekId].portfolio || {}),
    },
  };
  return student.weekly[weekId];
}

function completionForRecord(record) {
  const checks = [
    record.attendance,
    record.productDone,
    record.reflectionDone,
    Boolean(record.artifact?.trim()),
    Boolean(record.teacherNote?.trim()),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function progressForStudent(student) {
  if (!student) return 0;
  const total = weeks.reduce((sum, week) => sum + completionForRecord(getWeeklyRecord(student, week.id)), 0);
  return Math.round((total / weeks.length) * 100);
}

function productCountForStudent(student) {
  if (!student) return 0;
  return weeks.filter((week) => getWeeklyRecord(student, week.id).productDone).length;
}

function badgeCountForStudent(student) {
  if (!student) return 0;
  return weeks.reduce((sum, week) => sum + getWeeklyRecord(student, week.id).badges.length, 0);
}

function allBadgeCount() {
  return state.students.reduce((sum, student) => sum + badgeCountForStudent(student), 0);
}

function allProductCount() {
  return state.students.reduce((sum, student) => sum + productCountForStudent(student), 0);
}

function averageProgress() {
  if (!state.students.length) return 0;
  const total = state.students.reduce((sum, student) => sum + progressForStudent(student), 0);
  return Math.round(total / state.students.length);
}

function setView(view) {
  state.activeView = view;
  saveState();
  render();
}

function render() {
  const titles = {
    dashboard: "Genel Bakış",
    students: "Öğrenciler",
    weekly: "Haftalık Takip",
    portfolio: "Portfolyo",
    quick: "Hızlı Giriş",
    outputs: "Çıktılar",
    report: "Veli Raporu",
    data: "Yedek",
  };

  $$(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${state.activeView}View`).classList.add("active");
  $("#pageTitle").textContent = titles[state.activeView];

  renderStudentPicker();
  renderDashboard();
  renderStudents();
  renderWeekSelect();
  renderWeeklyForm();
  renderPortfolio();
  renderQuickEntry();
  renderOutputs();
  renderReport();
}

function renderStudentPicker() {
  const select = $("#activeStudent");
  select.innerHTML = "";
  if (!state.students.length) {
    select.innerHTML = '<option value="">Öğrenci yok</option>';
    return;
  }
  if (!state.activeStudentId || !state.students.some((student) => student.id === state.activeStudentId)) {
    state.activeStudentId = state.students[0].id;
    saveState();
  }
  state.students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.name} - ${student.grade}`;
    option.selected = student.id === state.activeStudentId;
    select.append(option);
  });
}

function renderDashboard() {
  $("#metricStudents").textContent = state.students.length;
  $("#metricProducts").textContent = allProductCount();
  $("#metricProgress").textContent = `${averageProgress()}%`;
  $("#metricBadges").textContent = allBadgeCount();

  const activeStudent = getActiveStudent();
  renderCharts(activeStudent);
  const weekMap = $("#weekMap");
  weekMap.innerHTML = "";
  weeks.forEach((week) => {
    const record = activeStudent ? getWeeklyRecord(activeStudent, week.id) : null;
    const row = document.createElement("article");
    row.className = "week-row";
    row.innerHTML = `
      <div class="week-number">${week.id}</div>
      <div>
        <h4>${week.title}</h4>
        <p>${week.product}</p>
      </div>
      <span class="status-pill ${record?.productDone ? "done" : ""}">
        ${record?.productDone ? "Tamamlandı" : "Bekliyor"}
      </span>
    `;
    weekMap.append(row);
  });

  const summary = $("#studentSummary");
  if (!activeStudent) {
    $("#selectedStudentHint").textContent = "Kayıtları görmek için öğrenci ekle.";
    summary.innerHTML = '<div class="empty-state">Öğrenci eklediğinde burada ilerleme, ürün ve rozet özeti görünecek.</div>';
    return;
  }

  $("#selectedStudentHint").textContent = `${activeStudent.name} için kısa durum.`;
  const progress = progressForStudent(activeStudent);
  summary.innerHTML = `
    <div>
      <div class="progress-shell"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="brief-text">${progress}% genel ilerleme</p>
    </div>
    <div class="mini-stats">
      <div class="mini-stat"><span>Ürün</span><strong>${productCountForStudent(activeStudent)}/8</strong></div>
      <div class="mini-stat"><span>Rozet</span><strong>${badgeCountForStudent(activeStudent)}</strong></div>
      <div class="mini-stat"><span>Sınıf</span><strong>${activeStudent.grade.replace(" sınıf", "")}</strong></div>
    </div>
    <div class="empty-state">${activeStudent.note || "Bu öğrenci için özel veli notu henüz eklenmedi."}</div>
  `;
}

function renderCharts(activeStudent) {
  renderGroupProgressChart();
  renderStudentTrendChart(activeStudent);
  renderSkillChart(activeStudent);
  renderStudentComparisonChart();
  renderAttendanceHeatmap();
  renderRiskList();
}

function renderGroupProgressChart() {
  const target = $("#groupProgressChart");
  if (!target) return;
  if (!state.students.length) {
    target.innerHTML = chartEmpty("Öğrenci eklediğinde grup ilerlemesi burada görünecek.");
    return;
  }

  const rows = weeks.map((week) => {
    const completed = state.students.filter((student) => getWeeklyRecord(student, week.id).productDone).length;
    const percent = Math.round((completed / state.students.length) * 100);
    return `
      <div class="bar-row">
        <div class="bar-label">${week.id}. Hafta</div>
        <div class="bar-track" aria-label="${week.id}. hafta ${percent}%">
          <div class="bar-fill" style="width:${percent}%"></div>
        </div>
        <div class="bar-value">${completed}/${state.students.length}</div>
      </div>
    `;
  }).join("");

  target.innerHTML = `<div class="bar-chart">${rows}</div>`;
}

function renderStudentTrendChart(student) {
  const target = $("#studentTrendChart");
  if (!target) return;
  if (!student) {
    target.innerHTML = chartEmpty("Bir öğrenci seçtiğinde hafta hafta gidişat çizgisi görünecek.");
    return;
  }

  const points = weeks.map((week) => Math.round(completionForRecord(getWeeklyRecord(student, week.id)) * 100));
  target.innerHTML = `<div class="line-chart">${lineChartSvg(points)}</div>`;
}

function renderSkillChart(student) {
  const target = $("#skillChart");
  if (!target) return;
  if (!student) {
    target.innerHTML = chartEmpty("Katılım, strateji ve Türkçe becerisi puanları için önce öğrenci seç.");
    return;
  }

  const skills = [
    { label: "Katılım", value: averageScore(student, "participation") },
    { label: "Strateji", value: averageScore(student, "strategy") },
    { label: "Türkçe", value: averageScore(student, "turkish") },
  ];

  target.innerHTML = `
    <div class="skill-bars">
      ${skills.map((skill) => {
        const percent = Math.round((skill.value / 2) * 100);
        return `
          <div class="skill-card">
            <div class="skill-card-head">
              <span>${skill.label}</span>
              <span>${skill.value.toFixed(1)} / 2</span>
            </div>
            <div class="bar-track" aria-label="${skill.label} ${percent}%">
              <div class="bar-fill" style="width:${percent}%"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStudentComparisonChart() {
  const target = $("#studentComparisonChart");
  if (!target) return;
  if (!state.students.length) {
    target.innerHTML = chartEmpty("Öğrenci eklediğinde karşılaştırma grafiği burada görünecek.");
    return;
  }

  const rows = [...state.students]
    .sort((a, b) => progressForStudent(b) - progressForStudent(a))
    .map((student) => {
      const percent = progressForStudent(student);
      return `
        <div class="bar-row comparison-row">
          <div class="bar-label">${escapeHtml(shortName(student.name))}</div>
          <div class="bar-track" aria-label="${escapeHtml(student.name)} ${percent}%">
            <div class="bar-fill" style="width:${percent}%"></div>
          </div>
          <div class="bar-value">${percent}%</div>
        </div>
      `;
    }).join("");

  target.innerHTML = `<div class="bar-chart">${rows}</div>`;
}

function renderAttendanceHeatmap() {
  const target = $("#attendanceHeatmap");
  if (!target) return;
  if (!state.students.length) {
    target.innerHTML = chartEmpty("Öğrenci eklediğinde haftalık katılım haritası oluşacak.");
    return;
  }

  const header = weeks.map((week) => `<span>H${week.id}</span>`).join("");
  const rows = state.students.map((student) => {
    const cells = weeks.map((week) => {
      const record = getWeeklyRecord(student, week.id);
      const level = record.productDone ? "done" : record.attendance ? "attended" : "empty";
      const label = record.productDone ? "Ürün tamamlandı" : record.attendance ? "Katıldı" : "Boş";
      return `<span class="heat-cell ${level}" title="${week.id}. hafta: ${label}"></span>`;
    }).join("");
    return `
      <div class="heat-row">
        <strong>${escapeHtml(shortName(student.name))}</strong>
        <div class="heat-cells">${cells}</div>
      </div>
    `;
  }).join("");

  target.innerHTML = `
    <div class="heatmap">
      <div class="heat-head"><span></span><div>${header}</div></div>
      ${rows}
      <div class="heat-legend">
        <span><i class="heat-cell done"></i>Ürün</span>
        <span><i class="heat-cell attended"></i>Katılım</span>
        <span><i class="heat-cell empty"></i>Boş</span>
      </div>
    </div>
  `;
}

function renderRiskList() {
  const target = $("#riskList");
  if (!target) return;
  if (!state.students.length) {
    target.innerHTML = '<div class="empty-state">Öğrenci eklediğinde takip uyarıları burada görünecek.</div>';
    return;
  }

  const risks = state.students.flatMap((student) => {
    const missingProducts = weeks.filter((week) => !getWeeklyRecord(student, week.id).productDone).length;
    const missingAttendance = weeks.filter((week) => !getWeeklyRecord(student, week.id).attendance).length;
    const portfolioCount = portfolioItemsForStudent(student).length;
    const items = [];
    if (missingProducts >= 3) items.push({ name: student.name, type: "Ürün eksiği", detail: `${missingProducts} haftada ürün yok` });
    if (missingAttendance >= 3) items.push({ name: student.name, type: "Katılım takibi", detail: `${missingAttendance} haftada katılım işaretlenmemiş` });
    if (portfolioCount < 2) items.push({ name: student.name, type: "Portfolyo", detail: "Veli raporu için ürün kanıtı az" });
    return items;
  }).slice(0, 8);

  if (!risks.length) {
    target.innerHTML = '<div class="empty-state">Şu an belirgin takip uyarısı yok. Güzel gidiyor.</div>';
    return;
  }

  target.innerHTML = risks.map((risk) => `
    <article class="risk-item">
      <strong>${escapeHtml(risk.name)}</strong>
      <span>${risk.type}</span>
      <p>${risk.detail}</p>
    </article>
  `).join("");
}

function averageScore(student, scoreKey) {
  const values = weeks
    .map((week) => Number(getWeeklyRecord(student, week.id).scores?.[scoreKey] ?? 0))
    .filter((value) => value > 0);
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function lineChartSvg(values) {
  const width = 520;
  const height = 220;
  const padX = 34;
  const padTop = 20;
  const padBottom = 34;
  const chartHeight = height - padTop - padBottom;
  const step = (width - padX * 2) / (values.length - 1);
  const coords = values.map((value, index) => {
    const x = padX + index * step;
    const y = padTop + chartHeight - (value / 100) * chartHeight;
    return { x, y, value, week: index + 1 };
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${coords.at(-1).x} ${height - padBottom} L ${coords[0].x} ${height - padBottom} Z`;
  const grid = [0, 25, 50, 75, 100].map((value) => {
    const y = padTop + chartHeight - (value / 100) * chartHeight;
    return `
      <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="#e5ebf2" />
      <text x="6" y="${y + 4}" class="chart-axis">${value}</text>
    `;
  }).join("");
  const labels = coords.map((point) => `
    <text x="${point.x}" y="${height - 10}" text-anchor="middle" class="chart-axis">H${point.week}</text>
  `).join("");
  const dots = coords.map((point) => `
    <circle cx="${point.x}" cy="${point.y}" r="5" fill="#275ca8" />
    <text x="${point.x}" y="${point.y - 10}" text-anchor="middle" class="chart-axis">${point.value}%</text>
  `).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Haftalık gidişat grafiği">
      <path d="${area}" fill="rgba(39, 92, 168, 0.09)"></path>
      ${grid}
      <path d="${path}" fill="none" stroke="#275ca8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      ${dots}
      ${labels}
    </svg>
  `;
}

function chartEmpty(message) {
  return `<div class="chart-empty">${message}</div>`;
}

function portfolioItemsForStudent(student) {
  if (!student) return [];
  return weeks.map((week) => {
    const record = getWeeklyRecord(student, week.id);
    const portfolio = record.portfolio || {};
    const hasPortfolio = portfolio.title || portfolio.link || portfolio.note || record.artifact;
    if (!hasPortfolio) return null;
    return {
      weekId: week.id,
      weekTitle: week.title,
      title: portfolio.title || week.product,
      type: portfolio.type || "Çalışma formu",
      link: portfolio.link || "",
      note: portfolio.note || "",
      artifact: record.artifact || "",
      showcase: Boolean(portfolio.showcase),
    };
  }).filter(Boolean);
}

function shortName(name) {
  const clean = String(name || "").trim();
  if (clean.length <= 12) return clean;
  return `${clean.slice(0, 11)}…`;
}

function renderStudents() {
  const list = $("#studentList");
  list.innerHTML = "";
  if (!state.students.length) {
    list.innerHTML = '<div class="empty-state">İlk öğrenciyi ekleyerek başla. 9 kişilik grubun tamamını buradan yöneteceksin.</div>';
    return;
  }

  state.students.forEach((student) => {
    const card = document.createElement("article");
    card.className = "student-card";
    card.innerHTML = `
      <div>
        <h4>${escapeHtml(student.name)}</h4>
        <p>${student.grade} · ${progressForStudent(student)}% ilerleme · ${productCountForStudent(student)}/8 ürün</p>
      </div>
      <div class="student-card-actions">
        <button class="small-button" data-action="select" data-id="${student.id}" type="button">Seç</button>
        <button class="small-button" data-action="edit" data-id="${student.id}" type="button">Düzenle</button>
        <button class="small-button delete" data-action="delete" data-id="${student.id}" type="button">Kaldır</button>
      </div>
    `;
    list.append(card);
  });
}

function renderWeekSelect() {
  const select = $("#weekSelect");
  select.innerHTML = "";
  weeks.forEach((week) => {
    const option = document.createElement("option");
    option.value = week.id;
    option.textContent = `${week.id}. Hafta - ${week.title}`;
    option.selected = week.id === Number(state.activeWeek);
    select.append(option);
  });
}

function renderWeeklyForm() {
  const student = getActiveStudent();
  const week = weeks.find((item) => item.id === Number(state.activeWeek)) || weeks[0];
  const record = getWeeklyRecord(student, week.id);

  $("#weekBrief").innerHTML = `
    <div>
      <h4 class="brief-title">${week.id}. Hafta: ${week.title}</h4>
      <p class="brief-text">${week.parentEvidence}</p>
    </div>
    <div class="brief-grid">
      <div class="brief-item"><span>Beceri</span><strong>${week.skill}</strong></div>
      <div class="brief-item"><span>Ürün</span><strong>${week.product}</strong></div>
      <div class="brief-item"><span>Hafta rozeti</span><strong>${week.badge}</strong></div>
    </div>
  `;

  $("#attendance").checked = record.attendance;
  $("#productDone").checked = record.productDone;
  $("#reflectionDone").checked = record.reflectionDone;
  $("#familyShared").checked = record.familyShared;
  $("#scoreParticipation").value = String(record.scores.participation ?? 0);
  $("#scoreStrategy").value = String(record.scores.strategy ?? 0);
  $("#scoreTurkish").value = String(record.scores.turkish ?? 0);
  $("#artifact").value = record.artifact || "";
  $("#teacherNote").value = record.teacherNote || "";
  $("#studentReflection").value = record.studentReflection || "";
  $("#portfolioTitle").value = record.portfolio.title || "";
  $("#portfolioType").value = record.portfolio.type || "Çalışma formu";
  $("#portfolioLink").value = record.portfolio.link || "";
  $("#portfolioNote").value = record.portfolio.note || "";
  $("#portfolioShowcase").checked = Boolean(record.portfolio.showcase);
  $("#recommendation").value = record.recommendation || "";

  const badgeOptions = $("#badgeOptions");
  badgeOptions.innerHTML = "";
  [week.badge, ...extraBadges].forEach((badge) => {
    const label = document.createElement("label");
    label.className = "badge-chip";
    label.innerHTML = `
      <input type="checkbox" value="${escapeHtml(badge)}" ${record.badges.includes(badge) ? "checked" : ""} />
      <span>${badge}</span>
    `;
    badgeOptions.append(label);
  });

  $("#weeklyForm").querySelectorAll("input, select, textarea, button").forEach((control) => {
    control.disabled = !student;
  });
}

function renderPortfolio() {
  const student = getActiveStudent();
  const grid = $("#portfolioGrid");
  const summary = $("#portfolioSummary");
  if (!grid || !summary) return;

  if (!student) {
    grid.innerHTML = '<div class="empty-state">Portfolyo görmek için önce öğrenci ekle.</div>';
    summary.innerHTML = '<div class="empty-state">Öğrenci seçildiğinde ürün sayısı ve öne çıkan çalışmalar burada görünür.</div>';
    return;
  }

  const items = portfolioItemsForStudent(student);
  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">Henüz portfolyo ürünü yok. Haftalık Takip ekranında portfolyo başlığı veya açıklaması ekleyebilirsin.</div>';
  } else {
    grid.innerHTML = items.map((item) => `
      <article class="portfolio-card ${item.showcase ? "showcase" : ""}">
        <div class="portfolio-card-head">
          <span>${item.weekId}. Hafta</span>
          <strong>${escapeHtml(item.title)}</strong>
        </div>
        <p>${escapeHtml(item.note || item.artifact || "Açıklama eklenmedi.")}</p>
        <div class="portfolio-meta">
          <span>${escapeHtml(item.type)}</span>
          ${item.link ? `<span>${escapeHtml(item.link)}</span>` : ""}
          ${item.showcase ? "<span>Öne çıkan</span>" : ""}
        </div>
      </article>
    `).join("");
  }

  const showcaseCount = items.filter((item) => item.showcase).length;
  const completedProducts = productCountForStudent(student);
  summary.innerHTML = `
    <div class="mini-stats portfolio-stats">
      <div class="mini-stat"><span>Portfolyo</span><strong>${items.length}</strong></div>
      <div class="mini-stat"><span>Öne Çıkan</span><strong>${showcaseCount}</strong></div>
      <div class="mini-stat"><span>Ürün</span><strong>${completedProducts}/8</strong></div>
    </div>
    <div class="empty-state">
      Veli raporunda en güçlü etki için en az 3 ürün kanıtı ve 1 öne çıkan çalışma seçmeni öneririm.
    </div>
  `;
}

function renderQuickEntry() {
  const weekSelect = $("#quickWeekSelect");
  const body = $("#quickEntryBody");
  if (!weekSelect || !body) return;

  weekSelect.innerHTML = "";
  weeks.forEach((week) => {
    const option = document.createElement("option");
    option.value = week.id;
    option.textContent = `${week.id}. Hafta - ${week.title}`;
    option.selected = week.id === Number(state.activeWeek);
    weekSelect.append(option);
  });

  if (!state.students.length) {
    body.innerHTML = '<tr><td colspan="9">Öğrenci eklediğinde hızlı giriş tablosu burada görünecek.</td></tr>';
    return;
  }

  body.innerHTML = state.students.map((student) => {
    const record = getWeeklyRecord(student, Number(state.activeWeek));
    return `
      <tr data-student-id="${student.id}">
        <td><strong>${escapeHtml(student.name)}</strong><span>${student.grade}</span></td>
        <td><input data-field="attendance" type="checkbox" ${record.attendance ? "checked" : ""}></td>
        <td><input data-field="productDone" type="checkbox" ${record.productDone ? "checked" : ""}></td>
        <td><input data-field="reflectionDone" type="checkbox" ${record.reflectionDone ? "checked" : ""}></td>
        <td><input data-field="familyShared" type="checkbox" ${record.familyShared ? "checked" : ""}></td>
        <td>${quickScoreSelect("participation", record.scores.participation)}</td>
        <td>${quickScoreSelect("strategy", record.scores.strategy)}</td>
        <td>${quickScoreSelect("turkish", record.scores.turkish)}</td>
        <td><input data-field="teacherNote" value="${escapeHtml(record.teacherNote || "")}" placeholder="Kısa gözlem"></td>
      </tr>
    `;
  }).join("");
}

function quickScoreSelect(field, value) {
  return `
    <select data-score="${field}">
      <option value="0" ${Number(value) === 0 ? "selected" : ""}>0</option>
      <option value="1" ${Number(value) === 1 ? "selected" : ""}>1</option>
      <option value="2" ${Number(value) === 2 ? "selected" : ""}>2</option>
    </select>
  `;
}

function saveQuickEntry() {
  const weekId = Number(state.activeWeek);
  $$("#quickEntryBody tr[data-student-id]").forEach((row) => {
    const student = state.students.find((item) => item.id === row.dataset.studentId);
    if (!student) return;
    const record = getWeeklyRecord(student, weekId);
    record.attendance = row.querySelector('[data-field="attendance"]').checked;
    record.productDone = row.querySelector('[data-field="productDone"]').checked;
    record.reflectionDone = row.querySelector('[data-field="reflectionDone"]').checked;
    record.familyShared = row.querySelector('[data-field="familyShared"]').checked;
    record.scores = {
      participation: Number(row.querySelector('[data-score="participation"]').value),
      strategy: Number(row.querySelector('[data-score="strategy"]').value),
      turkish: Number(row.querySelector('[data-score="turkish"]').value),
    };
    const note = row.querySelector('[data-field="teacherNote"]').value.trim();
    if (note) record.teacherNote = note;
  });
  saveState();
  render();
}

function markQuickCheckboxes(field, checked = true) {
  $$(`#quickEntryBody [data-field="${field}"]`).forEach((input) => {
    input.checked = checked;
  });
}

function renderReport() {
  const student = getActiveStudent();
  const paper = $("#reportPaper");
  if (!student) {
    $("#overallComment").value = "";
    $("#nextStep").value = "";
    paper.innerHTML = '<div class="empty-state">Rapor oluşturmak için önce öğrenci ekle.</div>';
    return;
  }

  $("#overallComment").value = student.overallComment || "";
  $("#nextStep").value = student.nextStep || "";

  const progress = progressForStudent(student);
  const badges = weeks.flatMap((week) => getWeeklyRecord(student, week.id).badges);
  const portfolioItems = portfolioItemsForStudent(student);
  const showcaseItems = portfolioItems.filter((item) => item.showcase).slice(0, 4);
  const rows = weeks.map((week) => {
    const record = getWeeklyRecord(student, week.id);
    return `
      <tr>
        <td>${week.id}</td>
        <td><strong>${week.title}</strong><br>${week.skill}</td>
        <td>${escapeHtml(record.artifact || week.product)}</td>
        <td>${escapeHtml(record.teacherNote || "Kayıt bekliyor.")}</td>
      </tr>
    `;
  }).join("");

  paper.innerHTML = `
    <header>
      <div>
        <img class="document-logo" src="assets/mg-logo-cropped.png" alt="MG logo">
        <p class="eyebrow">8 haftalık öğrenme pasaportu</p>
        <h2>${escapeHtml(student.name)} - Veli Gelişim Raporu</h2>
      </div>
      <div class="report-meta">
        <strong>${student.grade}</strong><br>
        İlerleme: ${progress}%<br>
        Ürün: ${productCountForStudent(student)}/8
      </div>
    </header>

    <section class="report-section">
      <h3>Kısa Değerlendirme</h3>
      <p>${escapeHtml(student.overallComment || autoOverall(student))}</p>
    </section>

    <section class="report-section">
      <h3>Haftalık Gelişim Grafiği</h3>
      <div class="report-chart">
        ${lineChartSvg(weeks.map((week) => Math.round(completionForRecord(getWeeklyRecord(student, week.id)) * 100)))}
      </div>
    </section>

    <section class="report-section">
      <h3>Portfolyo Vitrini</h3>
      <div class="report-portfolio">
        ${(showcaseItems.length ? showcaseItems : portfolioItems.slice(0, 3)).map((item) => `
          <article>
            <strong>${item.weekId}. Hafta - ${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.note || item.artifact || "Ürün açıklaması eklenmedi.")}</p>
            <span>${escapeHtml(item.type)}${item.link ? ` · ${escapeHtml(item.link)}` : ""}</span>
          </article>
        `).join("") || "<p>Henüz portfolyo ürünü eklenmedi.</p>"}
      </div>
    </section>

    <section class="report-section">
      <h3>Haftalık Kanıtlar</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>Hafta</th>
            <th>Beceri</th>
            <th>Ürün / Kanıt</th>
            <th>Öğretmen Gözlemi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <section class="report-section">
      <h3>Öğrencinin Kendi Cümleleri</h3>
      <ul>
        ${weeks.map((week) => {
          const text = getWeeklyRecord(student, week.id).studentReflection;
          return text ? `<li>${escapeHtml(text)}</li>` : "";
        }).join("") || "<li>Henüz öğrenci yansıtması eklenmedi.</li>"}
      </ul>
    </section>

    <section class="report-section">
      <h3>Rozetler</h3>
      <div class="tag-list">
        ${badges.length ? badges.map((badge) => `<span class="tag">${escapeHtml(badge)}</span>`).join("") : '<span class="tag">Rozet bekliyor</span>'}
      </div>
    </section>

    <section class="report-section">
      <h3>Yeni Dönem İçin Öneri</h3>
      <p>${escapeHtml(student.nextStep || autoNextStep(student))}</p>
    </section>
  `;
}

function renderOutputs() {
  const summary = $("#classSummaryPaper");
  const certificate = $("#certificatePaper");
  const whatsapp = $("#whatsappMessage");
  if (!summary || !certificate || !whatsapp) return;

  const activeStudent = getActiveStudent();
  const rows = state.students.map((student) => `
    <tr>
      <td>${escapeHtml(student.name)}</td>
      <td>${student.grade}</td>
      <td>${progressForStudent(student)}%</td>
      <td>${productCountForStudent(student)}/8</td>
      <td>${portfolioItemsForStudent(student).length}</td>
      <td>${badgeCountForStudent(student)}</td>
    </tr>
  `).join("");

  summary.innerHTML = `
    <header>
      <div>
        <img class="document-logo" src="assets/mg-logo-cropped.png" alt="MG logo">
        <p class="eyebrow">Etkili Öğrenme Kampı sınıf özeti</p>
        <h2>8 Haftalık Grup Gelişim Raporu</h2>
      </div>
      <div class="report-meta">
        Öğrenci: ${state.students.length}<br>
        Ortalama ilerleme: ${averageProgress()}%<br>
        Ürün: ${allProductCount()}
      </div>
    </header>
    <section class="report-section">
      <h3>Genel Durum</h3>
      <p>Bu özet, öğrencilerin haftalık ürün tamamlama, katılım, portfolyo ve rozet durumlarını hızlıca görmek için hazırlanmıştır.</p>
      <table class="report-table">
        <thead>
          <tr>
            <th>Öğrenci</th>
            <th>Sınıf</th>
            <th>İlerleme</th>
            <th>Ürün</th>
            <th>Portfolyo</th>
            <th>Rozet</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Henüz öğrenci yok.</td></tr>'}</tbody>
      </table>
    </section>
  `;

  certificate.innerHTML = `
    <div class="certificate-inner">
      <div class="certificate-watermark" aria-hidden="true">
        <img src="assets/mg-logo-cropped.png" alt="">
      </div>
      <div class="certificate-top">
        <img class="certificate-logo" src="assets/mg-logo-cropped.png" alt="MG logo">
        <div>
          <p class="eyebrow">8 Haftalık Etkili Öğrenme Kampı</p>
          <h3>Katılım ve Gelişim Belgesi</h3>
        </div>
      </div>
      <div class="certificate-ribbon">Başarıyla Tamamladı</div>
      <h2>${activeStudent ? escapeHtml(activeStudent.name) : "Öğrenci Adı"}</h2>
      <p class="certificate-copy">Planlama, odaklanma, okuma-anlama, aktif hatırlama, aralıklı tekrar ve not tutma becerileri üzerine uygulamalı çalışmalara katılmış; süreç boyunca kendi öğrenme alışkanlıklarını görünür hale getirmiştir.</p>
      <div class="certificate-meta">
        <span><strong>${activeStudent ? progressForStudent(activeStudent) : 0}%</strong> İlerleme</span>
        <span><strong>${activeStudent ? productCountForStudent(activeStudent) : 0}/8</strong> Ürün</span>
        <span><strong>${activeStudent ? portfolioItemsForStudent(activeStudent).length : 0}</strong> Portfolyo</span>
      </div>
      <div class="certificate-footer">
        <div class="signature-block">
          <span></span>
          <strong>Öğretmen İmzası</strong>
        </div>
        <div class="certificate-seal">MG</div>
        <div class="signature-block">
          <span></span>
          <strong>Tarih</strong>
        </div>
      </div>
    </div>
  `;

  whatsapp.value = buildWhatsappMessage(activeStudent);
}

function buildWhatsappMessage(student) {
  if (!student) {
    return "Merhaba, bu hafta Etkili Öğrenme Kampı kapsamında öğrencilerimizle planlı çalışma, okuma-anlama ve öğrenme stratejileri üzerine uygulamalı çalışmalar yaptık. Öğrenci seçildiğinde bu alanda kişisel veli mesajı oluşacaktır.";
  }
  const latestWeek = [...weeks].reverse().find((week) => {
    const record = getWeeklyRecord(student, week.id);
    return record.attendance || record.productDone || record.teacherNote || record.artifact;
  }) || weeks[0];
  const record = getWeeklyRecord(student, latestWeek.id);
  return `Merhaba, ${student.name} için kısa kamp bilgilendirmesi paylaşmak istedim. ${latestWeek.id}. haftada "${latestWeek.title}" üzerine çalıştık. ${record.artifact || "Haftalık ürün/kanıt kaydı henüz tamamlanmadı."} Öğretmen gözlemim: ${record.teacherNote || "Gözlem notu eklenecek."} Yeni dönem için önerim: ${record.recommendation || autoNextStep(student)} Teşekkür ederim.`;
}

function autoOverall(student) {
  const progress = progressForStudent(student);
  if (progress >= 75) {
    return "Öğrenci kamp boyunca düzenli katılım ve somut ürünlerle güçlü bir öğrenme süreci ortaya koydu. Planlama, odaklanma ve okuma-anlama başlıklarında takip edilebilir gelişim kanıtları oluştu.";
  }
  if (progress >= 40) {
    return "Öğrenci kamp sürecinde birden fazla beceriyi denedi ve kendisi için işe yarayan yöntemleri fark etmeye başladı. Düzenli uygulama arttıkça bu kazanımlar daha kalıcı hale gelecektir.";
  }
  return "Öğrencinin kayıtları henüz sınırlı. Haftalık ürünler tamamlandıkça planlama, odaklanma ve okuma-anlama alanlarındaki gelişim daha net görülecektir.";
}

function autoNextStep(student) {
  const weakWeeks = weeks.filter((week) => !getWeeklyRecord(student, week.id).productDone).slice(0, 2);
  if (weakWeeks.length) {
    return `Yeni döneme başlarken haftada 3 gün 20 dakikalık kısa çalışma rutini önerilir. Öncelikli destek alanları: ${weakWeeks.map((week) => week.title).join(", ")}.`;
  }
  return "Yeni dönemde haftada 3 gün 20 dakikalık odak çalışması, 3 gün 15 dakikalık okuma ve haftada 1 kısa tekrar rutini sürdürülebilir.";
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#activeStudent").addEventListener("change", (event) => {
    state.activeStudentId = event.target.value;
    saveState();
    render();
  });

  $("#studentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#studentName").value.trim();
    if (!name) return;
    const student = createStudent({
      name,
      grade: $("#studentGrade").value,
      note: $("#studentNote").value,
    });
    state.students.push(student);
    state.activeStudentId = student.id;
    saveState();
    event.target.reset();
    render();
  });

  $("#studentList").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const student = state.students.find((item) => item.id === button.dataset.id);
    if (!student) return;

    if (button.dataset.action === "select") {
      state.activeStudentId = student.id;
      state.activeView = "weekly";
    }

    if (button.dataset.action === "edit") {
      const name = prompt("Öğrenci adı", student.name);
      if (name === null) return;
      const grade = prompt("Sınıf", student.grade);
      if (grade === null) return;
      const note = prompt("Veli notu", student.note || "");
      if (note === null) return;
      student.name = name.trim() || student.name;
      student.grade = grade.trim() || student.grade;
      student.note = note.trim();
    }

    if (button.dataset.action === "delete") {
      const ok = confirm(`${student.name} kaydı kaldırılsın mı?`);
      if (!ok) return;
      state.students = state.students.filter((item) => item.id !== student.id);
      if (state.activeStudentId === student.id) {
        state.activeStudentId = state.students[0]?.id || null;
      }
    }

    saveState();
    render();
  });

  $("#weekSelect").addEventListener("change", (event) => {
    state.activeWeek = Number(event.target.value);
    saveState();
    renderWeeklyForm();
  });

  $("#quickWeekSelect").addEventListener("change", (event) => {
    state.activeWeek = Number(event.target.value);
    saveState();
    render();
  });

  $("#weeklyForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const student = getActiveStudent();
    if (!student) return;
    const record = getWeeklyRecord(student, Number(state.activeWeek));
    record.attendance = $("#attendance").checked;
    record.productDone = $("#productDone").checked;
    record.reflectionDone = $("#reflectionDone").checked;
    record.familyShared = $("#familyShared").checked;
    record.scores = {
      participation: Number($("#scoreParticipation").value),
      strategy: Number($("#scoreStrategy").value),
      turkish: Number($("#scoreTurkish").value),
    };
    record.artifact = $("#artifact").value.trim();
    record.teacherNote = $("#teacherNote").value.trim();
    record.studentReflection = $("#studentReflection").value.trim();
    record.portfolio = {
      title: $("#portfolioTitle").value.trim(),
      type: $("#portfolioType").value,
      link: $("#portfolioLink").value.trim(),
      note: $("#portfolioNote").value.trim(),
      showcase: $("#portfolioShowcase").checked,
    };
    record.recommendation = $("#recommendation").value.trim();
    record.badges = $$("#badgeOptions input:checked").map((input) => input.value);
    saveState();
    render();
  });

  $("#saveReportNotes").addEventListener("click", () => {
    const student = getActiveStudent();
    if (!student) return;
    student.overallComment = $("#overallComment").value.trim();
    student.nextStep = $("#nextStep").value.trim();
    saveState();
    renderReport();
  });

  $("#printReport").addEventListener("click", () => {
    state.activeView = "report";
    saveState();
    render();
    window.print();
  });

  $("#saveSnapshot").addEventListener("click", downloadJson);
  $("#downloadJson").addEventListener("click", downloadJson);
  $("#downloadCsv").addEventListener("click", downloadCsv);
  $("#saveQuickEntry").addEventListener("click", saveQuickEntry);
  $("#markAllAttendance").addEventListener("click", () => markQuickCheckboxes("attendance", true));
  $("#markAllFamilyShared").addEventListener("click", () => markQuickCheckboxes("familyShared", true));
  $("#printClassSummary").addEventListener("click", () => printOutput("class-summary"));
  $("#printCertificate").addEventListener("click", () => printOutput("certificate"));
  $("#copyWhatsappMessage").addEventListener("click", async () => {
    const message = $("#whatsappMessage").value;
    try {
      await navigator.clipboard.writeText(message);
      alert("WhatsApp metni kopyalandı.");
    } catch {
      $("#whatsappMessage").select();
      document.execCommand("copy");
      alert("WhatsApp metni kopyalandı.");
    }
  });

  $("#restoreFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const restored = JSON.parse(text);
      if (!Array.isArray(restored.students)) throw new Error("Geçersiz dosya");
      state = { ...structuredClone(defaultState), ...restored };
      saveState();
      render();
    } catch {
      alert("Bu JSON dosyası yüklenemedi.");
    } finally {
      event.target.value = "";
    }
  });

  $("#resetApp").addEventListener("click", () => {
    const ok = confirm("Tüm yerel veriler temizlensin mi? Önce yedek almanı öneririm.");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultState);
    render();
  });
}

function printOutput(mode) {
  state.activeView = "outputs";
  saveState();
  render();
  document.body.dataset.printMode = mode;
  window.print();
  setTimeout(() => {
    delete document.body.dataset.printMode;
  }, 500);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `etkili-ogrenme-kampi-yedek-${todayStamp()}.json`);
}

function downloadCsv() {
  const header = [
    "Öğrenci",
    "Sınıf",
    "Hafta",
    "Konu",
    "Katılım",
    "Ürün",
    "Öz Değerlendirme",
    "Strateji",
    "Türkçe",
    "Gözlem",
  ];
  const rows = state.students.flatMap((student) => weeks.map((week) => {
    const record = getWeeklyRecord(student, week.id);
    return [
      student.name,
      student.grade,
      week.id,
      week.title,
      record.attendance ? "Evet" : "Hayır",
      record.productDone ? "Evet" : "Hayır",
      record.reflectionDone ? "Evet" : "Hayır",
      record.scores.strategy,
      record.scores.turkish,
      record.teacherNote,
    ];
  }));
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `etkili-ogrenme-kampi-özet-${todayStamp()}.csv`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

bindEvents();
render();
