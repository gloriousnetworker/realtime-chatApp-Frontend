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
    <div className="fixed bottom-0 left-0 w-full bg-white px-2 py-2 border-t flex items-center space-x-2">
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-500"
      >
        <FontAwesomeIcon icon={faSmile} size="lg" />
      </button>

      <input
        type="file"
        className="hidden"
        id="fileInput"
        onChange={handleFileSend}
      />
      <label htmlFor="fileInput" className="text-gray-500 cursor-pointer">
        <FontAwesomeIcon icon={faPaperclip} size="lg" />
      </label>

      <input
        type="text"
        className="flex-1 p-1 border rounded-lg"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSendMessage}
        className="p-1 bg-blue-500 text-white rounded-lg text-xs" // Adjusted padding and font size
      >
        Send
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-0 right-0 mx-auto z-50">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}

export default MessageInput;
