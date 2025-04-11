import React from 'react';
import { STATES, ACTIONS } from '../state/appointmentStateMachine';
import { CallState } from '../state/types';

interface StateMachineVisualizationProps {
  callState: CallState;
  availableActions: string[];
  onActionClick?: (action: string) => void;
}

// Define state descriptions for UI display
const STATE_DESCRIPTIONS: Record<string, string> = {
  [STATES.INITIAL]: "Preparing to start the appointment confirmation call",
  [STATES.IDENTITY_CHECKING]: "Verifying the identity of the person answering the call",
  [STATES.ATTENDANCE_CHECKING]: "Confirming if the client can attend the scheduled appointment",
  [STATES.APPOINTMENT_CONFIRMED]: "The appointment has been confirmed for the original time",
  [STATES.RESCHEDULE_OFFERING]: "Offering alternative appointment times",
  [STATES.RESCHEDULE_CHECKING]: "Confirming if any of the alternative times work for the client",
  [STATES.RESCHEDULE_CONFIRMED]: "The appointment has been rescheduled for a new time",
  [STATES.APPOINTMENT_CANCELLED]: "The appointment has been cancelled",
  [STATES.CALL_ENDED]: "The call has been completed"
};

// Define action descriptions for UI display
const ACTION_DESCRIPTIONS: Record<string, string> = {
  [ACTIONS.START_CALL]: "Initiate the outbound call",
  [ACTIONS.CONFIRM_IDENTITY]: "Confirm you're speaking with the client or their representative",
  [ACTIONS.WRONG_NUMBER]: "The person is not the client and doesn't know them",
  [ACTIONS.CAN_ATTEND]: "The client can attend the scheduled appointment",
  [ACTIONS.CANNOT_ATTEND]: "The client cannot attend the scheduled appointment",
  [ACTIONS.OFFER_ALTERNATIVES]: "Offer alternative appointment times",
  [ACTIONS.CAN_RESCHEDULE]: "The client can make one of the alternative times",
  [ACTIONS.CANNOT_RESCHEDULE]: "The client cannot make any of the alternative times",
  [ACTIONS.CONFIRM_RESCHEDULE]: "Confirm the rescheduled appointment time",
  [ACTIONS.CANCEL_APPOINTMENT]: "Cancel the appointment completely",
  [ACTIONS.END_CALL]: "End the call"
};

// Define the transitions for visualization purposes
const STATE_TRANSITIONS: Record<string, string[]> = {
  [STATES.INITIAL]: [STATES.IDENTITY_CHECKING],
  [STATES.IDENTITY_CHECKING]: [STATES.ATTENDANCE_CHECKING, STATES.CALL_ENDED],
  [STATES.ATTENDANCE_CHECKING]: [STATES.APPOINTMENT_CONFIRMED, STATES.RESCHEDULE_OFFERING],
  [STATES.APPOINTMENT_CONFIRMED]: [STATES.CALL_ENDED],
  [STATES.RESCHEDULE_OFFERING]: [STATES.RESCHEDULE_CHECKING],
  [STATES.RESCHEDULE_CHECKING]: [STATES.RESCHEDULE_CONFIRMED, STATES.APPOINTMENT_CANCELLED],
  [STATES.RESCHEDULE_CONFIRMED]: [STATES.CALL_ENDED],
  [STATES.APPOINTMENT_CANCELLED]: [STATES.CALL_ENDED],
  [STATES.CALL_ENDED]: []
};

// Order states for visual display
const STATE_ORDER = [
  STATES.INITIAL,
  STATES.IDENTITY_CHECKING,
  STATES.ATTENDANCE_CHECKING,
  STATES.APPOINTMENT_CONFIRMED,
  STATES.RESCHEDULE_OFFERING,
  STATES.RESCHEDULE_CHECKING,
  STATES.RESCHEDULE_CONFIRMED,
  STATES.APPOINTMENT_CANCELLED,
  STATES.CALL_ENDED
];

const StateMachineVisualization: React.FC<StateMachineVisualizationProps> = ({
  callState,
  availableActions,
  onActionClick
}) => {
  const { currentState, previousState } = callState;
  
  // Helper function to get state status class
  const getStateStatusClass = (state: string) => {
    if (state === currentState) return "current";
    if (callState.previousState && state === callState.previousState) return "previous";
    if (callState.callData.stateHistory?.includes(state)) return "visited";
    
    // Check if this state is a possible next state based on the state machine transitions
    const transitions = STATE_TRANSITIONS[currentState] || [];
    if (transitions.includes(state)) return "next-possible";
    
    return "future";
  };

  return (
    <div className="state-machine-visualization">
      <h2>Call Flow Progress</h2>
      
      {/* State Flow Diagram - Left Column */}
      <div className="state-flow-diagram">
        {STATE_ORDER.map((state) => (
          <div 
            key={state}
            className={`state-node ${getStateStatusClass(state)}`}
          >
            <div className="state-node-content">
              <span className="state-node-name">{state.replace(/_/g, ' ')}</span>
              {state === currentState && (
                <span className="state-node-marker">●</span>
              )}
            </div>
            {state !== STATE_ORDER[STATE_ORDER.length - 1] && (
              <div className="state-connector"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Current State Display - Middle Column */}
      <div className="current-state-display">
        <h3>Current State</h3>
        <div className="current-state-box">
          <span className="state-name">{currentState.replace(/_/g, ' ')}</span>
          <p className="state-description">{STATE_DESCRIPTIONS[currentState]}</p>
        </div>
        
        {/* State History */}
        <div className="state-history">
          <h3>Call Progress</h3>
          <ol className="state-history-list">
            {(callState.callData.stateHistory || []).map((historyState, index) => (
              <li key={index} className="state-history-item">
                <span className="history-state-name">{historyState.replace(/_/g, ' ')}</span>
              </li>
            ))}
            <li className="state-history-item current">
              <span className="history-state-name">{currentState.replace(/_/g, ' ')}</span>
            </li>
          </ol>
        </div>
      </div>
      
      {/* Available Actions - Right Column */}
      <div className="available-actions">
        <h3>Available Actions</h3>
        {availableActions.length === 0 ? (
          <p className="no-actions">No actions available in current state</p>
        ) : (
          <div className="action-buttons">
            {availableActions.map((action) => (
              <div key={action} className="action-button-container">
                <button
                  className="action-button"
                  onClick={() => onActionClick && onActionClick(action)}
                >
                  {action.replace(/_/g, ' ')}
                </button>
                <span className="action-description">{ACTION_DESCRIPTIONS[action]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateMachineVisualization;