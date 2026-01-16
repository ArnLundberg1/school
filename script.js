let answers = {};

// ELEVLOGIN
async function studentLogin() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const res = await fetch("students.json");
  const data = await res.json();

  const student = data.students.find(s => s.username === u && s.password === p);

  if (student) {
    localStorage.setItem("student", u);
    location.href = "assignments.html";
  } else {
    alert("Fel användarnamn eller lösenord");
  }
}

// LADDA UPPGIFTER
async function loadAssignments() {
  if (!localStorage.getItem("student")) {
    location.href = "index.html";
    return;
  }

  const res = await fetch("assignments.json");
  const data = await res.json();

  const div = document.getElementById("assignments");
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

// SPARA SVAR (i minnet)
function saveAnswer(id, value) {
  answers[id] = value;
}

// LADDA NER SVAR SOM FIL
function downloadAnswers() {
  const student = localStorage.getItem("student");

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
