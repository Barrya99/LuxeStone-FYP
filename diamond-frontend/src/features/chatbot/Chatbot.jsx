// src/features/chatbot/Chatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader } from 'lucide-react';
import Button from '../../components/common/Button';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your diamond expert assistant. How can I help you find the perfect ring today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual Gemini API call)
      const response = await simulateAIResponse(userMessage);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simulated AI response (replace with Gemini API)
  const simulateAIResponse = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('4c') || lowerMessage.includes('four c')) {
      return 'The 4Cs of diamond quality are:\n\n1. **Cut** - How well the diamond is cut affects its brilliance\n2. **Carat** - The weight/size of the diamond\n3. **Color** - Graded from D (colorless) to Z (light yellow)\n4. **Clarity** - The absence of inclusions and blemishes\n\nWould you like to know more about any specific aspect?';
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'I can help you find the perfect ring within your budget! Our lab-grown diamonds range from $2,000 to $20,000+. What\'s your budget range? I\'ll recommend the best options for you.';
    }
    
    if (lowerMessage.includes('lab') || lowerMessage.includes('lab-grown')) {
      return 'Lab-grown diamonds are:\n\n✨ **Chemically identical** to natural diamonds\n🌍 **Eco-friendly** - minimal environmental impact\n💎 **More affordable** - 30-40% less than natural\n✅ **Conflict-free** - ethically sourced\n\nThey\'re a smart, sustainable choice!';
    }
    
    if (lowerMessage.includes('size') || lowerMessage.includes('ring size')) {
      return 'To find your ring size:\n\n1. Measure an existing ring\n2. Use our printable ring sizer\n3. Visit a local jeweler\n\nWe offer sizes 4-11 in 0.5 increments. Would you like me to send you our size guide?';
    }

    if (lowerMessage.includes('configure') || lowerMessage.includes('build') || lowerMessage.includes('custom')) {
      return 'I can help you build your custom ring! Our configurator guides you through:\n\n1️⃣ Choose your diamond (shape, 4Cs)\n2️⃣ Select your setting (style, metal)\n3️⃣ Customize (size, preview)\n\nWould you like to start designing now?';
    }
    
    return 'That\'s a great question! I can help you with:\n\n💎 Understanding the 4Cs\n💰 Finding rings in your budget\n🔧 Using our ring configurator\n📏 Ring sizing guidance\n🌱 Lab-grown diamond info\n\nWhat would you like to know more about?';
  };

  const quickQuestions = [
    'What are the 4Cs?',
    'Tell me about lab-grown diamonds',
    'Help me find rings under $5000',
    'How do I measure my ring size?',
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-2xl hover:bg-primary-700 transition-all hover:scale-110 group"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Need help? Chat with us!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">Diamond Expert</div>
                <div className="text-xs text-primary-100">Always here to help</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-200">
                  <Loader className="h-5 w-5 text-primary-600 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Available 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;