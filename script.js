
"use strict";

/* SkillSprint AI — browser-based starter version.
   No API keys or external services are used by this file. */

const STORAGE_KEY = "skillsprint-ai-v2";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const defaultTasks = [
  { title: "Set your career goal", description: "Choose a role you want to work towards.", day: 1 },
  { title: "Practise a core skill", description: "Spend 25 minutes learning a useful concept.", day: 2 },
  { title: "Solve a small exercise", description: "Apply what you learned to a simple problem.", day: 3 },
  { title: "Improve your resume", description: "Review your skills, projects and education.", day: 4 },
  { title: "Practise an interview answer", description: "Answer one question aloud or in writing.", day: 5 },
  { title: "Build something small", description: "Make a tiny improvement to a project.", day: 6 },
  { title: "Review your progress", description: "Write down what you learned and your next step.", day: 7 }
];

const roadmaps = {
  "AI Engineer": [
    ["Programming foundations", "Practise Python, variables, loops, functions and data structures.", "Python · Problem solving"],
    ["Math and data", "Learn basic statistics, vectors, datasets and data cleaning.", "Statistics · NumPy · Pandas"],
    ["Machine learning", "Understand training data, classification, regression and model evaluation.", "Scikit-learn · ML"],
    ["Deep learning", "Explore neural networks and introductory deep learning.", "Neural networks · PyTorch"],
    ["Build AI projects", "Create a useful AI project and document how it works.", "Projects · GitHub"],
    ["Deploy and explain", "Publish a demo and explain its design, limits and results.", "APIs · Deployment"]
  ],
  "Data Analyst": [
    ["Spreadsheet foundations", "Learn formulas, sorting, filtering and data cleanup.", "Excel · Google Sheets"],
    ["SQL", "Practise SELECT, WHERE, JOIN, GROUP BY and aggregate functions.", "SQL · Databases"],
    ["Python for data", "Explore Pandas, NumPy and basic data analysis.", "Python · Pandas"],
    ["Data visualisation", "Build charts and communicate insights clearly.", "Power BI · Charts"],
    ["Portfolio project", "Analyse a dataset and write a short findings report.", "Analysis · Storytelling"],
    ["Interview preparation", "Practise SQL questions and explain a project.", "SQL · Communication"]
  ],
  "Data Scientist": [
    ["Python and SQL", "Practise programming, queries and data structures.", "Python · SQL"],
    ["Statistics", "Learn probability, distributions, averages and hypothesis testing.", "Statistics · Probability"],
    ["Data preparation", "Clean, transform and explore a dataset.", "Pandas · EDA"],
    ["Machine learning", "Train and evaluate beginner regression and classification models.", "Scikit-learn · ML"],
    ["Portfolio project", "Build a reproducible project with clear findings.", "Jupyter · GitHub"],
    ["Model communication", "Explain model performance, assumptions and limitations.", "Metrics · Presentation"]
  ],
  "Software Developer": [
    ["Programming foundations", "Practise variables, conditions, loops, functions and arrays.", "Java · Python"],
    ["Data structures", "Learn arrays, lists, stacks, queues and maps.", "DSA · Problem solving"],
    ["Web basics", "Understand HTML, CSS, JavaScript and HTTP.", "HTML · CSS · JavaScript"],
    ["Git and GitHub", "Track changes and write a clear project README.", "Git · GitHub"],
    ["Build a project", "Create a small useful web application.", "Development · Testing"],
    ["Interview preparation", "Practise coding exercises and explain design choices.", "DSA · Communication"]
  ],
  "Machine Learning Engineer": [
    ["Python foundations", "Practise Python, functions, data structures and debugging.", "Python · Git"],
    ["Data handling", "Prepare datasets and investigate missing or unusual values.", "Pandas · NumPy"],
    ["Machine learning", "Train baseline models and evaluate their performance.", "Scikit-learn · Metrics"],
    ["Model pipelines", "Learn preprocessing, validation and reproducible experiments.", "Pipelines · Testing"],
    ["Deployment basics", "Understand APIs and how to serve a model.", "REST · Deployment"],
    ["Portfolio and review", "Document a model project and explain trade-offs.", "GitHub · MLOps basics"]
  ]
};

