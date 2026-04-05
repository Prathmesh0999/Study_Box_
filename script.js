const STORAGE_KEY = "edutrack-portal-data";
const SESSION_KEY = "edutrack-portal-session";
const STORAGE_VERSION_KEY = "edutrack-portal-data-version";
const STORAGE_VERSION = "fresh-start-v1";
const BOARDS = ["CBSE", "GBSE"];
const CLASSES = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

const seedData = {
  admin: {
    email: "Studybox",
    password: "2000",
    name: "Academic Admin"
  },
  students: []
};

const elements = {
  authView: document.querySelector("#auth-view"),
  adminView: document.querySelector("#admin-view"),
  studentView: document.querySelector("#student-view"),
  authMessage: document.querySelector("#auth-message"),
  loginForm: document.querySelector("#login-form"),
  adminLogout: document.querySelector("#admin-logout"),
  studentForm: document.querySelector("#student-form"),
  removeStudentForm: document.querySelector("#remove-student-form"),
  removeMarkForm: document.querySelector("#remove-mark-form"),
  removeAttendanceForm: document.querySelector("#remove-attendance-form"),
  marksForm: document.querySelector("#marks-form"),
  attendanceForm: document.querySelector("#attendance-form"),
  downloadForm: document.querySelector("#download-form"),
  studentBoardSelect: document.querySelector("#student-board-select"),
  studentClassSelect: document.querySelector("#student-class-select"),
  marksBoardSelect: document.querySelector("#marks-board-select"),
  marksClassSelect: document.querySelector("#marks-class-select"),
  marksStudentSelect: document.querySelector("#marks-student-select"),
  attendanceBoardSelect: document.querySelector("#attendance-board-select"),
  attendanceClassSelect: document.querySelector("#attendance-class-select"),
  attendanceStudentList: document.querySelector("#attendance-student-list"),
  downloadBoardSelect: document.querySelector("#download-board-select"),
  downloadClassSelect: document.querySelector("#download-class-select"),
  downloadStudentSelect: document.querySelector("#download-student-select"),
  removeStudentBoardSelect: document.querySelector("#remove-student-board-select"),
  removeStudentClassSelect: document.querySelector("#remove-student-class-select"),
  removeStudentSelect: document.querySelector("#remove-student-select"),
  removeMarkStudentSelect: document.querySelector("#remove-mark-student-select"),
  removeMarkSelect: document.querySelector("#remove-mark-select"),
  removeAttendanceStudentSelect: document.querySelector("#remove-attendance-student-select"),
  removeAttendanceSelect: document.querySelector("#remove-attendance-select"),
  recordsBoardSelect: document.querySelector("#records-board-select"),
  recordsClassSelect: document.querySelector("#records-class-select"),
  adminRecords: document.querySelector("#admin-records"),
  dashboardSummaryGrid: document.querySelector("#dashboard-summary-grid"),
  adminDashboardLayout: document.querySelector("#admin-dashboard-layout"),
  adminSidePanel: document.querySelector("#admin-side-panel"),
  studentRecords: document.querySelector("#student-records"),
  adminStats: document.querySelector("#admin-stats"),
  studentAttendancePercentage: document.querySelector("#student-attendance-percentage"),
  studentAttendanceText: document.querySelector("#student-attendance-text"),
  studentAverageScore: document.querySelector("#student-average-score"),
  studentAverageText: document.querySelector("#student-average-text"),
  studentClassChip: document.querySelector("#student-class-chip")
};

function cloneSeedData() {
  return JSON.parse(JSON.stringify(seedData));
}

function normalizeClassName(className) {
  const map = {
    "Class 5": "5th",
    "Class 6": "6th",
    "Class 7": "7th",
    "Class 8": "8th",
    "Class 9": "9th",
    "Class 10": "10th",
    "Class 11": "11th",
    "Class 12": "12th"
  };

  return map[className] || (CLASSES.includes(className) ? className : "5th");
}

