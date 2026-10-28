
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const defaultState = {
  profile: { name: "", goal: "AI Engineer", level: "Beginner" },
  assessment: null,
  answers: {},
  completedTasks: [],
  projects: []
};

let state = loadState();
let currentQuestion = 0;
let quizFinished = false;
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("skillsprint-ai-state"));
    if (saved && typeof saved === "object") {
      return {
        ...structuredClone(defaultState),
        ...saved,
        profile: { ...defaultState.profile, ...(saved.profile || {}) },
        answers: saved.answers || {},
        completedTasks: saved.completedTasks || [],
        projects: saved.projects || []
      };
    }
  } catch (error) {
    console.warn("Could not load saved data.", error);
  }
  return structuredClone(defaultState);
}

function saveState() {
  try {
    localStorage.setItem("skillsprint-ai-state", JSON.stringify(state));
  } catch (error) {
    showToast("Browser storage is full. Export your portfolio to keep a copy.");
  }
}

const roadmaps = {
  "AI Engineer": [
    ["Day 1", "Python foundations", "Practise variables, conditions, loops and functions.", "30–45 min"],
    ["Day 2", "Data handling", "Learn lists, dictionaries and basic NumPy or Pandas.", "45 min"],
    ["Day 3", "Math for AI", "Review averages, probability and vectors.", "30 min"],
    ["Day 4", "Machine learning basics", "Understand features, labels, training and testing.", "45 min"],
    ["Day 5", "Build a mini project", "Create a simple prediction or classification demo.", "60 min"],
    ["Day 6", "Explain your project", "Write the problem, solution, tools and limitations.", "30 min"],
    ["Day 7", "Show your work", "Add your project to the portfolio and practise explaining it.", "30 min"]
  ],
  "Data Analyst": [
    ["Day 1", "Spreadsheet skills", "Practise sorting, filtering and basic formulas.", "30 min"],
    ["Day 2", "SQL essentials", "Learn SELECT, WHERE, GROUP BY and ORDER BY.", "45 min"],
    ["Day 3", "Data cleaning", "Find missing values, duplicates and inconsistent labels.", "45 min"],
    ["Day 4", "Visual storytelling", "Create a few useful charts and explain their meaning.", "45 min"],
    ["Day 5", "Mini analysis", "Analyse a public or sample dataset and find three insights.", "60 min"],
    ["Day 6", "Business thinking", "Turn your findings into practical recommendations.", "30 min"],
    ["Day 7", "Portfolio day", "Publish your analysis with clear conclusions and limitations.", "30 min"]
  ],
  "Data Scientist": [
    ["Day 1", "Python for data", "Practise functions, lists and dictionaries.", "45 min"],
    ["Day 2", "Statistics", "Review mean, median, variance and probability.", "45 min"],
    ["Day 3", "Explore data", "Use Pandas to inspect and summarise a dataset.", "45 min"],
    ["Day 4", "Visualise patterns", "Plot distributions and relationships between variables.", "45 min"],
    ["Day 5", "First ML model", "Learn train/test splits and build a beginner model.", "60 min"],
    ["Day 6", "Evaluate fairly", "Understand accuracy and why one metric is not always enough.", "30 min"],
    ["Day 7", "Document results", "Explain the data, method, results and limitations.", "30 min"]
  ],
  "Web Developer": [
    ["Day 1", "HTML foundations", "Build a page with headings, links, lists and forms.", "45 min"],
    ["Day 2", "CSS styling", "Practise spacing, colours, Flexbox and responsive layouts.", "45 min"],
    ["Day 3", "JavaScript basics", "Use variables, functions, conditions and events.", "45 min"],
    ["Day 4", "Make it interactive", "Add a form, validation or a clickable component.", "45 min"],
    ["Day 5", "Build a mini app", "Create a useful browser-based tool.", "60 min"],
    ["Day 6", "Test on mobile", "Check readability, keyboard use and different screen sizes.", "30 min"],
    ["Day 7", "Publish your work", "Put your project on GitHub and write a clear README.", "30 min"]
  ],
  "Software Engineer": [
    ["Day 1", "Programming basics", "Practise variables, conditions and loops in your language.", "45 min"],
    ["Day 2", "Functions and arrays", "Solve small problems using reusable functions.", "45 min"],
    ["Day 3", "Problem solving", "Work through three beginner coding exercises.", "45 min"],
    ["Day 4", "Core concepts", "Learn debugging, exceptions and basic data structures.", "45 min"],
    ["Day 5", "Build something", "Create a small app that solves a real problem.", "60 min"],
    ["Day 6", "Test your code", "Try edge cases and fix the problems you find.", "30 min"],
    ["Day 7", "Explain your work", "Write a README and practise describing your decisions.", "30 min"]
  ]
};

