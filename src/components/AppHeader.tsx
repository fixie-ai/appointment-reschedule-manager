import React from 'react';

const AppHeader: React.FC = () => {
  return (
    <header className="mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-white mb-2">Appointment Confirmation Call</h1>
        <h2 className="font-mono">Ultravox example of an outbound agent call using inline instructions and call state management.</h2>
        <div className="font-mono text-sm text-left mt-6">
          Instructions:
          <ol className="list-decimal list-inside p-4 w-3xl">
            <li>Click the "Start Call" button.</li>
            <li>Answer the call with something like "Hello". The agent will start talking.</li>
            <li>Watch the stages get completed. You can click the stage action buttons to manually trigger stage actions.</li>
            <li>You can also enter instructions via text using the input below. "Wrap Up Call" button will inject an instruction to the agent.</li>
          </ol>
        </div>
      </header>
  );
};

export default AppHeader;