// Simple API functions you can use anywhere in your website

const ResumeAPI = {
  baseURL: 'https://premiere-brakes-attitudes-ohio.trycloudflare.com',
  apiKey: 'ak_1751948233952_l9tap319gfn',
  
  // Ask a question to the AI assistant
  async askQuestion(question, sessionId = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          message: question,
          sessionId: sessionId || `visitor_${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          answer: data.data.response,
          sessionId: data.data.sessionId
        };
      } else {
        return {
          success: false,
          error: data.error || 'Unknown error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if the API is healthy
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  },

  // Pre-defined questions for common resume queries
  async getSkills() {
    return this.askQuestion("What are your technical skills?");
  },

  async getExperience() {
    return this.askQuestion("Tell me about your work experience");
  },

  async getProjects() {
    return this.askQuestion("What projects have you built?");
  },

  async getBackground() {
    return this.askQuestion("What is your background and education?");
  }
};

// Usage examples:

// Basic usage
ResumeAPI.askQuestion("What programming languages do you know?")
  .then(result => {
    if (result.success) {
      console.log("AI Response:", result.answer);
    } else {
      console.error("Error:", result.error);
    }
  });

// Using pre-defined functions
ResumeAPI.getSkills()
  .then(result => {
    if (result.success) {
      document.getElementById('skills-section').innerHTML = result.answer;
    }
  });

// Example: Add to your existing website buttons
function showSkills() {
  ResumeAPI.getSkills().then(result => {
    if (result.success) {
      alert("My Skills: " + result.answer);
    }
  });
}

function showExperience() {
  ResumeAPI.getExperience().then(result => {
    if (result.success) {
      alert("My Experience: " + result.answer);
    }
  });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeAPI;
}
