(function () {
  "use strict";

  const landing = document.getElementById("landing");
  const portal = document.getElementById("portal");
  const sidebar = document.getElementById("sidebar");
  const portalMain = document.getElementById("portalMain");
  const pages = document.querySelectorAll(".page");
  const routeLinks = document.querySelectorAll("[data-route]");
  const members = window.ROOSTER_DATA.members;
  const taskTypes = window.ROOSTER_DATA.taskTypes;

  function openPortal() {
    landing.classList.add("hidden");
    portal.classList.remove("hidden");
    portal.setAttribute("aria-hidden", "false");
    document.body.classList.remove("no-scroll");
    navigate("dashboard", false);
    window.scrollTo(0, 0);
  }

  function closePortal() {
    portal.classList.add("hidden");
    portal.setAttribute("aria-hidden", "true");
    landing.classList.remove("hidden");
    document.body.classList.remove("admin-mode");
    document.getElementById("roleSwitch").textContent = "Vis som admin";
    sidebar.classList.remove("open");
    window.location.hash = "landing";
    window.scrollTo(0, 0);
  }

  document.getElementById("openPortalTop").addEventListener("click", openPortal);
  document.getElementById("openPortalHero").addEventListener("click", openPortal);
  document.getElementById("closePortal").addEventListener("click", closePortal);
  document.getElementById("joinDemoButton").addEventListener("click", () => {
    alert("Medlemssøknaden bygges når innlogging og database kobles til.");
  });

  function navigate(route, updateHash = true) {
    pages.forEach(page => page.classList.toggle("active", page.dataset.page === route));
    routeLinks.forEach(link => link.classList.toggle("active", link.dataset.route === route));
    sidebar.classList.remove("open");
    if (updateHash) window.location.hash = route;
    portalMain.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  routeLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (portal.classList.contains("hidden")) openPortal();
      navigate(link.dataset.route);
    });
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.getElementById("roleSwitch").addEventListener("click", event => {
    document.body.classList.toggle("admin-mode");
    event.currentTarget.textContent = document.body.classList.contains("admin-mode")
      ? "Vis som medlem"
      : "Vis som admin";
  });

  const taskRange = document.getElementById("taskRange");
  const tasksDone = document.getElementById("tasksDone");
  const tasksTotal = document.getElementById("tasksTotal");
  const dashboardTasksDone = document.getElementById("dashboardTasksDone");
  const dashboardTasksTotal = document.getElementById("dashboardTasksTotal");
  const derbyProgress = document.getElementById("derbyProgress");
  const dashboardProgress = document.getElementById("dashboardProgress");

  function updateProgress() {
    const done = Number(taskRange.value);
    const total = Number(taskRange.max);
    const percentage = total ? (done / total) * 100 : 0;
    tasksDone.textContent = done;
    tasksTotal.textContent = total;
    dashboardTasksDone.textContent = done;
    dashboardTasksTotal.textContent = total;
    derbyProgress.style.width = percentage + "%";
    dashboardProgress.style.width = percentage + "%";
  }

  taskRange.addEventListener("input", updateProgress);
  updateProgress();

  document.getElementById("finishDerby").addEventListener("click", () => {
    taskRange.value = taskRange.max;
    updateProgress();
    document.getElementById("derbyStatus").value = "Ferdig";
    document.getElementById("finishStatus").textContent =
      "Ferdig registrert " + new Date().toLocaleString("nb-NO") + ".";
  });

  document.querySelectorAll(".choice-button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".choice-button").forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");
      const messages = {
        joined: "Du har bekreftet at du deltar.",
        pause: "Du tar pause denne uken.",
        unsure: "Du er registrert som usikker. Husk å avklare før fristen."
      };
      document.getElementById("participationStatus").textContent =
        messages[button.dataset.choice];
    });
  });

  function renderMembers() {
    const query = document.getElementById("memberSearch").value.trim().toLowerCase();
    const filter = document.getElementById("memberFilter").value;

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(query) &&
      (filter === "all" || member.choice === filter)
    );

    document.getElementById("memberGrid").innerHTML = filtered.map(member => {
      const percentage = Math.round((member.done / member.total) * 100);
      return `
        <article class="member-card">
          <div class="member-head">
            <div class="member-identity">
              <span class="avatar">${member.name[0]}</span>
              <div>
                <h3>${member.name}</h3>
                <span class="member-role">${member.role} · nivå ${member.level}</span>
              </div>
            </div>
            <span class="member-status status-${member.choice}">${member.choiceText}</span>
          </div>

          <div class="member-info">
            <div><span>Oppgaver</span><strong>${member.done} av ${member.total}</strong></div>
            <div><span>Fremdrift</span><strong>${percentage} %</strong></div>
          </div>

          <div class="progress-track"><span style="width:${percentage}%"></span></div>

          <div class="tag-list">
            ${member.likes.map(item => `<span class="task-tag like">+ ${item}</span>`).join("")}
            ${member.dislikes.map(item => `<span class="task-tag dislike">− ${item}</span>`).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  document.getElementById("memberSearch").addEventListener("input", renderMembers);
  document.getElementById("memberFilter").addEventListener("change", renderMembers);
  renderMembers();

  document.getElementById("derbyAdminTable").innerHTML = members.map(member => `
    <tr>
      <td><strong>${member.name}</strong><br><small>${member.role}</small></td>
      <td>${member.choiceText}</td>
      <td>${member.done}/${member.total}</td>
      <td>${member.status}</td>
      <td><button class="table-action">Følg opp</button></td>
    </tr>
  `).join("");

  document.getElementById("preferenceList").innerHTML = taskTypes.map(task => `
    <div class="preference-row">
      <strong>${task}</strong>
      <div class="preference-actions">
        <button>Liker</button>
        <button>Kan ta</button>
        <button>Helst ikke</button>
        <button>Kan ikke</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".preference-actions button").forEach(button => {
    button.addEventListener("click", () => {
      const row = button.closest(".preference-row");
      row.querySelectorAll("button").forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");
    });
  });

  const derbyEditor = document.getElementById("derbyEditor");
  document.getElementById("openDerbyEditor").addEventListener("click", () => derbyEditor.showModal());
  document.getElementById("closeDerbyEditor").addEventListener("click", () => derbyEditor.close());

  document.getElementById("saveDerby").addEventListener("click", () => {
    const derbyType = document.getElementById("editDerbyType").value.trim() || "Ukjent derby";
    const taskTotal = Math.max(1, Number(document.getElementById("editTaskTotal").value) || 9);
    const maxPoints = Math.max(1, Number(document.getElementById("editMaxPoints").value) || 320);
    const strategy = document.getElementById("editStrategy").value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

    document.getElementById("derbyType").textContent = derbyType;
    document.getElementById("dashboardDerbyType").textContent = derbyType;
    document.getElementById("derbyTaskTotalLabel").textContent = taskTotal;
    document.getElementById("derbyMaxPoints").textContent = maxPoints;
    document.getElementById("derbyStrategy").innerHTML =
      strategy.map(item => `<li>${item}</li>`).join("");

    taskRange.max = taskTotal;
    if (Number(taskRange.value) > taskTotal) taskRange.value = taskTotal;
    updateProgress();
    derbyEditor.close();
  });

  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && initialHash !== "landing" &&
      document.querySelector(`[data-page="${initialHash}"]`)) {
    openPortal();
    navigate(initialHash, false);
  }
})();