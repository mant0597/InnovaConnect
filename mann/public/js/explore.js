// public/js/explore.js
document.addEventListener("DOMContentLoaded", () => {
  // AI Q&A button handler
  const aiButtons = document.querySelectorAll(".ai-btn");
  aiButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const startupId = button.getAttribute("data-startup-id");
      window.location.href = `/chat/${startupId}`;
    });
  });
});
