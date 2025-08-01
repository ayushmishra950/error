import React from "react";
import GifPicker from "gif-picker-react";

const GifSelector = ({ onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <GifPicker
        
        onGifClick={(gif) => {
          console.log("GIF selected:", gif);
          onSelect && onSelect(gif);
        }}
        width={320}
        height={400}
      />
    </div>
  );
};

export default GifSelector;