const questions = [
  {
    category: "Programming",
    question: "How comfortable are you writing a small program?",
    options: [
      { text: "I am still learning what code means.", score: 1 },
      { text: "I can write simple programs with guidance.", score: 2 },
      { text: "I can write and debug small programs myself.", score: 3 },
      { text: "I regularly build and improve larger programs.", score: 4 }
    ]
  },
  {
    category: "Data",
    question: "How would you approach a messy dataset?",
    options: [
      { text: "I am not sure where to start yet.", score: 1 },
      { text: "I would inspect it and ask for help.", score: 2 },
      { text: "I can check missing values and duplicates.", score: 3 },
      { text: "I can clean it and explain my choices.", score: 4 }
    ]
  },
  {
    category: "Problem solving",
    question: "When a problem feels difficult, what do you do?",
    options: [
      { text: "I often get stuck without a clear next step.", score: 1 },
      { text: "I look for an example to follow.", score: 2 },
      { text: "I break it into smaller tasks.", score: 3 },
      { text: "I test different approaches and compare results.", score: 4 }
    ]
  },
  {
    category: "AI and technology",
    question: "How well do you understand AI and machine learning?",
    options: [
      { text: "I am just starting to explore them.", score: 1 },
      { text: "I know some basic terms and examples.", score: 2 },
      { text: "I understand common models and their uses.", score: 3 },
      { text: "I have built and evaluated an ML project.", score: 4 }
    ]
  },
  {
    category: "Communication",
    question: "How confidently can you explain a project?",
    options: [
      { text: "I find it hard to explain technical work.", score: 1 },
      { text: "I can explain it with notes or prompts.", score: 2 },
      { text: "I can explain the problem and solution clearly.", score: 3 },
      { text: "I adapt my explanation to different audiences.", score: 4 }
    ]
  },
  {
    category: "Portfolio",
    question: "What practical work can you show today?",
    options: [
      { text: "I have not made a project yet.", score: 1 },
      { text: "I have followed a tutorial or classroom exercise.", score: 2 },
      { text: "I have a project I can demonstrate.", score: 3 },
      { text: "I have multiple documented projects and improvements.", score: 4 }
    ]
  },
  {
    category: "Learning",
    question: "How do you learn a new technical skill?",
    options: [
      { text: "I need help deciding what to learn first.", score: 1 },
      { text: "I watch or read lessons and take notes.", score: 2 },
      { text: "I practise after learning each concept.", score: 3 },
      { text: "I build projects and review what went wrong.", score: 4 }
    ]
  },
  {
    category: "Career readiness",
    question: "How prepared are you for an entry-level interview?",
    options: [
      { text: "I have not started preparing yet.", score: 1 },
      { text: "I know some basics but need practice.", score: 2 },
      { text: "I can answer common questions and discuss my work.", score: 3 },
      { text: "I practise interviews and can explain my decisions.", score: 4 }
    ]
  }
];

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showView(viewName) {
  const view = document.getElementById(`view-${viewName}`);
  if (!view) return;

  $$(".view").forEach((item) => item.classList.toggle("active", item === view));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));

  const titles = {
    overview: "Overview",
    assessment: "Skill assessment",
    roadmap: "7-day sprint",
    portfolio: "Portfolio builder"
  };
  $("#page-title").textContent = titles[viewName] || "SkillSprint AI";

  if (viewName === "assessment") renderQuestion();
  if (viewName === "roadmap") renderTasks();
  if (viewName === "portfolio") renderProjects();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderProfile() {
  $("#user-name").value = state.profile.name || "";
  $("#career-goal").value = state.profile.goal || "AI Engineer";
  $("#level").value = state.profile.level || "Beginner";
  $("#avatar-text")?.replaceChildren();
  $("#profile-shortcut").textContent = (state.profile.name.trim()[0] || "A").toUpperCase();
  renderDashboard();
}