const interviewQuestions = {
  hr: [
    ["Tell me about yourself.", "Mention your education, strengths, a relevant experience and career goal."],
    ["Why should we hire you?", "Connect two strengths to the role and give a small example."],
    ["What is your biggest strength?", "Choose a real strength and describe when you used it."],
    ["How do you handle a difficult customer?", "Listen calmly, acknowledge the concern and work towards a solution."],
    ["Tell me about a time you worked in a team.", "Explain the situation, your contribution and the result."],
    ["What is one area you want to improve?", "Be honest and describe the action you are taking to improve."],
    ["Where do you see yourself in three years?", "Discuss skills you want to build and how you hope to contribute."]
  ],
  technical: [
    ["What is a variable?", "Explain that a variable stores a value and give a simple example."],
    ["What is the difference between a list and an array?", "Explain how collections store values and mention language-specific differences."],
    ["What is a database?", "Describe organised data and give a practical example."],
    ["What is machine learning?", "Explain how a model learns patterns from data to make predictions."],
    ["What is an API?", "Explain how software systems communicate through a defined interface."],
    ["What is a loop?", "Describe repeating instructions and give a simple example."],
    ["How would you debug a program?", "Describe reproducing the issue, checking errors, testing a fix and verifying it."]
  ],
  project: [
    ["Explain your project in simple words.", "Start with the problem, explain your solution and finish with the outcome."],
    ["Why did you choose this project?", "Connect the project to a problem you wanted to understand or solve."],
    ["What was your individual contribution?", "Clearly state the parts you personally designed, coded or tested."],
    ["Which technologies did you use and why?", "Name the technologies and explain what each one did."],
    ["What challenge did you face?", "Explain the problem, the steps you took and what you learned."],
    ["How did you test your project?", "Describe test cases, expected results and any limitations."],
    ["What would you improve next?", "Suggest a realistic improvement and explain its benefit."]
  ]
};

const skillKeywords = [
  "python", "java", "sql", "javascript", "html", "css", "machine learning",
  "artificial intelligence", "data analysis", "data science", "deep learning",
  "power bi", "excel", "git", "github", "communication", "teamwork",
  "problem solving", "leadership", "cloud", "tensorflow", "pandas", "numpy",
  "scikit-learn", "react", "api", "statistics"
];

const defaultState = {
  name: "My Workspace",
  goal: "AI Engineer",
  completedTasks: [],
  projects: [],
  resumeReport: null
};

let state = loadState();
let currentQuestionIndex = 0;
let currentQuestionType = "hr";
let toastTimeout;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        ...defaultState,
        ...saved,
        completedTasks: Array.isArray(saved.completedTasks) ? saved.completedTasks : [],
        projects: Array.isArray(saved.projects) ? saved.projects : []
      };
    }
  } catch (error) {
    console.warn("Saved data could not be read.", error);
  }
  return { ...defaultState, completedTasks: [], projects: [] };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("Could not save data in this browser. Check available storage.");
  }
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderTasks(containerSelector) {
  const container = $(containerSelector);
  if (!container) return;

  container.innerHTML = defaultTasks.map((task) => {
    const done = state.completedTasks.includes(task.day);
    return `
      <label class="task-item ${done ? "completed" : ""}">
        <input class="task-check" type="checkbox" data-task="${task.day}" ${done ? "checked" : ""}>
        <span class="task-content">
          <strong>${escapeHTML(task.title)}</strong>
          <p>${escapeHTML(task.description)}</p>
        </span>
        <span class="day-chip">DAY ${task.day}</span>
      </label>`;
  }).join("");
}

function updateDashboard() {
  const completed = state.completedTasks.length;
  const percent = Math.round(completed / defaultTasks.length * 100);

  $("#weeklyProgress").textContent = `${percent}%`;
  $("#weeklyBar").style.width = `${percent}%`;
  $("#tasksCompleted").innerHTML = `${completed} <span class="stat-unit">/ ${defaultTasks.length}</span>`;
  $("#projectCount").textContent = state.projects.length;
  $("#goalDisplay").textContent = state.goal;
  $("#profileName").textContent = state.name || "My Workspace";
  $("#sprintBadge").textContent = `${completed} of ${defaultTasks.length} complete`;

  renderTasks("#dashboardTasks");
  renderTasks("#allTasks");
}

