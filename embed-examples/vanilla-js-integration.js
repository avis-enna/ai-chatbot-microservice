// Add this to your resume website's JavaScript
class ResumeAssistant {
  constructor() {
    this.apiBase = 'https://premiere-brakes-attitudes-ohio.trycloudflare.com';
    this.apiKey = 'ak_1751948233952_l9tap319gfn';
    this.sessionId = `resume_visitor_${Date.now()}`;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    // Create chat button
    this.createChatButton();
    // Create chat modal
    this.createChatModal();
  }

  createChatButton() {
    const button = document.createElement('button');
    button.innerHTML = '💬';
    button.id = 'resume-chat-btn';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #007bff;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,123,255,0.3);
      z-index: 10000;
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => this.toggleChat());
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
  }

  createChatModal() {
    const modal = document.createElement('div');
    modal.id = 'resume-chat-modal';
    modal.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    `;

    modal.innerHTML = `
      <div id="chat-header" style="
        background: #007bff;
        color: white;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>💼 Ask about my experience!</span>
        <button id="close-chat" style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        ">✕</button>
      </div>
      
      <div id="chat-messages" style="
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #f8f9fa;
      ">
        <div style="text-align: center; color: #666; padding: 20px;">
          👋 Hi! I'm an AI assistant that knows all about my background.<br><br>
          Try asking:
          <div style="margin-top: 10px;">
            <button class="suggestion-btn" data-msg="What are your technical skills?">🛠️ Skills</button>
            <button class="suggestion-btn" data-msg="Tell me about your experience">💼 Experience</button>
            <button class="suggestion-btn" data-msg="Show me your projects">🚀 Projects</button>
          </div>
        </div>
      </div>
      
      <div id="chat-input-area" style="
        padding: 15px;
        border-top: 1px solid #ddd;
        display: flex;
        gap: 10px;
      ">
        <input id="chat-input" type="text" placeholder="Ask me anything..." style="
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        ">
        <button id="send-btn" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        ">Send</button>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    document.getElementById('close-chat').addEventListener('click', () => {
      this.toggleChat();
    });

    // Send button
    document.getElementById('send-btn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter key
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Suggestion buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-btn')) {
        const message = e.target.getAttribute('data-msg');
        this.sendMessage(message);
      }
    });
  }

  toggleChat() {
    const modal = document.getElementById('resume-chat-modal');
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
      document.getElementById('chat-input').focus();
    }
  }

  async sendMessage(messageText = null) {
    const input = document.getElementById('chat-input');
    const message = messageText || input.value.trim();
    
    if (!message || this.isLoading) return;

    // Clear input
    input.value = '';
    
    // Add user message
    this.addMessage(message, true);
    
    // Show loading
    this.isLoading = true;
    this.addMessage('Typing...', false, true);

    try {
      const response = await fetch(`${this.apiBase}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId
        })
      });

      const data = await response.json();
      
      // Remove loading message
      this.removeLoadingMessage();
      
      if (data.success) {
        this.addMessage(data.data.response, false);
      } else {
        this.addMessage('Sorry, I encountered an error. Please try again.', false);
      }
    } catch (error) {
      this.removeLoadingMessage();
      this.addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(text, isUser, isLoading = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.style.cssText = `
      margin-bottom: 10px;
      text-align: ${isUser ? 'right' : 'left'};
      ${isLoading ? 'opacity: 0.7;' : ''}
    `;
    
    if (isLoading) {
      messageDiv.id = 'loading-message';
    }

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      display: inline-block;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 80%;
      background: ${isUser ? '#007bff' : 'white'};
      color: ${isUser ? 'white' : '#333'};
      border: ${isUser ? 'none' : '1px solid #ddd'};
      font-size: 14px;
      line-height: 1.4;
    `;
    
    bubble.textContent = text;
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Hide initial message
    const initialMsg = messagesContainer.querySelector('div[style*="text-align: center"]');
    if (initialMsg && messagesContainer.children.length > 1) {
      initialMsg.style.display = 'none';
    }
  }

  removeLoadingMessage() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
      loadingMsg.remove();
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new ResumeAssistant();
});

// Add suggestion button styles
const style = document.createElement('style');
style.textContent = `
  .suggestion-btn {
    background: #e9ecef;
    border: 1px solid #ddd;
    border-radius: 15px;
    padding: 6px 12px;
    margin: 2px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .suggestion-btn:hover {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;
document.head.appendChild(style);