function loadData() {
  const version = localStorage.getItem(STORAGE_VERSION_KEY);
  if (version !== STORAGE_VERSION) {
    const initialData = cloneSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    return initialData;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialData = cloneSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    return initialData;
  }

  try {
    const parsed = JSON.parse(stored);
    parsed.students = parsed.students.map((student) => ({
      ...student,
      board: student.board || "CBSE",
      className: normalizeClassName(student.className),
      email: student.email || "",
      marks: Array.isArray(student.marks) ? student.marks : [],
      attendance: Array.isArray(student.attendance) ? student.attendance : []
    }));
    return parsed;
  } catch (error) {
    const fallback = cloneSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    return fallback;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSession() {
  return null;
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function showMessage(message, type = "") {
  elements.authMessage.textContent = message;
  elements.authMessage.className = `status-message ${type}`.trim();
}

function getTodayLocalDate() {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offsetMinutes * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

function setupAdminPanels() {
  const buttons = Array.from(document.querySelectorAll(".panel-button"));
  const panels = Array.from(document.querySelectorAll(".admin-panel"));

  const activatePanel = (targetId) => {
    buttons.forEach((item) => item.classList.toggle("is-active", item.dataset.panelTarget === targetId));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === targetId));
    const isDashboard = targetId === "dashboard-panel";
    elements.adminSidePanel.classList.toggle("hidden", isDashboard);
    elements.adminDashboardLayout.classList.toggle("dashboard-grid-dashboard", isDashboard);
    elements.adminDashboardLayout.classList.toggle("dashboard-grid-sections", !isDashboard);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activatePanel(button.dataset.panelTarget);
    });
  });

  document.querySelectorAll("[data-panel-open]").forEach((button) => {
    button.addEventListener("click", () => {
      activatePanel(button.getAttribute("data-panel-open"));
    });
  });
}

function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

function getStudentById(data, studentId) {
  return data.students.find((student) => student.id === studentId);
}

function getStudentsByBoardAndClass(data, board, className) {
  return data.students.filter((student) => student.board === board && student.className === className);
}

function optionMarkup(values, includeAll = false, allLabel = "All") {
  const options = includeAll ? [`<option value="all">${allLabel}</option>`] : [];
  values.forEach((value) => options.push(`<option value="${value}">${value}</option>`));
  return options.join("");
}

function syncBoardAndClassOptions() {
  const boardMarkup = optionMarkup(BOARDS);
  const classMarkup = optionMarkup(CLASSES);
  const allBoardMarkup = optionMarkup(BOARDS, true, "All Boards");
  const allClassMarkup = optionMarkup(CLASSES, true, "All Classes");

  elements.studentBoardSelect.innerHTML = boardMarkup;
  elements.studentClassSelect.innerHTML = classMarkup;
  elements.marksBoardSelect.innerHTML = boardMarkup;
  elements.attendanceBoardSelect.innerHTML = boardMarkup;
  elements.downloadBoardSelect.innerHTML = boardMarkup;
  elements.removeStudentBoardSelect.innerHTML = boardMarkup;
  elements.recordsBoardSelect.innerHTML = allBoardMarkup;

  elements.marksClassSelect.innerHTML = classMarkup;
  elements.attendanceClassSelect.innerHTML = classMarkup;
  elements.downloadClassSelect.innerHTML = classMarkup;
  elements.removeStudentClassSelect.innerHTML = classMarkup;
  elements.recordsClassSelect.innerHTML = allClassMarkup;
}

function syncStudentSelect(select, students) {
  select.innerHTML = students.length
    ? students.map((student) => `<option value="${student.id}">${student.id} - ${student.name}</option>`).join("")
    : `<option value="">No students found</option>`;
}

function updateStudentsForMarks(data) {
  const students = getStudentsByBoardAndClass(data, elements.marksBoardSelect.value, elements.marksClassSelect.value);
  syncStudentSelect(elements.marksStudentSelect, students);
}

function updateStudentsForDownload(data) {
  const students = getStudentsByBoardAndClass(data, elements.downloadBoardSelect.value, elements.downloadClassSelect.value);
  syncStudentSelect(elements.downloadStudentSelect, students);
}

function updateStudentsForRemoveStudent(data) {
  const students = getStudentsByBoardAndClass(data, elements.removeStudentBoardSelect.value, elements.removeStudentClassSelect.value);
  syncStudentSelect(elements.removeStudentSelect, students);
}

function syncEntryStudentSelects(data) {
  const studentOptions = data.students.length
    ? data.students.map((student) => `<option value="${student.id}">${student.id} - ${student.name}</option>`).join("")
    : `<option value="">No students found</option>`;

  elements.removeMarkStudentSelect.innerHTML = studentOptions;
  elements.removeAttendanceStudentSelect.innerHTML = studentOptions;
}

function syncMarkOptions(data) {
  const student = getStudentById(data, elements.removeMarkStudentSelect.value);
  const options = student && student.marks.length
    ? student.marks.map((record, index) => `<option value="${index}">${record.subject} | ${record.examType} | ${record.marks}/${record.maxMarks}</option>`).join("")
    : `<option value="">No marks found</option>`;
  elements.removeMarkSelect.innerHTML = options;
}

function syncAttendanceOptions(data) {
  const student = getStudentById(data, elements.removeAttendanceStudentSelect.value);
  const options = student && student.attendance.length
    ? student.attendance.map((entry, index) => `<option value="${index}">${entry.date} | ${entry.status}</option>`).join("")
    : `<option value="">No attendance found</option>`;
  elements.removeAttendanceSelect.innerHTML = options;
}

function renderAttendanceChecklist(data) {
  const board = elements.attendanceBoardSelect.value;
  const className = elements.attendanceClassSelect.value;
  const students = getStudentsByBoardAndClass(data, board, className);

  if (!students.length) {
    elements.attendanceStudentList.innerHTML = `<div class="empty-state">No students found for ${board} ${className}.</div>`;
    return;
  }

  elements.attendanceStudentList.innerHTML = students
    .map((student) => `
      <label class="attendance-row">
        <div>
          <strong>${student.name}</strong>
          <p>${student.id} | ${student.board} | ${student.className}</p>
        </div>
        <span class="tick-field">
          <input type="checkbox" name="attendance-${student.id}" value="present" checked>
          Present
        </span>
      </label>
    `)
    .join("");
}

function renderAdminStats(data) {
  const totalMarks = data.students.reduce((count, student) => count + student.marks.length, 0);
  const totalAttendance = data.students.reduce((count, student) => count + student.attendance.length, 0);

  elements.adminStats.innerHTML = `
    <div class="stat-card">
      <span class="eyebrow">Boards</span>
      <strong>${BOARDS.length}</strong>
    </div>
    <div class="stat-card">
      <span class="eyebrow">Classes</span>
      <strong>${CLASSES.length}</strong>
    </div>
    <div class="stat-card">
      <span class="eyebrow">Students</span>
      <strong>${data.students.length}</strong>
    </div>
    <div class="stat-card">
      <span class="eyebrow">Attendance Entries</span>
      <strong>${totalAttendance}</strong>
    </div>
    <div class="stat-card">
      <span class="eyebrow">Published Marks</span>
      <strong>${totalMarks}</strong>
    </div>
  `;

  elements.dashboardSummaryGrid.innerHTML = `
    <div class="dashboard-summary-card">
      <span class="eyebrow">Boards</span>
      <strong>${BOARDS.length}</strong>
    </div>
    <div class="dashboard-summary-card">
      <span class="eyebrow">Classes</span>
      <strong>${CLASSES.length}</strong>
    </div>
    <div class="dashboard-summary-card">
      <span class="eyebrow">Students</span>
      <strong>${data.students.length}</strong>
    </div>
    <div class="dashboard-summary-card">
      <span class="eyebrow">Published Marks</span>
      <strong>${totalMarks}</strong>
    </div>
  `;
}

