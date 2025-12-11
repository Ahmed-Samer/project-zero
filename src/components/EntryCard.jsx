import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInteraction } from '../hooks/useInteraction';
// التعديل هنا: شيلنا ui/ وبقينا نستدعي من نفس الفولدر
import CommentItem from './CommentItem'; 
import ImageModal from './ImageModal'; 
import { Edit2, Trash2, MessageSquare, Heart, Share2, Send, MoreHorizontal } from 'lucide-react';
import { formatTime } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const EntryCard = ({ entry, isOwnPost, onEdit, onDelete, showAuthor = false }) => {
  const { user } = useAuth();
  const { rawComments, toggleLike, toggleCommentLike, addComment } = useInteraction(entry.id, user);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const [isImageOpen, setIsImageOpen] = useState(false);

  const MAX_LENGTH = 300;
  const isLongContent = entry.content.length > MAX_LENGTH;
  const displayContent = isExpanded || !isLongContent ? entry.content : entry.content.slice(0, MAX_LENGTH) + "...";
  const likes = entry.likes || [];
  const isLiked = user && likes.includes(user.uid);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment('');
  };

  return (
    <>
      <div className="pro-card rounded-2xl mb-4 relative overflow-hidden group w-full max-w-full">
        
        {/* Header */}
        {showAuthor ? (
          <div className="flex items-center gap-3 p-4">
            <Link to={`/profile/${entry.uid}`} className="block flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-slate-800 hover:opacity-80 transition-opacity overflow-hidden">
                <img 
                  src={entry.authorImage || `https://ui-avatars.com/api/?name=${entry.authorName}&background=random`} 
                  alt="Author" 
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${entry.uid}`} className="text-base font-bold text-[#e7e9ea] hover:underline truncate block">
                  {entry.authorName || 'Unknown User'}
                </Link>
                <span className="text-[#71767b] text-sm">· {formatTime(entry.date)}</span>
              </div>
              <p className="text-xs text-[#71767b] truncate">Project Zero Member</p>
            </div>
            <button className="text-[#71767b] hover:text-[#1d9bf0] p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center p-4 pb-0">
            <span className="text-sm font-bold text-[#1d9bf0]">{formatTime(entry.date)}</span>
            {isOwnPost && (
              <div className="flex gap-2">
                <button onClick={() => onEdit(entry)} className="p-2 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] rounded-full text-[#71767b] transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(entry.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full text-[#71767b] transition-colors"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="px-4 pb-2 w-full">
          {entry.quote && (
            <div className="mb-4 pl-4 border-l-4 border-[#1d9bf0] py-1">
              <p className="text-lg font-serif italic text-[#e7e9ea] leading-relaxed break-words">"{entry.quote}"</p>
            </div>
          )}
          
          <div className="prose prose-invert prose-lg prose-p:text-[#e7e9ea] prose-p:font-normal prose-a:text-[#1d9bf0] max-w-none leading-relaxed w-full break-words break-all overflow-hidden">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>

          {entry.image && (
            <div 
              className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336] cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setIsImageOpen(true)}
            >
              <img src={entry.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-[#2f3336] mt-2">
          <div className="flex gap-8">
            <button 
              onClick={() => toggleLike(likes)} 
              className={`flex items-center gap-2 text-sm font-medium transition-colors group/btn ${isLiked ? 'text-[#f91880]' : 'text-[#71767b] hover:text-[#f91880]'}`}
            >
              <div className={`p-2 rounded-full group-hover/btn:bg-[#f91880]/10 transition-colors`}>
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </div>
              <span>{likes.length > 0 ? likes.length : ''}</span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors group/btn ${showComments ? 'text-[#1d9bf0]' : 'text-[#71767b] hover:text-[#1d9bf0]'}`}
            >
              <div className={`p-2 rounded-full group-hover/btn:bg-[#1d9bf0]/10 transition-colors`}>
                <MessageSquare size={20} />
              </div>
              <span>{rawComments.length > 0 ? rawComments.length : ''}</span>
            </button>

            <button className="flex items-center gap-2 text-sm font-medium text-[#71767b] hover:text-[#00ba7c] transition-colors group/btn">
              <div className="p-2 rounded-full group-hover/btn:bg-[#00ba7c]/10 transition-colors">
                <Share2 size={20} />
              </div>
            </button>
          </div>
          
          {isLongContent && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-bold text-[#1d9bf0] hover:underline">
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="bg-[#0f1419] border-t border-[#2f3336] p-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden shrink-0">
                <img src={user?.photoURL} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post your reply..." 
                  className="w-full bg-transparent border-b border-[#2f3336] py-2 text-base text-white focus:border-[#1d9bf0] outline-none placeholder:text-[#71767b]"
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className="absolute right-0 bottom-2 text-[#1d9bf0] disabled:text-[#71767b] hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {rawComments.filter(c => !c.parentId).map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  allComments={rawComments} 
                  user={user} 
                  onLike={toggleCommentLike} 
                  onReply={addComment} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ImageModal 
        isOpen={isImageOpen} 
        onClose={() => setIsImageOpen(false)} 
        imageSrc={entry.image} 
      />
    </>
  );
};

export default EntryCard;