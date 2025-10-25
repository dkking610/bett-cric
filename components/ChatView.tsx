
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIModerationResponse } from '../types';
import { moderateChatMessage } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon } from './icons';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    
    setIsModerating(true);
    setInputValue('');

    const optimisticMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now(),
      status: 'pending',
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    const moderationResult = await moderateChatMessage(text);
    
    const finalMessage: ChatMessage = {
        ...optimisticMessage,
        status: moderationResult?.is_approved ? 'approved' : 'rejected',
        moderation_result: moderationResult || undefined,
    };

    setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? finalMessage : msg));

    if (moderationResult?.is_approved) {
        // Simulate a bot response
        setTimeout(() => {
            const botResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Thanks for your comment! Please remember to keep the chat respectful.",
                sender: 'bot',
                timestamp: Date.now(),
                status: 'approved',
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    }

    setIsModerating(false);
  };

  const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const bubbleStyles = {
        user: 'bg-brand-primary text-white self-end',
        bot: 'bg-gray-700 text-gray-300 self-start'
    };
    
    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${bubbleStyles[msg.sender]}`}>
                {msg.text}
            </div>
            {isUser && msg.status === 'pending' && <p className="text-xs text-gray-500 mt-1">Checking message...</p>}
            {isUser && msg.status === 'rejected' && (
                <div className="mt-1.5 p-2 bg-red-900/50 border border-red-700 rounded-lg max-w-xs md:max-w-md text-xs text-red-300 flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <div>
                        <p className="font-semibold">Message Blocked</p>
                        <p>{msg.moderation_result?.rejection_reason || "This message violates our community guidelines."}</p>
                    </div>
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="flex flex-col h-full bg-gray-900">
      <h2 className="text-3xl font-bold text-white mb-1">Social Chat</h2>
      <p className="text-gray-400 mb-4">Messages are moderated by AI for community safety.</p>
      
      <div className="flex-grow bg-gray-800 rounded-lg p-4 flex flex-col border border-gray-700">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary"
                disabled={isModerating}
            />
            <button 
                type="submit" 
                disabled={!inputValue || isModerating}
                className="bg-brand-primary text-white font-bold px-4 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
            >
                Send
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
