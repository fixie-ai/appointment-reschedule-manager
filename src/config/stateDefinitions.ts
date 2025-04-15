// src/state/appointmentDefinitions.ts

import { StateMachine } from './types';

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

// Define state descriptions for UI display
export const STATE_DESCRIPTIONS: Record<string, string> = {
  [STATES.INITIAL]: "Preparing to start the call",
  [STATES.IDENTITY_CHECKING]: "Verifying the identity of the person answering the call",
  [STATES.ATTENDANCE_CHECKING]: "Confirming if the client can attend the scheduled appointment",
  [STATES.APPOINTMENT_CONFIRMED]: "Appointment confirmed for the original time",
  [STATES.RESCHEDULE_OFFERING]: "Offering alternative appointment times",
  [STATES.RESCHEDULE_CHECKING]: "Confirming if any of the alternative times work for the client",
  [STATES.RESCHEDULE_CONFIRMED]: "Appointment rescheduled for a new time",
  [STATES.APPOINTMENT_CANCELLED]: "Appointment cancelled",
  [STATES.CALL_ENDED]: "Call completed"
};

// Define action descriptions for UI display
export const ACTION_DESCRIPTIONS: Record<string, string> = {
  [ACTIONS.START_CALL]: "Initiate the outbound call",
  [ACTIONS.CONFIRM_IDENTITY]: "Confirm you're speaking with the client",
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

// Define the state machine transitions
/*

    INITIAL              -> START_CALL
       |
IDENTITY_CHECKING        -> CONFIRM_IDENTITY    ||   WRONG_NUMBER
       |
ATTENDANCE_CHECKING      -> CAN_ATTEND          ||   CANNOT_ATTEND
       |
APPOINTMENT_CONFIRMED    -> END_CALL
       |
RESCHEDULE_OFFERING      -> OFFER_ALTERNATIVES
       |
RESCHEDULE_CHECKING      -> CAN_RESCHEDULE      ||   CANNOT_RESCHEDULE
       |
RESCHEDULE_CONFIRMED     -> END_CALL
       |
APPOINTMENT_CANCELLED    -> END_CALL
       |
   CALL_ENDED

*/
export const STATE_MACHINE: StateMachine = {
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

// Define state transitions for visualization
export const STATE_TRANSITIONS: Record<string, string[]> = {
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
export const STATE_ORDER = [
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