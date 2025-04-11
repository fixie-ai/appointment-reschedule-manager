// src/state/appointmentStateMachine.ts

import { CallState, CallData, StateMachine } from './types';

// Define all possible states
export const STATES = {
  INITIAL: 'initial',
  IDENTITY_CHECKING: 'identity_checking',
  ATTENDANCE_CHECKING: 'attendance_checking',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  RESCHEDULE_OFFERING: 'reschedule_offering',
  RESCHEDULE_CHECKING: 'reschedule_checking',
  RESCHEDULE_CONFIRMED: 'reschedule_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  CALL_ENDED: 'call_ended'
};

// Define all possible actions/transitions
export const ACTIONS = {
  START_CALL: 'start_call',
  CONFIRM_IDENTITY: 'confirm_identity',
  WRONG_NUMBER: 'wrong_number',
  CAN_ATTEND: 'can_attend',
  CANNOT_ATTEND: 'cannot_attend',
  OFFER_ALTERNATIVES: 'offer_alternatives',
  CAN_RESCHEDULE: 'can_reschedule',
  CANNOT_RESCHEDULE: 'cannot_reschedule',
  CONFIRM_RESCHEDULE: 'confirm_reschedule',
  CANCEL_APPOINTMENT: 'cancel_appointment',
  END_CALL: 'end_call'
};

// Define the state machine transitions
const STATE_MACHINE: StateMachine = {
  [STATES.INITIAL]: {
    [ACTIONS.START_CALL]: STATES.IDENTITY_CHECKING
  },
  [STATES.IDENTITY_CHECKING]: {
    [ACTIONS.CONFIRM_IDENTITY]: STATES.ATTENDANCE_CHECKING,
    [ACTIONS.WRONG_NUMBER]: STATES.CALL_ENDED
  },
  [STATES.ATTENDANCE_CHECKING]: {
    [ACTIONS.CAN_ATTEND]: STATES.APPOINTMENT_CONFIRMED,
    [ACTIONS.CANNOT_ATTEND]: STATES.RESCHEDULE_OFFERING
  },
  [STATES.APPOINTMENT_CONFIRMED]: {
    [ACTIONS.END_CALL]: STATES.CALL_ENDED
  },
  [STATES.RESCHEDULE_OFFERING]: {
    [ACTIONS.OFFER_ALTERNATIVES]: STATES.RESCHEDULE_CHECKING
  },
  [STATES.RESCHEDULE_CHECKING]: {
    [ACTIONS.CAN_RESCHEDULE]: STATES.RESCHEDULE_CONFIRMED,
    [ACTIONS.CANNOT_RESCHEDULE]: STATES.APPOINTMENT_CANCELLED
  },
  [STATES.RESCHEDULE_CONFIRMED]: {
    [ACTIONS.END_CALL]: STATES.CALL_ENDED
  },
  [STATES.APPOINTMENT_CANCELLED]: {
    [ACTIONS.END_CALL]: STATES.CALL_ENDED
  },
  [STATES.CALL_ENDED]: {} // Terminal state
};

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