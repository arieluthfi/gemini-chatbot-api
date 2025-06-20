const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent the default form submission which reloads the page

  const userMessage = input.value.trim(); // Get the user's message
  if (!userMessage) return; // Do nothing if the message is empty

  appendMessage('user', userMessage); // Display the user's message in the chat box
  input.value = ''; // Clear the input field

  // Send message to backend
  sendToBackend(userMessage);
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element so it can be updated (e.g., "thinking..." message)
}

async function sendToBackend(message) {
  try {
    // Indicate that the bot is thinking by creating a message element
    const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

    // Here's the fetch() call to your backend API
    const response = await fetch('/api/chat', {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json', // Tell the server we're sending JSON
      },
      body: JSON.stringify({ message: message }), // Convert the message to a JSON string
    });

    if (!response.ok) {
      // If the server response is not OK (e.g., 400, 500), throw an error
      const errorData = await response.json().catch(() => ({ reply: 'Server returned an error.' }));
      throw new Error(errorData.reply || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the JSON response from the server
    // Update the "thinking..." message with the actual reply from Gemini
    thinkingMessage.textContent = data.reply;
  } catch (error) {
    console.error('Error sending message to backend:', error);
    // Display a user-friendly error message in the chat box
    appendMessage('bot', `Sorry, something went wrong: ${error.message}`);
  }
}