function renderRoadmap() {
  const container = $("#roadmapList");
  if (!container) return;

  const items = roadmaps[state.goal] || roadmaps["AI Engineer"];
  container.innerHTML = items.map((item, index) => `
    <article class="roadmap-card">
      <div class="roadmap-number">${String(index + 1).padStart(2, "0")}</div>
      <div>
        <h3>${escapeHTML(item[0])}</h3>
        <p>${escapeHTML(item[1])}</p>
        <div class="roadmap-skills">${escapeHTML(item[2])}</div>
      </div>
    </article>`).join("");

  $("#careerGoal").value = state.goal;
}

function showPage(pageName) {
  const page = $(`#page-${pageName}`);
  if (!page) return;

  $$(".page").forEach((item) => item.classList.toggle("active", item === page));
  $$(".nav-link").forEach((item) => item.classList.toggle("active", item.dataset.page === pageName));

  const activeButton = $(`.nav-link[data-page="${pageName}"]`);
  $("#pageBreadcrumb").textContent = activeButton ? activeButton.textContent.trim() : "Dashboard";
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addMessage(text, sender, note = "") {
  const messages = $("#chatMessages");
  const article = document.createElement("div");
  article.className = `message ${sender === "user" ? "user-message" : "assistant-message"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "A" : "✦";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.appendChild(paragraph);

  if (note) {
    const small = document.createElement("small");
    small.textContent = note;
    bubble.appendChild(small);
  }

  article.append(avatar, bubble);
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}

function getCoachReply(question) {
  const q = question.toLowerCase();

  if (q.includes("roadmap") || q.includes("learning plan") || q.includes("learn first")) {
    const items = roadmaps[state.goal] || roadmaps["AI Engineer"];
    return `Your current goal is ${state.goal}. Start with these steps:\n\n${items.slice(0, 4).map((item, i) => `${i + 1}. ${item[0]} — ${item[1]}`).join("\n\n")}\n\nTry 25–30 minutes of focused practice each day.`;
  }

  if (q.includes("project")) {
    return "Here are three beginner-friendly project ideas:\n\n1. Resume Keyword Checker — identify skills and sections in resume text.\n2. Student Study Planner — organise subjects, revision and quizzes.\n3. Handwritten Digit Recognition — explore image classification with a trained model.\n\nPick one, define the problem, build a small version, test it and document what you learned.";
  }

  if (q.includes("resume") || q.includes("cv")) {
    return "To improve your resume:\n\n1. Put your education and relevant skills in clear sections.\n2. Describe projects with the problem, your contribution and the result.\n3. Use real tools and technologies you can explain in an interview.\n4. Check spelling, dates and consistent formatting.\n5. Tailor keywords to the specific job description.\n\nAvoid claiming skills or results you cannot support.";
  }

  if (q.includes("interview") || q.includes("hr")) {
    return "Try this answer structure:\n\n• Direct answer: respond to the question.\n• Example: describe a real situation or project.\n• Result: explain what happened or what you learned.\n\nLet's practise: “Tell me about yourself.” Write 4–5 sentences about your education, strengths, experience and goal.";
  }

  if (q.includes("machine learning") || q.includes("artificial intelligence") || q.includes(" ai ")) {
    return "In simple words, AI is a broad field focused on systems doing tasks that normally need human-like intelligence. Machine learning is one approach within AI: a model learns patterns from example data. For example, a spam classifier learns from labelled emails and then predicts whether a new email may be spam. Start with Python, data basics and simple models.";
  }

  if (q.includes("python") || q.includes("coding") || q.includes("program")) {
    return "A practical beginner coding routine:\n\n1. Learn one small concept.\n2. Read and trace a short example.\n3. Write the code yourself.\n4. Change one part and predict the result.\n5. Solve one exercise without looking at the answer.\n\nStart with variables, conditions, loops, functions and arrays/lists before moving to larger projects.";
  }

  if (q.includes("skill")) {
    return `For your ${state.goal} goal, use the roadmap as a guide. Focus on one core skill at a time, practise it with a small exercise, then use it in a project. Keep a note of what you can actually demonstrate rather than only what you have watched or read.`;
  }

  return `Good question! For your ${state.goal} journey, try breaking it into three parts:\n\n1. What do you need to learn?\n2. What small exercise can help you practise it?\n3. What project can demonstrate your progress?\n\nTell me your current level and the exact topic you are working on, and I can help you make a more specific plan.\n\nNote: this is a built-in starter assistant, not a live AI model.`;
}

function sendChatMessage(text) {
  const question = text.trim();
  if (!question) return;

  addMessage(question, "user");
  $("#chatInput").value = "";

  // Starter responses are local templates, not live AI-generated responses.
  const reply = getCoachReply(question);
  window.setTimeout(() => {
    addMessage(reply, "assistant", "Starter assistant · Connect a live AI service for generative responses");
  }, 180);
}

function analyzeResumeText(text) {
  const normalized = text.toLowerCase();
  const foundSkills = skillKeywords.filter((skill) => normalized.includes(skill));
  const sections = [
    ["Education", /\beducation\b|\bdegree\b|\bb\.?tech\b|\bbachelor\b/],
    ["Skills", /\bskills\b|\btechnical skills\b/],
    ["Projects", /\bprojects?\b/],
    ["Experience", /\bexperience\b|\binternship\b|\bemployment\b/],
    ["Contact information", /@|phone|contact|linkedin|github/]
  ];
  const foundSections = sections.filter((item) => item[1].test(normalized)).map((item) => item[0]);
  const suggestions = [];

  if (text.trim().length < 150) suggestions.push("Add more detail if relevant; the text provided may be too short for a useful review.");
  if (!/\b(project|projects)\b/i.test(text)) suggestions.push("Add a Projects section with your contribution, tools and outcomes.");
  if (!/\b(internship|experience|work experience)\b/i.test(text)) suggestions.push("If you have relevant experience, volunteering or internships, describe them.");
  if (!/\b(education|degree|b\.?tech|bachelor)\b/i.test(text)) suggestions.push("Make your education and qualification easy to find.");
  if (!/\b(skills|technical skills)\b/i.test(text)) suggestions.push("Add a clearly labelled Skills section.");
  if (!/\b(achieved|improved|built|developed|created|designed|implemented|analysed|analyzed)\b/i.test(text)) suggestions.push("Where accurate, begin bullet points with action verbs that explain what you did.");
  if (foundSkills.length < 3) suggestions.push("Include relevant technical skills you genuinely know and that match the target role.");
  if (!suggestions.length) suggestions.push("Keep tailoring the resume to each role and verify that all details are accurate.");

  let score = 25;
  score += Math.min(foundSkills.length * 3, 30);
  score += Math.min(foundSections.length * 8, 40);
  if (text.trim().length >= 300) score += 5;
  score = Math.min(100, score);

  return { score, foundSkills, foundSections, suggestions, wordCount: text.trim() ? text.trim().split(/\s+/).length : 0 };
}

function renderResumeReport(report) {
  const empty = $("#resumeEmpty");
  const results = $("#resumeResults");
  empty.hidden = true;
  results.hidden = false;

  const skillMarkup = report.foundSkills.length
    ? report.foundSkills.map((skill) => `<span class="skill-chip">${escapeHTML(skill)}</span>`).join("")
    : '<p>No known keywords detected yet. Try adding relevant skills that you genuinely have.</p>';

  const sectionMarkup = report.foundSections.length
    ? report.foundSections.map(escapeHTML).join(", ")
    : "No common resume sections detected.";

  results.innerHTML = `
    <div class="report-score">
      <div class="score-circle">${report.score}</div>
      <div><strong>Resume checklist score</strong><p>A heuristic indicator, not an official ATS score or hiring prediction.</p><p>${report.wordCount} words reviewed</p></div>
    </div>
    <div class="report-section"><h3>Detected skill keywords (${report.foundSkills.length})</h3><div class="skill-chips">${skillMarkup}</div></div>
    <div class="report-section"><h3>Sections detected</h3><p>${sectionMarkup}</p></div>
    <div class="report-section"><h3>Suggestions to consider</h3><ul class="report-list">${report.suggestions.map((suggestion) => `<li>${escapeHTML(suggestion)}</li>`).join("")}</ul></div>
    <button id="downloadResumeReport" class="secondary-button">Download report (.txt)</button>`;

  $("#downloadResumeReport").addEventListener("click", () => {
    const reportText = [
      "SkillSprint AI — Resume Checklist Report",
      `Checklist score: ${report.score}/100`,
      `Words reviewed: ${report.wordCount}`,
      "",
      "Detected skills:",
      report.foundSkills.join(", ") || "None detected",
      "",
      "Detected sections:",
      report.foundSections.join(", ") || "None detected",
      "",
      "Suggestions:",
      ...report.suggestions.map((item, index) => `${index + 1}. ${item}`),
      "",
      "Note: This is a basic browser-based checklist, not an official ATS result."
    ].join("\n");
    downloadText("skillsprint-resume-report.txt", reportText);
  });
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showInterviewQuestion() {
  const questions = interviewQuestions[currentQuestionType];
  const question = questions[currentQuestionIndex % questions.length];

  $("#interviewQuestion").textContent = question[0];
  $("#interviewHint").textContent = question[1];
  $("#questionCounter").textContent = `Question ${(currentQuestionIndex % questions.length) + 1} of ${questions.length}`;
  $("#interviewAnswer").value = "";
  $("#answerFeedback").hidden = true;
}

function reviewInterviewAnswer() {
  const answer = $("#interviewAnswer").value.trim();
  const feedback = $("#answerFeedback");

  if (answer.length < 15) {
    feedback.innerHTML = "<strong>Add a little more detail.</strong><p>Try writing at least a few complete sentences. Include your main point and a real example where possible.</p>";
    feedback.hidden = false;
    return;
  }

  const words = answer.split(/\s+/).filter(Boolean).length;
  const hasExample = /\b(for example|for instance|when i|during|because|result|learned|built|created|developed)\b/i.test(answer);
  const hasStructure = /[.!?]/.test(answer);
  let points = 1 + Number(words >= 35) + Number(hasExample) + Number(hasStructure);

  feedback.innerHTML = `
    <strong>Self-review checklist: ${points}/4</strong>
    <p>Your answer has ${words} words.</p>
    <ul>
      <li>${words >= 35 ? "Good detail: your answer has enough material to review." : "Consider adding a little more detail and a specific example."}</li>
      <li>${hasExample ? "You included a possible example or explanation." : "Add a real example or explain what you personally did."}</li>
      <li>${hasStructure ? "You used sentence-ending punctuation." : "Break the answer into clear sentences."}</li>
      <li>Check that your answer directly addresses the question and sounds natural when spoken.</li>
    </ul>
    <p>This is a practice checklist, not an assessment of your actual spoken English or a hiring prediction.</p>`;
  feedback.hidden = false;
}

function renderProjects() {
  const container = $("#projectList");
  if (!state.projects.length) {
    container.innerHTML = '<div class="project-empty"><strong>No projects yet</strong><p>Add your first project to start building your portfolio.</p></div>';
    return;
  }

  container.innerHTML = state.projects.map((project) => `
    <article class="project-card" data-project-id="${escapeHTML(project.id)}">
      <h3>${escapeHTML(project.name)}</h3>
      <p>${escapeHTML(project.description)}</p>
      ${project.skills.length ? `<div class="skill-chips">${project.skills.map((skill) => `<span class="skill-chip">${escapeHTML(skill)}</span>`).join("")}</div>` : ""}
      <div class="project-actions">
        <button type="button" data-edit-project="${escapeHTML(project.id)}">Edit</button>
        <button type="button" class="delete-project" data-delete-project="${escapeHTML(project.id)}">Delete</button>
      </div>
    </article>`).join("");
}

function exportPortfolio() {
  const lines = ["# My SkillSprint AI Portfolio", "", `Career goal: ${state.goal}`, ""];

  if (!state.projects.length) lines.push("No projects added yet.");
  state.projects.forEach((project, index) => {
    lines.push(`## ${index + 1}. ${project.name}`, "", project.description, "");
    if (project.skills.length) lines.push(`Skills: ${project.skills.join(", ")}`, "");
  });

  downloadText("skillsprint-portfolio.md", lines.join("\n"));
}

