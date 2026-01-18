function normalize(str) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

function isCorrect(input, answers) {
  return answers.some(a => normalize(a) === normalize(input));
}

function focusQuestion(li) {
  li.scrollIntoView({ behavior: "smooth", block: "center" });
  li.querySelector("input").focus();
}

async function init() {
  const res = await fetch("content/unit-01.json");
  const data = await res.json();

  const app = document.getElementById("app");
  app.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = `Unit 1: ${data.unit.title}`;
  app.appendChild(h1);

  data.unit.exercises.forEach(exercise => {
    const section = document.createElement("section");
    section.className = "exercise";

    const h2 = document.createElement("h2");
    h2.textContent = `Exercise ${exercise.number}`;
    section.appendChild(h2);

    const p = document.createElement("p");
    p.textContent = exercise.instruction;
    section.appendChild(p);

    if (exercise.shared?.wordBank) {
      const wb = document.createElement("div");
      wb.className = "word-bank";
      wb.textContent = "Word bank: " + exercise.shared.wordBank.join(" · ");
      section.appendChild(wb);
    }

    const ol = document.createElement("ol");
    ol.className = "questions";

    exercise.questions.forEach(q => {
      const li = document.createElement("li");
      li.textContent = q.prompt;

      const input = document.createElement("input");
      const hint = document.createElement("span");
      hint.className = "hint hidden";

      let attempts = 0;

      input.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        if (isCorrect(input.value, q.answers)) {
          input.classList.remove("wrong");
          input.classList.add("correct");

          setTimeout(() => {
            // 1️⃣ Try next question in same exercise
            const nextQuestion = li.nextElementSibling;
            if (nextQuestion) {
              focusQuestion(nextQuestion);
              return;
            }

            // 2️⃣ Otherwise, jump to first question of next exercise
            const nextExercise = section.nextElementSibling;
            if (nextExercise) {
              const firstQuestion =
                nextExercise.querySelector(".questions li");
              if (firstQuestion) {
                focusQuestion(firstQuestion);
              }
            }
          }, 150);
        } else {
          attempts++;
          input.classList.remove("correct");
          input.classList.add("wrong");
          input.select();

          if (attempts >= 2) {
            hint.textContent = q.answers[0];
            hint.classList.remove("hidden");
            setTimeout(() => {
              hint.classList.add("hidden");
            }, 1200);
          }
        }
      });

      li.appendChild(input);
      li.appendChild(hint);
      ol.appendChild(li);
    });

    section.appendChild(ol);
    app.appendChild(section);
  });

  // Initial focus
  const firstInput = document.querySelector(".questions li");
  if (firstInput) focusQuestion(firstInput);
}

init();
