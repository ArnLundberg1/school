let answers = {};

// LOGIN-KNAPP
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

// GEMENSAM LOGIN
async function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  const msg = document.getElementById("message");

  msg.innerText = "Kontrollerar inloggning...";

  try {
    // KOLLA LÄRARE
    const tRes = await fetch("teachers.json");
    const tData = await tRes.json();
    const teacher = tData.teachers.find(
      t => t.username === u && t.password === p
    );

    if (teacher) {
      localStorage.setItem("role", "teacher");
      localStorage.setItem("user", u);
      location.href = "admin.html";
      return;
    }

    // KOLLA ELEVER
    const sRes = await fetch("students.json");
    const sData = await sRes.json();
    const student = sData.students.find(
      s => s.username === u && s.password === p
    );

    if (student) {
      localStorage.setItem("role", "student");
      localStorage.setItem("user", u);
      location.href = "assignments.html";
      return;
    }

    msg.innerText = "Fel användarnamn eller lösenord";
  } catch (e) {
    msg.innerText = "Fel: sidan måste köras via GitHub Pages eller lokal server";
  }
}

// SKYDDA SIDOR
const role = localStorage.getItem("role");
const user = localStorage.getItem("user");

if (location.pathname.includes("admin.html") && role !== "teacher") {
  location.href = "index.html";
}

if (location.pathname.includes("assignments.html") && role !== "student") {
  location.href = "index.html";
}

// VISUELL INDIKATOR
const status = document.getElementById("status");
if (status && user && role) {
  status.innerText =
    role === "teacher"
      ? `Inloggad som lärare: ${user}`
      : `Inloggad som elev: ${user}`;
}

// LOGGA UT
function logout() {
  localStorage.clear();
  location.href = "index.html";
}

// LADDA UPPGIFTER
async function loadAssignments() {
  const div = document.getElementById("assignments");
  if (!div) return;

  const res = await fetch("assignments.json");
  const data = await res.json();

  data.assignments.forEach(a => {
    div.innerHTML += `<h3>${a.title}</h3>`;
    a.questions.forEach((q, i) => {
      div.innerHTML += `
        <p>${q}</p>
        <textarea onchange="saveAnswer('${a.id}-${i}', this.value)"></textarea>
      `;
    });
  });
}

function saveAnswer(id, value) {
  answers[id] = value;
}

function downloadAnswers() {
  const file = {
    student: user,
    answers,
    created: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${user}_svar.json`;
  a.click();
}

if (document.getElementById("assignments")) {
  loadAssignments();
}
