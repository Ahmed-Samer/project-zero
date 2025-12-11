import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Reply, ChevronDown, ChevronUp, Send } from 'lucide-react';
// التعديل هنا: شيلنا ../ واحدة عشان المسار يظبط
import { formatTime } from '../lib/utils';

const CommentItem = ({ comment, allComments, user, onLike, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  // استخراج الردود الخاصة بالتعليق ده فقط
  const replies = allComments.filter(c => c.parentId === comment.id);
  const isLiked = user && comment.likes.includes(user.uid);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onReply(replyText, comment.id); // نبعت نص الرد و ID التعليق الأب
    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true); // نفتح الردود أوتوماتيك
  };

  return (
    <div className="flex gap-3 items-start group/comment animate-in slide-in-from-top-1 mb-4">
      {/* صورة صاحب التعليق */}
      <Link to={`/profile/${comment.uid}`} className="shrink-0">
        <img src={comment.authorImage} alt={comment.authorName} className="w-8 h-8 rounded-full bg-[#222] object-cover" />
      </Link>

      <div className="flex-1">
        {/* بوكس التعليق */}
        <div className="bg-[#111] p-3 rounded-2xl rounded-tl-none border border-[#222]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-bold text-white hover:underline cursor-pointer">{comment.authorName}</span>
            <span className="text-[10px] text-slate-600">{formatTime(comment.createdAt)}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
        </div>

        {/* أزرار التفاعل تحت التعليق */}
        <div className="flex items-center gap-4 mt-1 ml-1">
          <button 
            onClick={() => onLike(comment.id, comment.likes)}
            className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
          >
            <Heart size={12} fill={isLiked ? "currentColor" : "none"} /> {comment.likes.length > 0 && comment.likes.length}
          </button>
          
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-[10px] font-bold text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <Reply size={12} /> Reply
          </button>
        </div>

        {/* خانة كتابة الرد */}
        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2 ml-2">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.authorName}...`} 
              className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
              autoFocus
            />
            <button type="submit" disabled={!replyText.trim()} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"><Send size={12} /></button>
          </form>
        )}

        {/* زرار إظهار/إخفاء الردود */}
        {replies.length > 0 && (
          <div className="mt-2 ml-2">
            <button 
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
            >
              <div className="w-6 h-px bg-[#333]"></div>
              {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showReplies ? 'Hide replies' : `View ${replies.length} replies`}
            </button>

            {/* عرض الردود (Recursion بسيط) */}
            {showReplies && (
              <div className="mt-3 pl-3 border-l border-[#222]">
                {replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    allComments={allComments} 
                    user={user} 
                    onLike={onLike} 
                    onReply={onReply} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;