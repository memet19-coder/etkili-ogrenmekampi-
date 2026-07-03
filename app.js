const STORAGE_KEY = "yaz-kampi-takip-v3";

const weeks = [
  {
    id: 1,
    title: "Calisma Aliskanligini Tanima",
    skill: "Oz farkindalik",
    product: "Mini test + 3 gun 20 dk takip",
    parentEvidence: "Ogrenci calisirken nerede zorlandigini fark eder.",
    badge: "Baslangic Kaşifi",
  },
  {
    id: 2,
    title: "Tatilde Sıkılmadan Plan Yapma",
    skill: "Planlama",
    product: "Gunluk ve haftalik mini plan",
    parentEvidence: "Dinlenme, gelisim ve sorumluluk dengesini kurar.",
    badge: "Plan Ustasi",
  },
  {
    id: 3,
    title: "Unutma Egrisi ve Aralikli Tekrar",
    skill: "Tekrar sistemi",
    product: "Tekrar cizelgesi",
    parentEvidence: "Unutmanin normal oldugunu ve kisa tekrarlarin ise yaradigini gorur.",
    badge: "Tekrar Stratejisti",
  },
  {
    id: 4,
    title: "Aktif Hatirlama",
    skill: "Kendini test etme",
    product: "Kapat-anlat kaydi veya notu",
    parentEvidence: "Sadece okumak yerine bakmadan anlatmayi dener.",
    badge: "Hatirlama Dedektifi",
  },
  {
    id: 5,
    title: "Odaklanma ve Dikkat",
    skill: "Dikkat yonetimi",
    product: "3 odak denemesi formu",
    parentEvidence: "Dikkat dagiticilarini tanir ve kisa odak rutini kurar.",
    badge: "Odak Kahramani",
  },
  {
    id: 6,
    title: "Okuma-Anlama ve Paragraf",
    skill: "Okuma stratejisi",
    product: "3 gun okuma + tek cumle ozet",
    parentEvidence: "Konu, ana fikir, kanit ve ozetleme calisir.",
    badge: "Okuma Kaşifi",
  },
  {
    id: 7,
    title: "Not Tutma ve Zihin Haritasi",
    skill: "Bilgiyi duzenleme",
    product: "Zihin haritasi + 3 cumle ozet",
    parentEvidence: "Anahtar kelime, ozet ve gorsel duzenleme becerisi gelisir.",
    badge: "Harita Uzmani",
  },
  {
    id: 8,
    title: "Yeni Doneme Guclu Baslangic",
    skill: "Hedef ve surdurme",
    product: "Yeni donem planı + kendime mektup",
    parentEvidence: "Kendi guclu yonlerini ve yeni donem hedeflerini belirler.",
    badge: "Yeni Donem Hazirim",
  },
];

const extraBadges = [
  "Duzenli Katilim",
  "Sorumluluk Alani",
  "Guzel Paylasim",
  "Gelisim Cesareti",
  "Kisa Ama Duzenli",
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
    dashboard: "Genel Bakis",
    students: "Ogrenciler",
    weekly: "Haftalik Takip",
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
  renderReport();
}

