import React from 'react';
import { StateEnum, states, STATE_ORDER, ACTION_DESCRIPTIONS } from '../config/states';
import { STATE_TRANSITIONS } from '../stateMachine/stateMachineBuilder';
import { CallState } from '../config/types';

interface StateMachineVisualizationProps {
  callState: CallState;
  availableActions: string[];
  onActionClick: (action: string) => void;
}

const StateMachineVisualization: React.FC<StateMachineVisualizationProps> = ({
  callState,
  availableActions,
  onActionClick
}) => {
  const { currentState } = callState;

  const getStateDescription = (state: StateEnum) => states[state].description;
  
  const getStateNodeStyles = (state: StateEnum) => {
    const baseStyles = "p-1 rounded-md w-60 text-lg border-2 transition-all duration-300 px-4";
    
    if (state === currentState) {
      return `${baseStyles} border-blue-500 bg-blue-50 shadow-blue-500/30 shadow-sm font-semibold text-blue-800`;
    }
    if (callState.previousState && state === callState.previousState) {
      return `${baseStyles} border-green-300 bg-green-50 text-green-800`;
    }
    if (callState.callData.stateHistory?.includes(state)) {
      return `${baseStyles} border-green-300 bg-green-50 opacity-80 text-green-800`;
    }
    
    // Check if this state is a possible next state based on the state machine transitions
    const transitions = STATE_TRANSITIONS[currentState] || [];
    if (transitions.includes(state)) {
      return `${baseStyles} border-amber-300 bg-amber-50 text-amber-800`;
    }
    
    return `${baseStyles} border-slate-300 bg-slate-50 opacity-60 text-slate-500`;
  };

  const getConnectorStyles = (state: StateEnum) => {
    const baseStyles = "h-8 w-0.5 ml-8 my-2";
    
    if (state === currentState || 
        (callState.previousState && state === callState.previousState) || 
        callState.callData.stateHistory?.includes(state)) {
      return `${baseStyles} bg-green-300`;
    }
    
    return `${baseStyles} bg-slate-300`;
  };

  const isStateActiveOrCompleted = (state: StateEnum) => {
    return state === currentState || 
           callState.callData.stateHistory?.includes(state);
  };

  return (
    <div className="w-4xl mx-auto my-5 p-5 bg-slate-50 rounded-lg shadow-md gap-5 font-sans">
      <h2 className="text-left mb-5 text-slate-800 border-b-2 border-slate-200 pb-2.5 font-semibold text-2xl">Call Flow Progress</h2>
      <div className="flex flex-col">
        <div className="text-slate-800 flex flex-row font-semibold">
          <div className="w-1/3 text-center">Call Stage</div>
          <div className="w-2/3 text-center">Available Actions</div>
        </div>
        <div className="grid grid-col">
          {/* State Flow Diagram */}
          <div className="flex flex-col gap-2 my-6">
            {STATE_ORDER.map((state, index) => (
              <div key={state} className="flex flex-col mb-2">
                <div className="flex items-start gap-3">
                  {/* State node */}
                  <div className={getStateNodeStyles(state)}>
                    <div className="flex flex-col justify-between">
                      <div>
                        <span className="">{state}</span>
                        {state === currentState && (
                          <span className="text-blue-500 text-sm">●</span>
                        )}
                      </div>
                      <div className="text-xs text-left my-2">{getStateDescription(state)}</div>
                    </div>
                  </div>
                  
                  {/* Context information that appears beside the node */}
                  {isStateActiveOrCompleted(state) && (
                    <div className="text-base flex-1 text-left">
                      {/* Show available actions for current state */}
                      {state === currentState && availableActions.length > 0 && (
                        <div className="flex flex-row gap-1 mt-2 text-left">
                          <div className="flex flex-col gap-1">
                            {availableActions.map((action) => (
                              <div key={action} className="flex flex-row text-xs text-left">
                                <button
                                  className="w-32 px-2 py-1 bg-blue-500 text-white border-none rounded cursor-pointer text-xs transition-colors hover:bg-blue-600 active:bg-blue-700"
                                  onClick={() => onActionClick && onActionClick(action)}
                                >
                                  {action}
                                </button>
                                <span className="mt-1.5 text-xs text-slate-500 px-1">{ACTION_DESCRIPTIONS[action]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Connector between states */}
                {index < STATE_ORDER.length - 1 && (
                  <div className="flex items-center">
                    <div className={getConnectorStyles(state)}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateMachineVisualization;