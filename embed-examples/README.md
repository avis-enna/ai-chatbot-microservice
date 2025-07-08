# 🤖 AI Chatbot API Integration for Your Resume Website

## 🔗 API Endpoints

**Base URL:** `https://premiere-brakes-attitudes-ohio.trycloudflare.com`
**API Key:** `ak_1751948233952_l9tap319gfn`

### Main Chat Endpoint
```
POST /api/chat/message
Headers: X-API-Key: ak_1751948233952_l9tap319gfn
Body: {
  "message": "What are your technical skills?",
  "sessionId": "unique_session_id"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "message": "What are your technical skills?",
    "response": "My technical skills include JavaScript, Python, React...",
    "sessionId": "unique_session_id",
    "messageId": "msg_123456789",
    "timestamp": "2025-07-08T07:18:48.807Z"
  }
}
```

## 🎨 Integration Options

### 1. **Simplest: Direct Embed (Copy & Paste)**
```html
<iframe 
  src="https://premiere-brakes-attitudes-ohio.trycloudflare.com/widget" 
  width="400" 
  height="600" 
  frameborder="0"
  title="AI Resume Assistant">
</iframe>
```

### 2. **Popup Button**
```html
<button onclick="window.open('https://premiere-brakes-attitudes-ohio.trycloudflare.com/widget', 'chat', 'width=450,height=650')">
  💬 Chat with AI Assistant
</button>
```

### 3. **React Component**
See: `embed-examples/react-component.jsx`
- Full chat widget as React component
- Handles state management
- Customizable styling

### 4. **Vanilla JavaScript**
See: `embed-examples/vanilla-js-integration.js`
- Complete chat widget
- No dependencies
- Floating chat button
- Easy to customize

### 5. **Simple API Calls**
See: `embed-examples/simple-api.js`
- Just the API functions
- Use for custom implementations
- Pre-built query functions

## 🎯 Pre-built Questions

Use these for quick sections on your resume:

```javascript
// Get skills section
ResumeAPI.getSkills().then(result => {
  document.getElementById('skills').innerHTML = result.answer;
});

// Get experience section  
ResumeAPI.getExperience().then(result => {
  document.getElementById('experience').innerHTML = result.answer;
});

// Get projects section
ResumeAPI.getProjects().then(result => {
  document.getElementById('projects').innerHTML = result.answer;
});
```

## 🔧 Customization

### Change Colors
Update the CSS in any integration:
```css
/* Primary color */
--primary-color: #007bff;  /* Change to your brand color */

/* Chat bubble colors */
--user-bg: #007bff;
--ai-bg: white;
```

### Custom Questions
```javascript
// Add your own specific questions
const customQuestions = [
  "What's your experience with React?",
  "Have you worked with AI/ML?",
  "What's your strongest programming language?"
];
```

## 📱 Mobile Responsive

All integration options are mobile-responsive and work on:
- ✅ Desktop browsers
- ✅ Mobile browsers  
- ✅ Tablets
- ✅ Different screen sizes

## 🚀 Quick Start

1. **Copy any integration code** from the examples
2. **Replace the API URL** if you change hosting
3. **Customize the styling** to match your website
4. **Test on your website**

## 🛡️ Security Notes

- API key is included for demo purposes
- For production, consider implementing user authentication
- Current setup allows unlimited usage (good for portfolio)

## 📊 Analytics

The API automatically tracks:
- Message count
- Session duration  
- Popular questions
- Response times

## 🔄 Updates

To update your integration:
1. The API URL will change when you redeploy
2. Update the `baseURL` in your code
3. No other changes needed

---

**Your AI assistant is ready to showcase your skills! 🎉**

Choose any integration method above and your visitors can chat with an AI that knows all about your background, skills, and experience.
