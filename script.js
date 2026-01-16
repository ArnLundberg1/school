let answers = {};

// -----------------------
// LOGIN-KNAPP
// -----------------------
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

// -----------------------
// GEMENSAM LOGIN (LÄRARE & ELEVER)
// -----------------------
async function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  const msg = document.getElementById("message");

  msg.innerText = "Kontrollerar inloggning...";

  try {
    // Kolla lärare
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

    // Kolla elever
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

// -----------------------
// SKYDDA SIDOR
// -----------------------
const role = localStorage.getItem("role");
const user = localStorage.getItem("user");

if (location.pathname.includes("admin.html") && role !== "teacher") {
  location.href = "index.html";
}

if (location.pathname.includes("assignments.html") && role !== "student") {
  location.href = "index.html";
}

// -----------------------
// VISUELL INDIKATOR
// -----------------------
const status = document.getElementById("status");
if (status && user && role) {
  status.innerText =
    role === "teacher"
      ? `Inloggad som ${user}`
      : `Inloggad som ${user}`;
}

// -----------------------
// LOGGA UT
// -----------------------
function logout() {
  localStorage.clear();
  location.href = "index.html";
}

// -----------------------
// ELEVSIDA: LADDA UPPGIFTER
// -----------------------
async function loadAssignments() {
  const div = document.getElementById("assignments");
  if (!div) return;

  // Hämta uppgifter från localStorage om något finns, annars från fil
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  if (assignments.length === 0) {
    const res = await fetch("assignments.json");
    const data = await res.json();
    assignments = data.assignments;
  }

  assignments.forEach(a => {
    div.innerHTML += `<h3>${a.title}</h3>`;
    a.questions.forEach((q, i) => {
      div.innerHTML += `
        <p>${q}</p>
        <textarea onchange="saveAnswer('${a.id}-${i}', this.value)"></textarea>
      `;
    });
  });
}

// SPARA SVAR I MINNET
function saveAnswer(id, value) {
  answers[id] = value;
}

// LADDA NER SVAR SOM FIL
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

// -----------------------
// LÄRARPANEL: LÄGG TILL UPPGIFT
// -----------------------
async function addAssignment() {
  const title = document.getElementById("title").value.trim();
  const questionsText = document.getElementById("questions").value.trim();

  if (!title || !questionsText) {
    alert("Titel och frågor måste fyllas i!");
    return;
  }

  // Dela frågor med ';'
  const questions = questionsText.split(";").map(q => q.trim()).filter(q => q);

  // Läs befintliga uppgifter från localStorage eller fetch
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];

  if (assignments.length === 0) {
    const res = await fetch("assignments.json");
    const data = await res.json();
    assignments = data.assignments;
  }

  // Lägg till ny uppgift
  const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
  assignments.push({ id: newId, title, questions });

  // Spara i localStorage
  localStorage.setItem("assignments", JSON.stringify(assignments));

  alert("Uppgift tillagd!");
  document.getElementById("title").value = "";
  document.getElementById("questions").value = "";

  displayAssignments(assignments);
}

// VISA NUVARANDE UPPGIFTER I ADMIN
function displayAssignments(assignments) {
  const div = document.getElementById("currentAssignments");
  if (!div) return;

  div.innerHTML = "<h3>Nuvarande uppgifter</h3>";
  assignments.forEach(a => {
    const p = document.createElement("p");
    p.innerText = `${a.id}. ${a.title} – Frågor: ${a.questions.join(", ")}`;
    div.appendChild(p);
  });
}

// INITIALISERA ADMIN-SIDAN
if (document.getElementById("currentAssignments")) {
  (async () => {
    let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    if (assignments.length === 0) {
      const res = await fetch("assignments.json");
      const data = await res.json();
      assignments = data.assignments;
    }
    displayAssignments(assignments);
  })();
}

// LADDA NER UPPDATERADE UPPGIFTER SOM JSON
function downloadAssignments() {
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  if (assignments.length === 0) {
    alert("Inga uppgifter att ladda ner");
    return;
  }

  const blob = new Blob([JSON.stringify({ assignments }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "assignments.json";
  a.click();
}
