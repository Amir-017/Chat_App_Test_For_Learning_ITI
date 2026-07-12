import { useState, useRef, useEffect } from 'react';

const MessageOptions = ({ message, openUpward, setCheckDelete, setAllMessages, socket, selectedUser, onEdit, currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // delete message function
const handleDeleteMessage = (msg) => {
  setAllMessages((prev) =>
    prev.map((m) => (m._id === msg?._id ? { ...m, isDeleted: true } : m))
  );
  // setCheckDelete(msg?._id);
  // send delete request to server
  socket.emit('delete-message', {
    messageId: msg?._id,
  });
};

  return (
    <div className="">
          {String(currentUserId) === String(message?.sender) && (message?.isDeleted === false) &&   <div ref={menuRef} className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-start text-slate-400 hover:text-slate-100 p-1 rounded-full hover:bg-white/10 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 w-fit min-w-[110px] rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-white/10 overflow-hidden z-20 bg-slate-950/95 backdrop-blur-xl ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          
          {!message?.image?.url && (
            <button
              onClick={() => {
                onEdit(message);
                setIsOpen(false);
              }}
              className="w-full text-right px-4 py-2 text-sm text-slate-100 hover:bg-white/10 transition whitespace-nowrap"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => {
              handleDeleteMessage(message);
              setIsOpen(false);
            }}
            className="w-full text-right px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition whitespace-nowrap"
          >
            Delete
          </button>
        </div>
      )}
    </div>}

    </div>

     
  
  );
};

export default MessageOptions;