function renderAdminRecords(data) {
  const boardFilter = elements.recordsBoardSelect.value || "all";
  const classFilter = elements.recordsClassSelect.value || "all";

  const students = data.students.filter((student) => {
    const boardOk = boardFilter === "all" || student.board === boardFilter;
    const classOk = classFilter === "all" || student.className === classFilter;
    return boardOk && classOk;
  });

  elements.adminRecords.innerHTML = students.length
    ? students.map((student) => {
        const latestAttendance = student.attendance[student.attendance.length - 1];
        const attendanceText = latestAttendance ? `${latestAttendance.date} - ${latestAttendance.status}` : "No attendance record";
        const latestMarks = student.marks.slice(-3).map((record) => `${record.subject} ${record.marks}/${record.maxMarks}`).join(" | ");

        return `
          <article class="record-card">
            <h4>${student.name}</h4>
            <p class="record-meta">
              ${student.id} | ${student.board} | ${student.className}<br>
              Latest attendance: ${attendanceText}<br>
              Recent marks: ${latestMarks || "No marks published"}
            </p>
            <div class="record-badges">
              <span class="badge primary">${student.marks.length} marks records</span>
              <span class="badge accent">${student.attendance.length} attendance records</span>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">No student records found for this filter.</div>`;
}

function renderStudentDashboard(student) {
  const marks = student.marks || [];
  const attendance = student.attendance || [];
  const presentCount = attendance.filter((entry) => entry.status === "Present").length;
  const attendancePercent = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  elements.studentClassChip.textContent = `${student.board} - ${student.className}`;

  elements.studentRecords.innerHTML = marks.length
    ? marks.map((record) => {
        const percentage = Math.round((record.marks / record.maxMarks) * 100);
        return `
          <article class="record-card">
            <h4>${record.subject}</h4>
            <p class="record-meta">
              Exam Type: ${record.examType}<br>
              Marks: ${record.marks}/${record.maxMarks}
            </p>
            <div class="record-badges">
              <span class="badge primary">${percentage}%</span>
              <span class="badge accent">Grade ${getGrade(percentage)}</span>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">No marks have been published yet.</div>`;

  elements.studentAttendancePercentage.textContent = `${attendancePercent}%`;
  elements.studentAttendanceText.textContent = attendance.length
    ? `${presentCount} present out of ${attendance.length} attendance records.`
    : "No attendance records available.";

  if (marks.length) {
    const average = Math.round(marks.reduce((sum, record) => sum + (record.marks / record.maxMarks) * 100, 0) / marks.length);
    elements.studentAverageScore.textContent = `${average}%`;
    elements.studentAverageText.textContent = `Overall grade: ${getGrade(average)}`;
  } else {
    elements.studentAverageScore.textContent = "0%";
    elements.studentAverageText.textContent = "No marks published yet.";
  }
}

function refreshAdminFilters(data) {
  syncBoardAndClassOptions();
  updateStudentsForMarks(data);
  updateStudentsForDownload(data);
  updateStudentsForRemoveStudent(data);
  syncEntryStudentSelects(data);
  syncMarkOptions(data);
  syncAttendanceOptions(data);
  renderAttendanceChecklist(data);
}

function renderApp() {
  const data = loadData();
  const session = loadSession();

  refreshAdminFilters(data);

  if (!session) {
    elements.authView.classList.remove("hidden");
    elements.adminView.classList.add("hidden");
    elements.studentView.classList.add("hidden");
    return;
  }

  if (session.role === "admin") {
    elements.authView.classList.add("hidden");
    elements.studentView.classList.add("hidden");
    elements.adminView.classList.remove("hidden");
    const attendanceDateInput = document.querySelector('input[name="attendanceDate"]');
    if (attendanceDateInput && !attendanceDateInput.value) {
      attendanceDateInput.value = getTodayLocalDate();
    }
    renderAdminStats(data);
    renderAdminRecords(data);
    return;
  }

  const student = getStudentById(data, session.studentId);
  if (!student) {
    clearSession();
    renderApp();
    return;
  }

  elements.authView.classList.add("hidden");
  elements.adminView.classList.add("hidden");
  elements.studentView.classList.remove("hidden");
  renderStudentDashboard(student);
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildMarksheet(student, format) {
  if (format === "csv") {
    const rows = [
      ["Student ID", "Student Name", "Board", "Class", "Subject", "Exam Type", "Marks", "Max Marks", "Grade"].join(",")
    ];

    student.marks.forEach((record) => {
      const percentage = Math.round((record.marks / record.maxMarks) * 100);
      rows.push([
        student.id,
        student.name,
        student.board,
        student.className,
        record.subject,
        record.examType,
        record.marks,
        record.maxMarks,
        getGrade(percentage)
      ].join(","));
    });

    return {
      filename: `${student.id}-marksheet.csv`,
      content: rows.join("\n"),
      mimeType: "text/csv"
    };
  }

  const marksSummary = student.marks.length
    ? student.marks.map((record) => {
        const percentage = Math.round((record.marks / record.maxMarks) * 100);
        return `${record.subject} | ${record.examType} | ${record.marks}/${record.maxMarks} | Grade ${getGrade(percentage)}`;
      }).join("\n")
    : "No marks available.";

  const presentCount = student.attendance.filter((entry) => entry.status === "Present").length;

  return {
    filename: `${student.id}-marksheet.txt`,
    content: `Marksheet Summary\n\nStudent: ${student.name}\nStudent ID: ${student.id}\nBoard: ${student.board}\nClass: ${student.className}\n\nMarks\n${marksSummary}\n\nAttendance\n${presentCount}/${student.attendance.length || 0} present`,
    mimeType: "text/plain"
  };
}

function createStudent(data, formData) {
  const studentId = String(formData.get("studentId")).trim().toUpperCase();
  const existingStudent = getStudentById(data, studentId);

  if (existingStudent) {
    return { ok: false, message: "Student ID already exists." };
  }

  const name = String(formData.get("name")).trim();
  const board = String(formData.get("board"));
  const className = String(formData.get("className"));
  const password = String(formData.get("password")).trim() || "student123";

  data.students.push({
    id: studentId,
    password,
    name,
    email: "",
    board,
    className,
    marks: [],
    attendance: []
  });

  return { ok: true, studentId };
}

function removeStudent(data, studentId) {
  const index = data.students.findIndex((student) => student.id === studentId);
  if (index < 0) {
    return false;
  }

  data.students.splice(index, 1);
  return true;
}

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const identifier = String(formData.get("identifier")).trim();
  const password = String(formData.get("password")).trim();
  const data = loadData();

  if (identifier.toLowerCase() === data.admin.email.toLowerCase() && password === data.admin.password) {
    saveSession({ role: "admin", name: data.admin.name });
    event.currentTarget.reset();
    showMessage("");
    renderApp();
    return;
  }

  const studentId = identifier.toUpperCase();
  const student = getStudentById(data, studentId);
  if (student && student.password === password) {
    saveSession({ role: "student", studentId });
    event.currentTarget.reset();
    showMessage("");
    renderApp();
    return;
  }

  showMessage("Invalid Studybox login or student credentials.", "error");
});

elements.studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const result = createStudent(data, formData);

  if (!result.ok) {
    alert(result.message);
    return;
  }

  saveData(data);
  event.currentTarget.reset();
  renderApp();
  alert(`Student ${result.studentId} added successfully.`);
});

elements.marksBoardSelect.addEventListener("change", () => updateStudentsForMarks(loadData()));
elements.marksClassSelect.addEventListener("change", () => updateStudentsForMarks(loadData()));
elements.downloadBoardSelect.addEventListener("change", () => updateStudentsForDownload(loadData()));
elements.downloadClassSelect.addEventListener("change", () => updateStudentsForDownload(loadData()));
elements.removeStudentBoardSelect.addEventListener("change", () => updateStudentsForRemoveStudent(loadData()));
elements.removeStudentClassSelect.addEventListener("change", () => updateStudentsForRemoveStudent(loadData()));
elements.attendanceBoardSelect.addEventListener("change", () => renderAttendanceChecklist(loadData()));
elements.attendanceClassSelect.addEventListener("change", () => renderAttendanceChecklist(loadData()));
elements.recordsBoardSelect.addEventListener("change", () => renderAdminRecords(loadData()));
elements.recordsClassSelect.addEventListener("change", () => renderAdminRecords(loadData()));
elements.removeMarkStudentSelect.addEventListener("change", () => syncMarkOptions(loadData()));
elements.removeAttendanceStudentSelect.addEventListener("change", () => syncAttendanceOptions(loadData()));

elements.marksForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const student = getStudentById(data, String(formData.get("studentId")));

  if (!student) return;

  student.board = String(formData.get("board"));
  student.className = String(formData.get("className"));
  student.marks.push({
    subject: String(formData.get("subject")).trim(),
    examType: String(formData.get("examType")).trim(),
    marks: Number(formData.get("marks")),
    maxMarks: Number(formData.get("maxMarks"))
  });

  saveData(data);
  event.currentTarget.reset();
  renderApp();
  alert("Marks saved and published successfully.");
});

