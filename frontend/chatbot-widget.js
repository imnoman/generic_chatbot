class ChatbotWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.threadId = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
        }

        .chatbot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 360px;
          max-height: 600px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
          z-index: 9999;
        }

        .chat-header {
          background: #007bff;
          color: white;
          padding: 1rem;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .model-select {
          background: white;
          color: black;
          border: none;
          padding: 0.25rem;
          border-radius: 5px;
        }

        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-message {
          padding: 0.75rem;
          border-radius: 12px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .user-message {
          align-self: flex-end;
          background: #007bff;
          color: white;
        }

        .bot-message {
          align-self: flex-start;
          background: #e6e6e6;
        }

        .chat-input {
          display: flex;
          padding: 1rem;
          border-top: 1px solid #ccc;
        }

        .chat-input textarea {
          flex: 1;
          resize: none;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .chat-input button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      </style>

      <div class="chatbot">
        <div class="chat-header">
          <span>Chatbot</span>
          <select class="model-select">
            <option value="groq">Groq</option>
            <option value="claude">Claude</option>
            <option value="openai_assistant">OpenAI</option>
          </select>
        </div>
        <div class="chat-messages" id="messages"></div>
        <div class="chat-input">
          <textarea id="question" rows="1" placeholder="Ask something..."></textarea>
          <button id="send">Send</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('send').addEventListener('click', () => this.sendQuestion());
    this.shadowRoot.getElementById('question').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendQuestion();
      }
    });
  }

  async sendQuestion() {
    const inputEl = this.shadowRoot.getElementById('question');
    const messagesEl = this.shadowRoot.getElementById('messages');
    const model = this.shadowRoot.querySelector('.model-select').value;
    const question = inputEl.value.trim();
    if (!question) return;

    this.addMessage(question, 'user-message');
    inputEl.value = '';
    inputEl.disabled = true;

    try {
      const res = await fetch('http://localhost:3001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          threadId: this.threadId,
          model
        })
      });

      const data = await res.json();
      this.threadId = data.threadId;

      this.addMessage(data.answer || 'No reply received', 'bot-message');
    } catch (err) {
      this.addMessage('⚠️ Error talking to chatbot.', 'bot-message');
    }

    inputEl.disabled = false;
    inputEl.focus();
  }

  addMessage(text, className) {
    const messagesEl = this.shadowRoot.getElementById('messages');
    const msg = document.createElement('div');
    msg.className = `chat-message ${className}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

customElements.define('chatbot-widget', ChatbotWidget);