function initNavigation() {
  $$("[data-page]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  $("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  $("#themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    $("#themeButton").textContent = isLight ? "☾" : "☼";
    try { localStorage.setItem("skillsprint-theme", isLight ? "light" : "dark"); } catch (_) {}
  });

  try {
    if (localStorage.getItem("skillsprint-theme") === "light") {
      document.body.classList.add("light-theme");
      $("#themeButton").textContent = "☾";
    }
  } catch (_) {}
}

function initEvents() {
  document.addEventListener("change", (event) => {
    if (!event.target.matches("[data-task]")) return;
    const day = Number(event.target.dataset.task);
    if (event.target.checked && !state.completedTasks.includes(day)) state.completedTasks.push(day);
    if (!event.target.checked) state.completedTasks = state.completedTasks.filter((item) => item !== day);
    saveState();
    updateDashboard();
    showToast(event.target.checked ? "Nice work! Task completed." : "Task marked incomplete.");
  });

  $("#saveGoal").addEventListener("click", () => {
    state.goal = $("#careerGoal").value;
    saveState();
    renderRoadmap();
    updateDashboard();
    showToast("Career goal saved.");
  });

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendChatMessage($("#chatInput").value);
  });

  $$("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      showPage("coach");
      sendChatMessage(button.dataset.prompt);
    });
  });

  $("#resumeFile").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Please use a text file smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      showToast("This starter version supports .txt files. Paste other resume text manually.");
      event.target.value = "";
      return;
    }

    $("#resumeText").value = await file.text();
    showToast("Resume text loaded. Click Analyze resume.");
  });

  $("#analyzeResume").addEventListener("click", () => {
    const text = $("#resumeText").value.trim();
    if (text.length < 30) {
      showToast("Paste more resume text before running the analysis.");
      return;
    }

    const report = analyzeResumeText(text);
    state.resumeReport = report;
    saveState();
    renderResumeReport(report);
    showToast("Resume checklist completed.");
  });

  $("#clearResume").addEventListener("click", () => {
    $("#resumeText").value = "";
    $("#resumeFile").value = "";
    $("#resumeResults").hidden = true;
    $("#resumeEmpty").hidden = false;
    state.resumeReport = null;
    saveState();
  });

  $("#startInterview").addEventListener("click", () => {
    currentQuestionType = $("#interviewType").value;
    currentQuestionIndex = 0;
    showInterviewQuestion();
    showToast("Interview practice started.");
  });

  $("#nextQuestion").addEventListener("click", () => {
    currentQuestionIndex++;
    showInterviewQuestion();
  });

  $("#checkAnswer").addEventListener("click", reviewInterviewAnswer);

  $("#projectForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("#projectName").value.trim();
    const description = $("#projectDescription").value.trim();
    const skills = $("#projectSkills").value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 15);

    if (!name || !description) return;

    state.projects.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      skills
    });

    saveState();
    renderProjects();
    updateDashboard();
    event.target.reset();
    showToast("Project added to your portfolio.");
  });

  $("#projectList").addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-project]");
    const editButton = event.target.closest("[data-edit-project]");

    if (deleteButton) {
      const id = deleteButton.dataset.deleteProject;
      state.projects = state.projects.filter((project) => project.id !== id);
      saveState();
      renderProjects();
      updateDashboard();
      showToast("Project deleted.");
    }

    if (editButton) {
      const project = state.projects.find((item) => item.id === editButton.dataset.editProject);
      if (!project) return;
      const name = window.prompt("Project name:", project.name);
      if (name === null) return;
      const description = window.prompt("Project description:", project.description);
      if (description === null) return;
      project.name = name.trim() || project.name;
      project.description = description.trim() || project.description;
      saveState();
      renderProjects();
      showToast("Project updated.");
    }
  });

  $("#exportPortfolio").addEventListener("click", exportPortfolio);

  $("#resetData").addEventListener("click", () => {
    const confirmed = window.confirm("Reset your SkillSprint AI progress and projects in this browser?");
    if (!confirmed) return;

    state = { ...defaultState, completedTasks: [], projects: [] };
    saveState();
    renderRoadmap();
    renderProjects();
    updateDashboard();
    $("#resumeResults").hidden = true;
    $("#resumeEmpty").hidden = false;
    $("#resumeText").value = "";
    $("#resumeFile").value = "";
    showToast("Your project data has been reset.");
  });
}

function init() {
  initNavigation();
  initEvents();
  renderRoadmap();
  renderProjects();
  updateDashboard();
  showInterviewQuestion();
}

document.addEventListener("DOMContentLoaded", init);


