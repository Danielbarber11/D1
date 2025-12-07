import React from 'react';
import { Message } from '../types';
import { User } from 'lucide-react';
import { Logo } from './Logo';

interface ChatMessageProps {
  message: Message;
  userAvatar?: string | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, userAvatar }) => {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
      <div className={`flex max-w-[90%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transform mt-1 overflow-hidden
          ${isBot ? '' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border border-gray-200'}
        `}>
          {isBot ? (
            <Logo size={32} />
          ) : (
            userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
            ) : (
                <User size={16} />
            )
          )}
        </div>

        {/* Bubble */}
        <div className={`
          p-4 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isBot 
            ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20'
          }
        `}>
          <div className="whitespace-pre-wrap font-medium">
            {message.text}
          </div>
          <div className={`mt-1.5 text-[10px] opacity-60 text-right ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
             {new Date(message.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};