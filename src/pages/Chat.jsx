import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import EmojiPicker from 'emoji-picker-react';
import { Send, Smile, ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('target');
  
  const [activeChatUser, setActiveChatUser] = useState(targetUserId || null);
  const [targetUserData, setTargetUserData] = useState(null);
  
  const { chats, messages, sendMessage, loading } = useChat(user, activeChatUser);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);

  // دالة للحصول على صورة آمنة
  const getSafeImage = (url, name) => {
    if (url && url.startsWith('http')) return url;
    return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`;
  };

  useEffect(() => {
    const fetchTargetUser = async () => {
      if (targetUserId) {
        const docRef = doc(db, 'users', targetUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTargetUserData(docSnap.data());
          setActiveChatUser(targetUserId);
        }
      }
    };
    fetchTargetUser();
  }, [targetUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  if (!user) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex h-[100dvh] bg-[#0b0f19] text-[#e7e9ea] font-sans overflow-hidden">
      <Sidebar />
      
      <div className="lg:ml-64 flex flex-1 h-full relative">
        
        {/* Chat List Sidebar (Users List) */}
        <div className={`w-full lg:w-80 border-r border-[#1f2937] bg-[#0b0f19] flex flex-col ${activeChatUser ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1f2937]">
            <h2 className="text-xl font-bold text-white">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1 pb-20 lg:pb-0">
            {loading ? (
               <div className="p-4 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></div>
            ) : chats.length === 0 ? (
               <div className="p-4 text-center text-slate-500 text-sm">No conversations yet.</div>
            ) : (
              chats.map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => {
                    setActiveChatUser(chat.participants.find(p => p !== user.uid));
                    setTargetUserData(chat.otherUser);
                    navigate(`/messages?target=${chat.participants.find(p => p !== user.uid)}`);
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-[#111827] transition-colors ${activeChatUser === chat.participants.find(p => p !== user.uid) ? 'bg-[#111827]' : ''}`}
                >
                  <img 
                    src={getSafeImage(chat.otherUser.photoURL, chat.otherUser.displayName)} 
                    alt="User" 
                    className="w-12 h-12 rounded-full object-cover bg-slate-800" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{chat.otherUser.displayName}</h4>
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-[#0b0f19] h-full ${!activeChatUser ? 'hidden lg:flex' : 'flex'}`}>
          {activeChatUser ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-[#1f2937] flex items-center px-4 justify-between bg-[#0b0f19]/95 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setActiveChatUser(null); navigate('/messages'); }} className="lg:hidden text-slate-400 p-2 -ml-2">
                    <ArrowLeft />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                     <img 
                       src={getSafeImage(targetUserData?.photoURL, targetUserData?.displayName)} 
                       alt="User" 
                       className="w-full h-full object-cover" 
                     />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{targetUserData?.displayName || 'User'}</h3>
                    <span className="text-xs text-green-500">Active now</span>
                  </div>
                </div>
                <MoreVertical className="text-slate-500" />
              </div>

              {/* Messages Area - Added padding bottom for input */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0b0f19] to-[#0f1419] pb-24 lg:pb-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                    <p>No messages yet.</p>
                    <p className="text-xs">Say hello!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[#1f2937] text-slate-200 rounded-bl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom for mobile */}
              <div className="p-3 border-t border-[#1f2937] bg-[#0b0f19] absolute bottom-0 left-0 w-full z-30 lg:relative">
                {showEmoji && (
                  <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden">
                    <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} width={300} height={350} />
                  </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
                    <Smile size={24} />
                  </button>
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-[#111827] border border-[#1f2937] rounded-full px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all focus:ring-1 focus:ring-indigo-500"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-900/20">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="w-20 h-20 bg-[#111827] rounded-full flex items-center justify-center mb-4">
                <Send size={32} className="text-slate-600" />
              </div>
              <p className="text-lg font-bold text-slate-400">Your Messages</p>
              <p className="text-sm">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Nav is handled by App layout, but hidden on chat if active logic needed */}
      {!activeChatUser && <div className="lg:hidden"><MobileNav /></div>}
    </div>
  );
}