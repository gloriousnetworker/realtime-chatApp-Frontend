import React from 'react';
import Picker from 'emoji-picker-react';

const EmojiPicker = ({ onEmojiClick }) => {
  return (
    <div className="absolute bottom-20 left-8 md:left-auto md:right-8">
      <Picker onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default EmojiPicker;
