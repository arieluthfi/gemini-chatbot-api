const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const themeToggleButton = document.getElementById('theme-toggle');

const USER_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'; // Generic User Icon
const BOT_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png';    // Generic Bot Icon (Robot)

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
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);

  const avatarImg = document.createElement('img');
  avatarImg.classList.add('message-avatar');
  avatarImg.alt = sender === 'user' ? 'User Avatar' : 'Bot Avatar';
  avatarImg.src = sender === 'user' ? USER_AVATAR_URL : BOT_AVATAR_URL;

  const messageContentDiv = document.createElement('div');
  messageContentDiv.classList.add('message-content');
  messageContentDiv.textContent = text;

  if (sender === 'user') {
    // For user: content first, then avatar (due to flex-direction: row-reverse in CSS)
    messageDiv.appendChild(messageContentDiv);
    messageDiv.appendChild(avatarImg);
  } else { // bot
    // For bot: avatar first, then content
    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(messageContentDiv);
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageContentDiv; // Return the content div for updating "thinking..." or other direct text manipulations
}

async function sendToBackend(message) {
  try {
    // Indicate that the bot is thinking by creating a message element
    const thinkingMessageContent = appendMessage('bot', 'Gemini is thinking...');
    thinkingMessageContent.classList.add('thinking'); // Add class for special styling to the content part

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
    thinkingMessageContent.classList.remove('thinking'); // Remove thinking class
    thinkingMessageContent.textContent = data.reply;
  } catch (error) {
    console.error('Error sending message to backend:', error);
    // Display a user-friendly error message in the chat box
    // If a thinking message was created and an error occurred, update it or remove it
    const lastBotMessageContent = chatBox.querySelector('.message.bot:last-child .message-content');
    if (lastBotMessageContent && lastBotMessageContent.classList.contains('thinking')) {
        lastBotMessageContent.classList.remove('thinking');
        lastBotMessageContent.textContent = `Sorry, something went wrong: ${error.message}`;
    } else {
        // If no thinking message, or it's not the last one, append a new error message
        appendMessage('bot', `Sorry, something went wrong: ${error.message}`); // This returns the content div
    }
  }
}

// Theme toggle functionality
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Save theme preference to localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeToggleButton.textContent = '☀️'; // Sun icon for light mode
  } else {
    localStorage.setItem('theme', 'light');
    themeToggleButton.textContent = '🌙'; // Moon icon for dark mode
  }
});

// Check for saved theme preference on load
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleButton.textContent = '☀️';
}
