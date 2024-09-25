import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSmile,
  faPaperclip,
  faMicrophone,
  faPaperPlane,
  faPhotoVideo,
  faFileAlt,
  faMapMarkerAlt,
  faAddressBook,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";



function MessageInput({ newMessage, setNewMessage, handleSendMessage }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handlePhotoSelect = () => {
    photoInputRef.current.click();
  };

  const handleDocumentSelect = () => {
    documentInputRef.current.click();
  };

  const handleFileSend = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      console.log(files); // Replace with your upload logic
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isMobile) {
        // On mobile, allow Enter to create a new line
        return;
      } else if (e.shiftKey) {
        // Allow line break on Shift + Enter for desktop
        return;
      } else {
        // On desktop, Enter without Shift sends the message
        e.preventDefault(); // Prevent default action (new line) when Enter is pressed
        handleSendMessage();
      }
    }
  };

  const handleClickOnMessageArea = () => {
    setShowEmojiPicker(false);
    setShowFileOptions(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white px-2 py-2 border-t flex items-center space-x-3 md:space-x-4 md:static md:bottom-auto md:w-auto">
      {/* Emoji button */}
      <button
        onClick={() => {
          setShowEmojiPicker((prev) => !prev);
          setShowFileOptions(false); // Close file options if opening emoji picker
        }}
        className="text-gray-500"
      >
        <FontAwesomeIcon icon={faSmile} size="lg" />
      </button>

      <div className="mx-2"></div>

      {/* Document button with dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowFileOptions((prev) => !prev);
            setShowEmojiPicker(false); // Close emoji picker if opening file options
          }}
          className="text-gray-500"
        >
          <FontAwesomeIcon icon={faPaperclip} size="lg" />
        </button>

        {/* File dropdown options */}
        {showFileOptions && (
          <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg z-50 border border-gray-300 file-options">
            <ul className="space-y-2 p-2">
              <li
                onClick={handlePhotoSelect}
                className="cursor-pointer flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faPhotoVideo} className="mr-2" /> Photos
              </li>
              <li
                onClick={handleDocumentSelect}
                className="cursor-pointer flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Document
              </li>
              <li
                onClick={() => alert("Location selection not implemented yet!")}
                className="cursor-pointer flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> Location
              </li>
              <li
                onClick={() => alert("Contact selection not implemented yet!")}
                className="cursor-pointer flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faAddressBook} className="mr-2" /> Contact
              </li>
              <li
                onClick={() => alert("Personal details feature is not available now.")}
                className="cursor-pointer flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faIdCard} className="mr-2" /> Personal card
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Hidden file input for photos */}
      <input
        type="file"
        accept="image/*"
        ref={photoInputRef}
        className="hidden"
        onChange={handleFileSend}
      />

      {/* Hidden file input for documents */}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        ref={documentInputRef}
        className="hidden"
        onChange={handleFileSend}
      />

      {/* Message input box as a textarea for line breaks */}
      <textarea
        className="flex-1 p-2 bg-transparent text-sm md:text-base focus:outline-none resize-none max-h-24" // Limit height with max-h-24
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1} // Start with one row
        onClick={handleClickOnMessageArea} // Close pickers when clicking here
      />

      {/* Conditionally render Voice Recorder or Send Paper Plane based on input */}
      <button
        onClick={handleSendMessage}
        className="p-2 bg-blue-500 text-white rounded-lg"
        disabled={!newMessage.trim()}
      >
        <FontAwesomeIcon
          icon={newMessage.trim() ? faPaperPlane : faMicrophone}
          size="lg"
        />
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-12 left-0 md:left-auto md:right-8 z-50 emoji-picker">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}

export default MessageInput;
