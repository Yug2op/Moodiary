// src/components/LazyEmojiPicker.jsx
import React, { useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

export default function LazyEmojiPicker({ moodId, onSelect }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), 120);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) {
    return (
      <div className="w-full h-[360px] flex flex-col items-center justify-center text-xs text-muted-foreground font-light gap-3">
        <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="tracking-wide animate-pulse">Syncing interface...</span>
      </div>
    );
  }

  return (
    <EmojiPicker
      theme="dark"
      lazyLoadEmojis={true}
      searchPlaceHolder="Search emojis..."
      width="100%"
      height={360}
      previewConfig={{ showPreview: false }}
      skinTonesDisabled={true}
      onEmojiClick={(emojiData) => onSelect(moodId, emojiData.emoji)}
    />
  );
}