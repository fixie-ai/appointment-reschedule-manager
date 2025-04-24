import React from 'react';
import { UltravoxSessionStatus, UltravoxSession } from 'ultravox-client';

interface CallControlsProps {
  session: UltravoxSession | null;
  status: UltravoxSessionStatus;
  isStartingCall: boolean;
  onStartCall: () => void;
  onWrapUpCall: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  session,
  status,
  isStartingCall,
  onStartCall,
  onWrapUpCall,
  onEndCall
}) => {
  const isCallActive = session && 
    status !== UltravoxSessionStatus.IDLE && 
    status !== UltravoxSessionStatus.DISCONNECTED;

  return (
    <>
      {!isCallActive ? (
        <div className="my-4 flex gap-4 justify-center">
          <button 
            onClick={onStartCall} 
            disabled={isStartingCall}
            className={`bg-green-500 text-white border-none py-3 px-6 rounded-md font-medium cursor-pointer transition-colors hover:bg-green-600 ${isStartingCall && 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'}`}
          >
            {isStartingCall ? "Starting Call..." : "Start Call"}
          </button>
        </div>
      ) : (
        <div className="flex justify-center gap-4 my-4">
          <button 
            onClick={onWrapUpCall} 
            className="bg-amber-400 text-amber-800 border-none py-2 px-4 rounded-md font-medium cursor-pointer transition-colors hover:bg-amber-500"
          >
            Wrap Up Call
          </button>
          <button 
            onClick={onEndCall} 
            className="bg-red-500 text-white border-none py-2 px-4 rounded-md font-medium cursor-pointer transition-colors hover:bg-red-600"
          >
            End Call
          </button>
        </div>
      )}
    </>
  );
};

export default CallControls;