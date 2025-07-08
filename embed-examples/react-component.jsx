// React component for your resume website
import React, { useState } from 'react';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = 'https://premiere-brakes-attitudes-ohio.trycloudflare.com';
  const API_KEY = 'ak_1751948233952_l9tap319gfn';
  const SESSION_ID = `resume_visitor_${Date.now()}`;

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { text: messageText, isUser: true, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: SESSION_ID
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = { 
          text: data.data.response, 
          isUser: false, 
          id: Date.now() + 1 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        isUser: false, 
        id: Date.now() + 1 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chat-widget">
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#007bff',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
          zIndex: 1000
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="chat-window"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}
        >
          {/* Header */}
          <div style={{
            background: '#007bff',
            color: 'white',
            padding: '15px',
            borderRadius: '12px 12px 0 0',
            fontWeight: 'bold'
          }}>
            💼 Ask me about my experience!
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                👋 Hi! Ask me about my skills, projects, or experience!
              </div>
            )}
            
            {messages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  marginBottom: '10px',
                  textAlign: msg.isUser ? 'right' : 'left'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  background: msg.isUser ? '#007bff' : 'white',
                  color: msg.isUser ? 'white' : '#333',
                  border: msg.isUser ? 'none' : '1px solid #ddd'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ textAlign: 'left', color: '#666' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1px solid #ddd'
                }}>
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '15px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
