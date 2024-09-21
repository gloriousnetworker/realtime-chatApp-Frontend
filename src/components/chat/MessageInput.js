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
  customUserId,
  chatId, // Pass chatId as prop
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-2 border-t flex items-center space-x-3 md:static md:bottom-auto md:w-auto">
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
        className="flex-1 p-2 border rounded-lg"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ marginRight: '10px' }} // Adjusting margin for better spacing
      />

      <button
        onClick={handleSendMessage}
        className="p-2 bg-blue-500 text-white rounded-lg"
      >
        Send
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 md:left-auto md:right-8 z-50">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}

export default MessageInput;