function renderDashboard() {
  const score = state.assessment?.score ?? 0;
  const done = state.completedTasks.length;
  const projects = state.projects.length;

  $("#readiness-score").textContent = score;
  $("#readiness-meter").style.width = `${score}%`;
  $("#readiness-note").textContent = state.assessment
    ? "Your latest learning baseline."
    : "Take the assessment to get your score.";
  $("#tasks-done").textContent = done;
  $("#tasks-meter").style.width = `${(done / 7) * 100}%`;
  $("#project-count").textContent = projects;
  $("#projects-meter").style.width = `${Math.min(projects / 3, 1) * 100}%`;

  const nextTask = (roadmaps[state.profile.goal] || roadmaps["AI Engineer"])
    .findIndex((task, index) => !state.completedTasks.includes(`${state.profile.goal}-${index}`));

  if (!state.assessment) {
    $("#focus-title").textContent = "Take your skill assessment";
    $("#focus-description").textContent = "Discover your strengths and choose your next learning step.";
    $("#focus-action").dataset.go = "assessment";
  } else if (nextTask !== -1) {
    $("#focus-title").textContent = `Continue Day ${nextTask + 1}: ${(roadmaps[state.profile.goal] || roadmaps["AI Engineer"])[nextTask][1]}`;
    $("#focus-description").textContent = "Your next sprint task is ready. Small progress counts.";
    $("#focus-action").dataset.go = "roadmap";
  } else {
    $("#focus-title").textContent = "Your sprint is complete!";
    $("#focus-description").textContent = "Celebrate your progress, then set a fresh goal.";
    $("#focus-action").dataset.go = "portfolio";
  }
}

function renderQuestion() {
  const container = $("#quiz-content");
  if (quizFinished) {
    renderQuizResult();
    return;
  }

  const question = questions[currentQuestion];
  const chosen = state.answers[currentQuestion];
  const percent = Math.round(((currentQuestion + 1) / questions.length) * 100);

  $("#question-count").textContent = `QUESTION ${currentQuestion + 1} OF ${questions.length}`;
  $("#quiz-progress-label").textContent = `${percent}% complete`;
  $("#quiz-progress").style.width = `${percent}%`;
  $("#quiz-back").disabled = currentQuestion === 0;
  $("#quiz-next").textContent = currentQuestion === questions.length - 1 ? "See my results →" : "Next question →";
  $("#quiz-result").classList.add("hidden");

  container.innerHTML = `
    <div class="question-tag">${escapeHTML(question.category.toUpperCase())}</div>
    <h3 class="question-title">${escapeHTML(question.question)}</h3>
    <div class="answer-list">
      ${question.options.map((option, index) => `
        <button type="button" class="answer-option ${chosen === index ? "selected" : ""}" data-answer="${index}" aria-pressed="${chosen === index}">
          <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
          <span>${escapeHTML(option.text)}</span>
        </button>
      `).join("")}
    </div>
  `;

  $$(".answer-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.answers[currentQuestion] = Number(button.dataset.answer);
      saveState();
      renderQuestion();
    });
  });
}

function renderQuizResult() {
  const total = questions.reduce((sum, question, index) => {
    const answerIndex = state.answers[index];
    return sum + (question.options[answerIndex]?.score || 1);
  }, 0);
  const score = Math.round((total / (questions.length * 4)) * 100);
  const strongest = {};
  questions.forEach((question, index) => {
    strongest[question.category] = question.options[state.answers[index]]?.score || 1;
  });
  const strength = Object.entries(strongest).sort((a, b) => b[1] - a[1])[0][0];
  const nextStep = score < 45
    ? "Start with beginner lessons and short daily practice."
    : score < 75
      ? "Build a small project and practise explaining your choices."
      : "Challenge yourself with a complete project and clear documentation.";

  state.assessment = { score, strength, date: new Date().toISOString() };
  saveState();

  $("#quiz-content").innerHTML = "";
  $("#question-count").textContent = "ASSESSMENT COMPLETE";
  $("#quiz-progress-label").textContent = "100% complete";
  $("#quiz-progress").style.width = "100%";
  $("#quiz-back").disabled = true;
  $("#quiz-next").textContent = "Retake assessment ↻";

  const result = $("#quiz-result");
  result.classList.remove("hidden");
  result.innerHTML = `
    <p class="eyebrow">YOUR LEARNING BASELINE</p>
    <div class="result-score">${score}<span style="font-size:15px;color:#b5bed4">/100</span></div>
    <h3>${score < 45 ? "Foundations first." : score < 75 ? "You're building momentum." : "Ready for a bigger challenge."}</h3>
    <p>Your strongest area in this check: <strong>${escapeHTML(strength)}</strong>.</p>
    <p>${escapeHTML(nextStep)}</p>
    <p><small>This is a self-reported learning score, not a validated measure of ability or job readiness.</small></p>
    <button class="btn btn-primary" id="result-roadmap">Open my 7-day sprint →</button>
  `;
  $("#result-roadmap").addEventListener("click", () => showView("roadmap"));
  renderDashboard();
  showToast("Assessment complete — your progress is saved.");
}