elements.attendanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const board = String(formData.get("board"));
  const className = String(formData.get("className"));
  const attendanceDate = String(formData.get("attendanceDate")).trim();
  const students = getStudentsByBoardAndClass(data, board, className);

  students.forEach((student) => {
    const status = formData.get(`attendance-${student.id}`) === "present" ? "Present" : "Absent";
    const existingIndex = student.attendance.findIndex((entry) => entry.date === attendanceDate);
    const nextEntry = { date: attendanceDate, status };

    if (existingIndex >= 0) {
      student.attendance[existingIndex] = nextEntry;
    } else {
      student.attendance.push(nextEntry);
    }
  });

  saveData(data);
  renderApp();
  alert("Attendance saved successfully.");
});

elements.removeStudentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const studentId = String(formData.get("studentId"));

  if (!studentId) {
    alert("Select a student first.");
    return;
  }

  if (!removeStudent(data, studentId)) {
    alert("Student not found.");
    return;
  }

  saveData(data);
  renderApp();
  alert(`Student ${studentId} removed successfully.`);
});

elements.removeMarkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const student = getStudentById(data, String(formData.get("studentId")));
  const markIndex = Number(formData.get("markIndex"));

  if (!student || Number.isNaN(markIndex) || markIndex < 0 || markIndex >= student.marks.length) {
    alert("Select a valid mark entry.");
    return;
  }

  student.marks.splice(markIndex, 1);
  saveData(data);
  renderApp();
  alert("Published mark removed successfully.");
});

elements.removeAttendanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const student = getStudentById(data, String(formData.get("studentId")));
  const attendanceIndex = Number(formData.get("attendanceIndex"));

  if (!student || Number.isNaN(attendanceIndex) || attendanceIndex < 0 || attendanceIndex >= student.attendance.length) {
    alert("Select a valid attendance entry.");
    return;
  }

  student.attendance.splice(attendanceIndex, 1);
  saveData(data);
  renderApp();
  alert("Attendance entry removed successfully.");
});

elements.downloadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = loadData();
  const student = getStudentById(data, String(formData.get("studentId")));
  const format = String(formData.get("format"));

  if (!student) return;

  const file = buildMarksheet(student, format);
  downloadFile(file.filename, file.content, file.mimeType);
});

elements.adminLogout.addEventListener("click", () => {
  clearSession();
  renderApp();
});

setupAdminPanels();
renderApp();
