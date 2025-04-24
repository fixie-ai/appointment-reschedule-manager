import React from 'react';
import { UltravoxSessionStatus } from 'ultravox-client';

interface CallStatusProps {
  status: UltravoxSessionStatus | null;
}

const CallStatus: React.FC<CallStatusProps> = ({ status }) => {
  if (!status) return null;
  
  const getStatusColor = () => {
    switch (status) {
      case UltravoxSessionStatus.SPEAKING:
        return 'text-green-400';
      case UltravoxSessionStatus.CONNECTING:
        return 'text-amber-400';
      case UltravoxSessionStatus.DISCONNECTED:
        return 'text-red-400';
      case UltravoxSessionStatus.LISTENING:
        return 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="text-lg flex items-center justify-center gap-2">
      <span className="mr-1">Call Status:</span>
      <span className={`font-medium ${getStatusColor()}`}>
        {status}
      </span>
    </div>
  );
};

export default CallStatus;