// src/state/appointmentStateMachine.ts

import { CallState, CallData } from './types';
import { STATES, STATE_MACHINE } from './stateDefinitions';

// Function to transition between states
export function transition(currentState: string, action: string, callData: CallData): CallState {
  const nextState = STATE_MACHINE[currentState]?.[action];
  
  if (!nextState) {
    throw new Error(`Invalid transition: ${action} from state ${currentState}`);
  }
  
  // Update call data with new state
  return {
    previousState: currentState,
    currentState: nextState,
    callData: {
      ...callData,
      stateHistory: [...(callData.stateHistory || []), currentState]
    }
  };
}

// Function to get available actions for current state
export function getAvailableActions(currentState: string): string[] {
  return Object.keys(STATE_MACHINE[currentState] || {});
}

// Function to initialize the state machine
export function initializeStateMachine(): CallState {
  return {
    currentState: STATES.INITIAL,
    previousState: null,
    callData: {
      stateHistory: []
    }
  };
}