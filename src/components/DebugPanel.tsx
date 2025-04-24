import React from 'react';
import { CallState } from '../config/types';

interface DebugPanelProps {
  callState: CallState;
  visible: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ callState, visible }) => {
  if (!visible) return null;

  return (
    <div className="w-full mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg mx-auto text-left shadow-sm">
      <h3 className="text-slate-700 text-base mt-0 mb-2">Debug Data</h3>
      <details>
        <summary className="cursor-pointer text-slate-700 py-2 select-none">Call Data</summary>
        <pre className="bg-slate-100 p-4 rounded overflow-x-auto text-slate-700 text-sm leading-normal">
          {JSON.stringify(callState.callData, null, 2)}
        </pre>
      </details>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-slate-700 py-2 select-none">State Information</summary>
        <div className="bg-slate-100 p-4 rounded overflow-x-auto text-slate-700 text-sm">
          <p><strong>Current State:</strong> {callState.currentState}</p>
          <p><strong>Previous State:</strong> {callState.previousState || "None"}</p>
        </div>
      </details>
    </div>
  );
};

export default DebugPanel;