function renderStudentPicker() {
  const select = $("#activeStudent");
  select.innerHTML = "";
  if (!state.students.length) {
    select.innerHTML = '<option value="">Ogrenci yok</option>';
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
        ${record?.productDone ? "Tamamlandi" : "Bekliyor"}
      </span>
    `;
    weekMap.append(row);
  });

  const summary = $("#studentSummary");
  if (!activeStudent) {
    $("#selectedStudentHint").textContent = "Kayitlari gormek icin ogrenci ekle.";
    summary.innerHTML = '<div class="empty-state">Ogrenci eklediginde burada ilerleme, urun ve rozet ozeti gorunecek.</div>';
    return;
  }

  $("#selectedStudentHint").textContent = `${activeStudent.name} icin kisa durum.`;
  const progress = progressForStudent(activeStudent);
  summary.innerHTML = `
    <div>
      <div class="progress-shell"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="brief-text">${progress}% genel ilerleme</p>
    </div>
    <div class="mini-stats">
      <div class="mini-stat"><span>Urun</span><strong>${productCountForStudent(activeStudent)}/8</strong></div>
      <div class="mini-stat"><span>Rozet</span><strong>${badgeCountForStudent(activeStudent)}</strong></div>
      <div class="mini-stat"><span>Sinif</span><strong>${activeStudent.grade.replace(" sinif", "")}</strong></div>
    </div>
    <div class="empty-state">${activeStudent.note || "Bu ogrenci icin ozel veli notu henuz eklenmedi."}</div>
  `;
}

function renderCharts(activeStudent) {
  renderGroupProgressChart();
  renderStudentTrendChart(activeStudent);
  renderSkillChart(activeStudent);
}

function renderGroupProgressChart() {
  const target = $("#groupProgressChart");
  if (!target) return;
  if (!state.students.length) {
    target.innerHTML = chartEmpty("Ogrenci eklediginde grup ilerlemesi burada gorunecek.");
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
    target.innerHTML = chartEmpty("Bir ogrenci sectiginde hafta hafta gidisat cizgisi gorunecek.");
    return;
  }

  const points = weeks.map((week) => Math.round(completionForRecord(getWeeklyRecord(student, week.id)) * 100));
  target.innerHTML = `<div class="line-chart">${lineChartSvg(points)}</div>`;
}

function renderSkillChart(student) {
  const target = $("#skillChart");
  if (!target) return;
  if (!student) {
    target.innerHTML = chartEmpty("Katilim, strateji ve Turkce becerisi puanlari icin once ogrenci sec.");
    return;
  }

  const skills = [
    { label: "Katilim", value: averageScore(student, "participation") },
    { label: "Strateji", value: averageScore(student, "strategy") },
    { label: "Turkce", value: averageScore(student, "turkish") },
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Haftalik gidisat grafigi">
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

function renderStudents() {
  const list = $("#studentList");
  list.innerHTML = "";
  if (!state.students.length) {
    list.innerHTML = '<div class="empty-state">Ilk ogrenciyi ekleyerek basla. 9 kisilik grubun tamamini buradan yoneteceksin.</div>';
    return;
  }

  state.students.forEach((student) => {
    const card = document.createElement("article");
    card.className = "student-card";
    card.innerHTML = `
      <div>
        <h4>${escapeHtml(student.name)}</h4>
        <p>${student.grade} · ${progressForStudent(student)}% ilerleme · ${productCountForStudent(student)}/8 urun</p>
      </div>
      <div class="student-card-actions">
        <button class="small-button" data-action="select" data-id="${student.id}" type="button">Sec</button>
        <button class="small-button" data-action="edit" data-id="${student.id}" type="button">Duzenle</button>
        <button class="small-button delete" data-action="delete" data-id="${student.id}" type="button">Kaldir</button>
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
      <div class="brief-item"><span>Urun</span><strong>${week.product}</strong></div>
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

function renderReport() {
  const student = getActiveStudent();
  const paper = $("#reportPaper");
  if (!student) {
    $("#overallComment").value = "";
    $("#nextStep").value = "";
    paper.innerHTML = '<div class="empty-state">Rapor olusturmak icin once ogrenci ekle.</div>';
    return;
  }

  $("#overallComment").value = student.overallComment || "";
  $("#nextStep").value = student.nextStep || "";

  const progress = progressForStudent(student);
  const badges = weeks.flatMap((week) => getWeeklyRecord(student, week.id).badges);
  const rows = weeks.map((week) => {
    const record = getWeeklyRecord(student, week.id);
    return `
      <tr>
        <td>${week.id}</td>
        <td><strong>${week.title}</strong><br>${week.skill}</td>
        <td>${escapeHtml(record.artifact || week.product)}</td>
        <td>${escapeHtml(record.teacherNote || "Kayit bekliyor.")}</td>
      </tr>
    `;
  }).join("");

  paper.innerHTML = `
    <header>
      <div>
        <p class="eyebrow">8 haftalik ogrenme pasaportu</p>
        <h2>${escapeHtml(student.name)} - Veli Gelisim Raporu</h2>
      </div>
      <div class="report-meta">
        <strong>${student.grade}</strong><br>
        Ilerleme: ${progress}%<br>
        Urun: ${productCountForStudent(student)}/8
      </div>
    </header>

    <section class="report-section">
      <h3>Kisa Degerlendirme</h3>
      <p>${escapeHtml(student.overallComment || autoOverall(student))}</p>
    </section>

    <section class="report-section">
      <h3>Haftalik Gelisim Grafigi</h3>
      <div class="report-chart">
        ${lineChartSvg(weeks.map((week) => Math.round(completionForRecord(getWeeklyRecord(student, week.id)) * 100)))}
      </div>
    </section>

    <section class="report-section">
      <h3>Haftalik Kanitlar</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>Hafta</th>
            <th>Beceri</th>
            <th>Urun / Kanit</th>
            <th>Ogretmen Gozlemi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <section class="report-section">
      <h3>Ogrencinin Kendi Cumleleri</h3>
      <ul>
        ${weeks.map((week) => {
          const text = getWeeklyRecord(student, week.id).studentReflection;
          return text ? `<li>${escapeHtml(text)}</li>` : "";
        }).join("") || "<li>Henuz ogrenci yansitmasi eklenmedi.</li>"}
      </ul>
    </section>

    <section class="report-section">
      <h3>Rozetler</h3>
      <div class="tag-list">
        ${badges.length ? badges.map((badge) => `<span class="tag">${escapeHtml(badge)}</span>`).join("") : '<span class="tag">Rozet bekliyor</span>'}
      </div>
    </section>

    <section class="report-section">
      <h3>Yeni Donem Icin Oneri</h3>
      <p>${escapeHtml(student.nextStep || autoNextStep(student))}</p>
    </section>
  `;
}

function autoOverall(student) {
  const progress = progressForStudent(student);
  if (progress >= 75) {
    return "Ogrenci kamp boyunca duzenli katilim ve somut urunlerle guclu bir ogrenme sureci ortaya koydu. Planlama, odaklanma ve okuma-anlama basliklarinda takip edilebilir gelisim kanitlari olustu.";
  }
  if (progress >= 40) {
    return "Ogrenci kamp surecinde birden fazla beceriyi denedi ve kendisi icin ise yarayan yontemleri fark etmeye basladi. Duzenli uygulama arttikca bu kazanımlar daha kalici hale gelecektir.";
  }
  return "Ogrencinin kayitlari henuz sinirli. Haftalik urunler tamamlandikca planlama, odaklanma ve okuma-anlama alanlarindaki gelisim daha net gorulecektir.";
}

function autoNextStep(student) {
  const weakWeeks = weeks.filter((week) => !getWeeklyRecord(student, week.id).productDone).slice(0, 2);
  if (weakWeeks.length) {
    return `Yeni doneme baslarken haftada 3 gun 20 dakikalik kisa calisma rutini onerilir. Oncelikli destek alanlari: ${weakWeeks.map((week) => week.title).join(", ")}.`;
  }
  return "Yeni donemde haftada 3 gun 20 dakikalik odak calismasi, 3 gun 15 dakikalik okuma ve haftada 1 kisa tekrar rutini surdurulebilir.";
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
      const name = prompt("Ogrenci adi", student.name);
      if (name === null) return;
      const grade = prompt("Sinif", student.grade);
      if (grade === null) return;
      const note = prompt("Veli notu", student.note || "");
      if (note === null) return;
      student.name = name.trim() || student.name;
      student.grade = grade.trim() || student.grade;
      student.note = note.trim();
    }

    if (button.dataset.action === "delete") {
      const ok = confirm(`${student.name} kaydi kaldirilsin mi?`);
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

  $("#restoreFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const restored = JSON.parse(text);
      if (!Array.isArray(restored.students)) throw new Error("Gecersiz dosya");
      state = { ...structuredClone(defaultState), ...restored };
      saveState();
      render();
    } catch {
      alert("Bu JSON dosyasi yuklenemedi.");
    } finally {
      event.target.value = "";
    }
  });

  $("#resetApp").addEventListener("click", () => {
    const ok = confirm("Tum yerel veriler temizlensin mi? Once yedek almani oneririm.");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultState);
    render();
  });
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `yaz-kampi-yedek-${todayStamp()}.json`);
}

function downloadCsv() {
  const header = [
    "Ogrenci",
    "Sinif",
    "Hafta",
    "Konu",
    "Katilim",
    "Urun",
    "Oz Degerlendirme",
    "Strateji",
    "Turkce",
    "Gozlem",
  ];
  const rows = state.students.flatMap((student) => weeks.map((week) => {
    const record = getWeeklyRecord(student, week.id);
    return [
      student.name,
      student.grade,
      week.id,
      week.title,
      record.attendance ? "Evet" : "Hayir",
      record.productDone ? "Evet" : "Hayir",
      record.reflectionDone ? "Evet" : "Hayir",
      record.scores.strategy,
      record.scores.turkish,
      record.teacherNote,
    ];
  }));
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `yaz-kampi-ozet-${todayStamp()}.csv`);
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
