let answers = {};

// GEMENSAM LOGIN FÖR LÄRARE & ELEVER
async function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

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

  alert("Fel användarnamn eller lösenord");
}

// SKYDDA LÄRARSIDAN
if (location.pathname.includes("admin.html")) {
  if (localStorage.getItem("role") !== "teacher") {
    location.href = "index.html";
  }
}

// SKYDDA ELEVSIDAN
if (location.pathname.includes("assignments.html")) {
  if (localStorage.getItem("role") !== "student") {
    location.href = "index.html";
  }
}

// LADDA UPPGIFTER FÖR ELEVER
async function loadAssignments() {
  const res = await fetch("assignments.json");
  const data = await res.json();

  const div = document.getElementById("assignments");
  if (!div) return;

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

// SPARA SVAR I MINNET
function saveAnswer(id, value) {
  answers[id] = value;
}

// LADDA NER SVAR SOM FIL
function downloadAnswers() {
  const student = localStorage.getItem("user");

  const file = {
    student,
    answers,
    created: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${student}_svar.json`;
  a.click();
}

// AUTOLOAD
if (document.getElementById("assignments")) {
  loadAssignments();
}
