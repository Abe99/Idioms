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

/*
  v1.1 — Correct inline-choice rendering
*/
function renderPrompt(prompt, type) {
  if (type !== "choice-inline") {
    return document.createTextNode(prompt);
  }

  const fragment = document.createDocumentFragment();
  const tokens = prompt.split(/(\/[^\/]+)/g);

  tokens.forEach(token => {
    if (token.startsWith("/")) {
      const span = document.createElement("span");
      span.className = "choice-inline";
      span.textContent = token;
      fragment.appendChild(span);
    } else {
      fragment.appendChild(document.createTextNode(token));
    }
  });

  return fragment;
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

    /* ================================
       Shared resources rendering
       ================================ */

    // fill-blank → word bank
    if (exercise.type === "fill-blank" && exercise.shared?.wordBank) {
      const wb = document.createElement("div");
      wb.className = "word-bank";
      wb.textContent =
        "Word bank: " + exercise.shared.wordBank.join(" · ");
      section.appendChild(wb);
    }

    // matching → reference list
    if (exercise.type === "matching" && exercise.shared?.reference) {
      const ref = document.createElement("div");
      ref.className = "word-bank";
      ref.textContent =
        "Reference: " + exercise.shared.reference.join(" · ");
      section.appendChild(ref);
    }

    const ol = document.createElement("ol");
    ol.className = "questions";

    exercise.questions.forEach(q => {
      const li = document.createElement("li");

      // Prompt rendering (sentence, inline-choice, or plain word)
      li.appendChild(renderPrompt(q.prompt, exercise.type));

      const input = document.createElement("input");
      input.type = "text";

      const hint = document.createElement("span");
      hint.className = "hint hidden";

      let attempts = 0;

      input.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        if (isCorrect(input.value, q.answers)) {
          input.classList.remove("wrong");
          input.classList.add("correct");

          setTimeout(() => {
            // Next question in same exercise
            const nextQuestion = li.nextElementSibling;
            if (nextQuestion) {
              focusQuestion(nextQuestion);
              return;
            }

            // First question of next exercise
            const exercises = Array.from(
              document.querySelectorAll(".exercise")
            );
            const currentIndex = exercises.indexOf(section);
            const nextExercise = exercises[currentIndex + 1];

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
  const firstQuestion = document.querySelector(".questions li");
  if (firstQuestion) focusQuestion(firstQuestion);
}

init();
