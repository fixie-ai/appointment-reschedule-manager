import React from 'react';
import { Transcript } from 'ultravox-client';

interface TranscriptDisplayProps {
  transcript: Transcript[];
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  return (
    <div className="w-4xl mx-auto text-left p-4 bg-slate-50 rounded-lg shadow-sm">
      <h2 className="text-slate-800 text-2xl font-semibold mb-4 pb-2 border-b border-slate-200">Conversation Transcript</h2>
      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto p-2">
        {transcript.map((t, i) => (
          <div
            key={i}
            className={`p-3 rounded-md max-w-[80%] shadow-sm whitespace-pre-wrap text-slate-800 ${
              t.speaker.toString() === "user" 
                ? "self-end bg-blue-50 border border-blue-200" 
                : "self-start bg-white border border-slate-200"
            }`}
          >
            <strong>{t.speaker}:</strong> {t.text}
          </div>
        ))}
        {transcript.length === 0 && (
          <div className="text-slate-500 text-center py-8 italic">
            No conversation yet. Start a call to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptDisplay;