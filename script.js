const dialog = document.getElementById("portalDialog");
const openButtons = [
  document.getElementById("openPortal"),
  document.getElementById("openPortalHero")
];
const closeButton = document.getElementById("closePortal");
const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");

openButtons.forEach(button => {
  button.addEventListener("click", () => dialog.showModal());
});

closeButton.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

menuButton.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});

const confirmRules = document.getElementById("confirmRules");
const derbyStatus = document.getElementById("derbyStatus");

document.getElementById("confirmDerby").addEventListener("click", () => {
  derbyStatus.textContent = confirmRules.checked
    ? "Deltakelse er bekreftet for SANDER."
    : "Kryss av at du har forstått vilkårene først.";
});

document.getElementById("declineDerby").addEventListener("click", () => {
  derbyStatus.textContent = "SANDER er registrert som ikke deltakende.";
});

document.querySelectorAll(".preference-list button").forEach(button => {
  button.addEventListener("click", () => {
    const current = button.dataset.state;
    const next = current === "neutral" ? "like" : current === "like" ? "dislike" : "neutral";
    button.dataset.state = next;
    button.querySelector("span").textContent =
      next === "like" ? "👍 Liker" : next === "dislike" ? "👎 Liker ikke" : "Velg";
  });
});

const range = document.getElementById("taskProgress");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const finishStatus = document.getElementById("finishStatus");

function updateProgress() {
  const value = Number(range.value);
  progressFill.style.width = `${(value / 9) * 100}%`;
  progressText.textContent = `${value} av 9 oppgaver`;
}
range.addEventListener("input", updateProgress);
updateProgress();

document.getElementById("finishDerby").addEventListener("click", () => {
  range.value = 9;
  updateProgress();
  finishStatus.textContent = `Ferdig registrert ${new Date().toLocaleString("nb-NO")}.`;
});

document.getElementById("joinButton").addEventListener("click", () => {
  alert("Medlemssøknaden bygges i en senere versjon.");
});