function resetQuiz() {
  currentQuestion = 0;
  quizFinished = false;
  state.answers = {};
  renderQuestion();
}

function renderTasks() {
  const tasks = roadmaps[state.profile.goal] || roadmaps["AI Engineer"];
  const done = tasks.filter((task, index) => state.completedTasks.includes(`${state.profile.goal}-${index}`)).length;
  const percent = Math.round((done / tasks.length) * 100);

  $("#completion-percent").textContent = `${percent}%`;
  $("#completion-ring").style.background = `conic-gradient(var(--purple) ${percent}%, #26314a ${percent}%)`;
  $("#sprint-heading").textContent = `${state.profile.goal}: your first 7 days`;
  $("#sprint-subheading").textContent = `A ${state.profile.level.toLowerCase()}-friendly plan. Adapt the pace to your schedule.`;

  $("#task-list").innerHTML = tasks.map((task, index) => {
    const id = `${state.profile.goal}-${index}`;
    const completed = state.completedTasks.includes(id);
    return `
      <article class="task-card ${completed ? "completed" : ""}">
        <button class="task-check" data-task="${index}" aria-label="${completed ? "Mark incomplete" : "Mark complete"}" aria-pressed="${completed}">${completed ? "✓" : ""}</button>
        <div class="task-body">
          <span class="task-day">${escapeHTML(task[0].toUpperCase())}</span>
          <h3>${escapeHTML(task[1])}</h3>
          <p>${escapeHTML(task[2])}</p>
        </div>
        <span class="task-duration">${escapeHTML(task[3])}</span>
      </article>
    `;
  }).join("");

  $$(".task-check").forEach((button) => {
    button.addEventListener("click", () => {
      const id = `${state.profile.goal}-${button.dataset.task}`;
      if (state.completedTasks.includes(id)) {
        state.completedTasks = state.completedTasks.filter((taskId) => taskId !== id);
      } else {
        state.completedTasks.push(id);
      }
      saveState();
      renderTasks();
      renderDashboard();
    });
  });
}

