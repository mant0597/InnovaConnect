const chatHistory = document.getElementById("chat-history");
const userInput = document.getElementById("user-input");
const form = document.getElementById("chat-form");
// import askQuestion from "../../sendReq";
async function sendMessage() {
  const userMessage = userInput.value;
  const startupId = form.attributes.value.value;
  console.log("form:", startupId);
  userInput.value = ""; // Clear input field
  //   console.log("manna", userMessage);
  try {
    chatHistory.innerHTML += `<div class="user-message">${userMessage}</div>`;
    const response = await fetch("/askQuestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput: userMessage, id: startupId }),
    });

    const data = await response.json();
    const botMessage = data.response;

    chatHistory.innerHTML += `<div class="bot-message">${botMessage}</div>`;

    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission
  const loader = document.getElementById("loader");
  loader.style.display = "block"; // Show the loader
  sendMessage().finally(() => {
    loader.style.display = "none"; // Hide the loader after the message is sent
  });
});
