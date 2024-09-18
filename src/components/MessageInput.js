import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';

function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleFileSend,
  handleKeyDown,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 bg-white border-t flex items-center">
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-500 mr-2"
      >
        <FontAwesomeIcon icon={faSmile} />
      </button>

      <input
        type="file"
        className="hidden"
        id="fileInput"
        onChange={handleFileSend}
      />
      <label htmlFor="fileInput" className="text-gray-500 cursor-pointer mr-2">
        <FontAwesomeIcon icon={faPaperclip} />
      </label>

      <input
        type="text"
        className="flex-1 p-2 border rounded"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSendMessage}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-8 md:left-auto md:right-8">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}

export default MessageInput;