function renderProjects() {
  $("#portfolio-count").textContent = `${state.projects.length} PROJECT${state.projects.length === 1 ? "" : "S"}`;
  $("#project-count").textContent = state.projects.length;

  if (!state.projects.length) {
    $("#project-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">▧</div>
        <strong>Your portfolio starts here.</strong>
        <p>Add a project using the form. Tutorials, college projects and personal builds can all be included honestly.</p>
      </div>
    `;
    return;
  }

  $("#project-list").innerHTML = state.projects.map((project) => {
    const link = safeURL(project.link);
    return `
      <article class="project-card">
        <div class="project-card-top">
          <div><span class="project-category">${escapeHTML(project.type.toUpperCase())}</span><h3>${escapeHTML(project.name)}</h3></div>
        </div>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-tech">${project.tech.split(",").map((item) => item.trim()).filter(Boolean).map((item) => `<span class="tech-tag">${escapeHTML(item)}</span>`).join("")}</div>
        <div class="project-actions">
          ${link ? `<a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">Open project ↗</a>` : ""}
          <button type="button" data-edit="${escapeHTML(project.id)}">Edit</button>
          <button type="button" class="delete-project" data-delete="${escapeHTML(project.id)}">Remove</button>
        </div>
      </article>
    `;
  }).join("");

  $$("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.projects = state.projects.filter((project) => project.id !== button.dataset.delete);
      saveState();
      renderProjects();
      renderDashboard();
      showToast("Project removed.");
    });
  });

  $$("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = state.projects.find((item) => item.id === button.dataset.edit);
      if (!project) return;
      $("#project-name").value = project.name;
      $("#project-type").value = project.type;
      $("#project-desc").value = project.description;
      $("#project-tech").value = project.tech;
      $("#project-link").value = project.link;
      state.projects = state.projects.filter((item) => item.id !== project.id);
      saveState();
      renderProjects();
      renderDashboard();
      $("#project-name").focus();
      showToast("Project loaded into the form. Save it after editing.");
    });
  });
}

function exportPortfolio() {
  const lines = [
    "# My SkillSprint AI Portfolio",
    "",
    `**Name:** ${state.profile.name || "Add your name"}`,
    `**Career goal:** ${state.profile.goal}`,
    `**Level:** ${state.profile.level}`,
    "",
    "## Projects",
    ""
  ];

  if (!state.projects.length) lines.push("No projects added yet.");
  state.projects.forEach((project) => {
    lines.push(`### ${project.name}`, "", `**Category:** ${project.type}`, "", project.description, "");
    if (project.tech) lines.push(`**Technologies:** ${project.tech}`, "");
    if (safeURL(project.link)) lines.push(`**Project link:** ${safeURL(project.link)}`, "");
  });

  lines.push("## Skill assessment", "");
  lines.push(state.assessment ? `Latest self-assessment baseline: ${state.assessment.score}/100.` : "Not completed yet.");
  lines.push("", "_Created with SkillSprint AI. Keep your claims accurate and your projects genuine._");

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-skillsprint-portfolio.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Portfolio export started!");
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  $$("[data-go]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.go));
  });

  $("#profile-shortcut").addEventListener("click", () => {
    showView("overview");
    $("#user-name").focus();
  });

  $("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile.name = $("#user-name").value.trim();
    state.profile.goal = $("#career-goal").value;
    state.profile.level = $("#level").value;
    saveState();
    renderProfile();
    renderTasks();
    showToast("Career target saved!");
    $("#profile-feedback").textContent = "Your career target has been saved on this device.";
  });

  $("#quiz-back").addEventListener("click", () => {
    if (currentQuestion > 0 && !quizFinished) {
      currentQuestion--;
      renderQuestion();
    }
  });

  $("#quiz-next").addEventListener("click", () => {
    if (quizFinished) {
      resetQuiz();
      return;
    }
    if (state.answers[currentQuestion] === undefined) {
      showToast("Choose an answer before continuing.");
      return;
    }
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else if (questions.every((question, index) => state.answers[index] !== undefined)) {
      quizFinished = true;
      renderQuizResult();
    }
  });

  $("#project-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#project-name").value.trim();
    const description = $("#project-desc").value.trim();
    const rawLink = $("#project-link").value.trim();

    if (!name || !description) {
      $("#project-feedback").textContent = "Add a project name and description first.";
      return;
    }
    if (rawLink && !safeURL(rawLink)) {
      $("#project-feedback").textContent = "Please enter a valid http:// or https:// link.";
      return;
    }

    state.projects.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      type: $("#project-type").value,
      description,
      tech: $("#project-tech").value.trim(),
      link: rawLink
    });

    saveState();
    $("#project-form").reset();
    $("#project-feedback").textContent = "Project added to your portfolio!";
    renderProjects();
    renderDashboard();
    showToast("Nice! Your project has been added.");
  });

  $("#download-portfolio").addEventListener("click", exportPortfolio);

  $("#reset-app").addEventListener("click", () => {
    const confirmed = window.confirm("Reset your SkillSprint data on this device? This cannot be undone.");
    if (!confirmed) return;
    state = structuredClone(defaultState);
    currentQuestion = 0;
    quizFinished = false;
    saveState();
    renderProfile();
    renderTasks();
    renderProjects();
    renderQuestion();
    showView("overview");
    showToast("Demo data reset.");
  });
}

function init() {
  bindEvents();
  renderProfile();
  renderTasks();
  renderProjects();
  renderQuestion();
}

init();

