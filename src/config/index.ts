import initial from './initial';
import identityChecking from './identityChecking';
import attendanceChecking from './attendanceChecking';
import appointmentConfirmed from './appointmentConfirmed';
import rescheduleOffering from './rescheduleOffering';
import rescheduleChecking from './rescheduleChecking';
import rescheduleConfirmed from './rescheduleConfirmed';
import appointmentCancelled from './appointmentCancelled';
import callEnded from './callEnded';

// Export state name constants
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

// Export all state definitions
export const allStates = {
  [STATES.INITIAL]: initial,
  [STATES.IDENTITY_CHECKING]: identityChecking,
  [STATES.ATTENDANCE_CHECKING]: attendanceChecking,
  [STATES.APPOINTMENT_CONFIRMED]: appointmentConfirmed,
  [STATES.RESCHEDULE_OFFERING]: rescheduleOffering,
  [STATES.RESCHEDULE_CHECKING]: rescheduleChecking,
  [STATES.RESCHEDULE_CONFIRMED]: rescheduleConfirmed,
  [STATES.APPOINTMENT_CANCELLED]: appointmentCancelled,
  [STATES.CALL_ENDED]: callEnded
};

// Compile action descriptions from all states
export const ACTION_DESCRIPTIONS = Object.entries(allStates).reduce(
  (descriptions, [, state]) => {
    Object.entries(state.actions || {}).forEach(([actionName, actionObj]) => {
      const action = actionObj as { description: string; nextState: string };
      descriptions[actionName] = action.description;
    });
    return descriptions;
  },
  {} as Record<string, string>
);

// Export state descriptions for UI display
export const STATE_DESCRIPTIONS = Object.values(allStates).reduce(
  (descriptions, state) => {
    descriptions[state.name] = state.description;
    return descriptions;
  },
  {} as Record<string, string>
);

// Define the order of states for visualization
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