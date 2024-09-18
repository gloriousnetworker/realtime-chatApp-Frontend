// components/MessageInput.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';

const MessageInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleFileSend,
  handleKeyDown,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
}) => {
  return (
    <div className="p-4 bg-gray-100 flex items-center">
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="mr-2">
        <FontAwesomeIcon icon={faSmile} />
      </button>
      {showEmojiPicker && <Picker onEmojiClick={onEmojiClick} />}
      <input
        type="file"
        id="file-input"
        className="hidden"
        onChange={handleFileSend}
      />
      <label htmlFor="file-input" className="mr-2 cursor-pointer">
        <FontAwesomeIcon icon={faPaperclip} />
      </label>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 p-2 border border-gray-300 rounded-lg resize-none"
        rows="1"
      ></textarea>
      <button onClick={handleSendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
        Send
      </button>
    </div>
  );
};

export default MessageInput;
