import { AppointmentDetails, CallData } from './types';

// ----------------------------------------------------------------------------- //
// State Machine Implementation for Appointment Management                       //
// ----------------------------------------------------------------------------- //
// This file defines a complete state machine for managing outbound appointment  //
// confirmations and rescheduling calls. The structure is designed to be:        //
//    1. Type-safe: Using TypeScript enums and interfaces                        //
//    2. Declarative: States and transitions are clearly defined                 //
//    3. Maintainable: All state definitions in one place                        //
//    4. Extensible: Easy to add new states or actions                           //
//                                                                               //
// HOW TO USE THIS PATTERN IN YOUR OWN APP:                                      //
//    1. Define your states using StateEnum                                      //
//    2. Define your actions using ActionEnum                                    //
//    3. Create state definitions including templates and actions                //
//    4. Use the transition function in stateMachine.ts to move between states   //
// ----------------------------------------------------------------------------- //

/**
 * StateEnum - All possible states in the appointment management flow
 * 
 * Use this enum to reference states throughout your application.
 * Add new states here first, then create its definition below.
 */
export enum StateEnum {
  INITIAL = 'initial',
  IDENTITY_CHECKING = 'identity_checking',
  ATTENDANCE_CHECKING = 'attendance_checking',
  RESCHEDULE_OFFERING = 'reschedule_offering',
  RESCHEDULE_CONFIRMED = 'reschedule_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  CALL_ENDED = 'call_ended'
}

/**
 * ActionEnum - All possible actions that can trigger state transitions
 * 
 * These are the "events" that trigger transitions between states.
 * Each state defines which subset of actions it supports.
 */
export enum ActionEnum {
  START_CALL = 'start_call',
  CONFIRM_IDENTITY = 'confirm_identity',
  WRONG_NUMBER = 'wrong_number',
  CAN_ATTEND = 'can_attend',
  CANNOT_ATTEND = 'cannot_attend',
  NEW_DATE_CONFIRMED = 'new_date_confirmed',
  CANCEL_APPOINTMENT = 'cancel_appointment',
  END_CALL = 'end_call'
}

/**
 * STATE_ORDER - Defines the logical progression of states for visualization
 * 
 * This array determines how states are displayed in the UI.
 * It doesn't restrict the actual flow - transitions are defined in state actions.
 */
export const STATE_ORDER = [
  StateEnum.INITIAL,
  StateEnum.IDENTITY_CHECKING,
  StateEnum.ATTENDANCE_CHECKING,
  StateEnum.RESCHEDULE_OFFERING,
  StateEnum.RESCHEDULE_CONFIRMED,
  StateEnum.APPOINTMENT_CANCELLED,
  StateEnum.CALL_ENDED
];

/**
 * TemplateFunction - Defines a function that generates instructions for the AI agent
 * 
 * Each state has a template function that:
 * - Receives contextual data (appointment details, call state, etc.)
 * - Returns a string with instructions for the AI agent
 * - Can include dynamic content based on the data parameters
 */
export type TemplateFunction = (data: {
  details: AppointmentDetails;
  callData: CallData;
  previousState?: StateEnum | null;
}) => string;

/**
 * StateAction - Defines what happens when an action is taken in a particular state
 * 
 * Actions can:
 * - Transition to a new state via nextState
 * - Have optional conditions that must be met for the transition to occur
 * - Update the call data before transitioning
 */
export type StateAction = {
  description: string;
  nextState: StateEnum;
  condition?: (callData: CallData) => boolean;
  updateData?: (callData: CallData) => Partial<CallData>;
};

/**
 * StateDefinition - Complete definition of a state
 * 
 * Each state has:
 * - A description (for UI/debugging)
 * - A template function that provides instructions
 * - A set of available actions (subset of ActionEnum)
 */
export type StateDefinition = {
  description: string;
  template: TemplateFunction;
  actions: Partial<Record<ActionEnum, StateAction>>;
};

/**
 * states - The complete state machine definition
 * 
 * This is the heart of the state machine:
 * - Keys are StateEnum values
 * - Values are StateDefinition objects
 * 
 * To add a new state:
 * 1. Add it to StateEnum
 * 2. Add a new entry to this object
 * 3. Define its template and actions
 */
export const states: Record<StateEnum, StateDefinition> = {

  /**
   * INITIAL - Starting state before the call begins
   * 
   * This state prepares for the outbound call and provides initial context
   * to the agent about the appointment being confirmed.
   */
  [StateEnum.INITIAL]: {
    description: "Preparing to start the call",
    template: ({ details }) => `
      Preparing to make an outbound call to ${details.client_name} 
      regarding the appointment on ${details.appointment_date} 
      at ${details.appointment_time}.
      
      To start the call, select "${ActionEnum.START_CALL}".
    `,
    actions: {
      [ActionEnum.START_CALL]: {
        description: "Initiate the outbound call",
        nextState: StateEnum.IDENTITY_CHECKING
      }
    }
  },
  
  /**
   * IDENTITY_CHECKING - Verifying we're speaking with the right person
   * 
   * In this state, the agent verifies the identity of the person who answered
   * to ensure we're speaking with the intended client.
   */
  [StateEnum.IDENTITY_CHECKING]: {
    description: "Verifying the identity of the person answering the call",
    template: ({ details }) => `
      You have just made an outbound phone call. Say something like:
      "Hi, I am a virtual assistant calling from ${details.company_name}. Is ${details.client_name} available?"
      
      If they aren't ${details.client_name} and don't 
      know who ${details.client_name} is, apologize for the confusion, 
      thank them for their time, and select "${ActionEnum.WRONG_NUMBER}".
      
      If they say they are ${details.client_name}, select "${ActionEnum.CONFIRM_IDENTITY}".
    `,
    actions: {
      [ActionEnum.CONFIRM_IDENTITY]: {
        description: "Confirm you're speaking with the client",
        nextState: StateEnum.ATTENDANCE_CHECKING
      },
      [ActionEnum.WRONG_NUMBER]: {
        description: "The person is not the client and doesn't know them",
        nextState: StateEnum.CALL_ENDED,
        updateData: (callData) => ({ ...callData, wrongNumber: true })
      }
    }
  },

  /**
   * ATTENDANCE_CHECKING - Confirming if client can attend their appointment
   * 
   * This state handles verifying whether the client can attend their
   * scheduled appointment, and directs the flow based on their response.
   */
  [StateEnum.ATTENDANCE_CHECKING]: {
    description: "Confirming if the client can attend the scheduled appointment",
    template: ({ details }) => `
      Say something like: "Hi ${details.client_first}, I'm calling to confirm your upcoming appointment 
      scheduled for ${details.appointment_date} at ${details.appointment_time}.
      Is that still going to work for you?"
      
      If they confirm they can attend, express that you're looking forward to 
      seeing them. Say something like:
      "Great! We're looking forward to seeing you on 
      ${details.appointment_date} at ${details.appointment_time}. Have a wonderful day!"
      
      Then select "${ActionEnum.CAN_ATTEND}".
      
      If they say they cannot attend, select "${ActionEnum.CANNOT_ATTEND}".
    `,
    actions: {
      [ActionEnum.CAN_ATTEND]: {
        description: "The client can attend the scheduled appointment. Ending the call.",
        nextState: StateEnum.CALL_ENDED,
        updateData: (callData) => ({ ...callData, confirmed: true })
      },
      [ActionEnum.CANNOT_ATTEND]: {
        description: "The client cannot attend the scheduled appointment",
        nextState: StateEnum.RESCHEDULE_OFFERING
      }
    }
  },
  
  /**
   * RESCHEDULE_OFFERING - Offering alternative appointment times
   * 
   * If the client can't attend, this state presents alternative appointment
   * times and handles their selection or cancellation.
   */
  [StateEnum.RESCHEDULE_OFFERING]: {
    description: "Offering alternative appointment times",
    template: ({ details }) => `
      Say something like:
      "I'm sorry to hear that. We do have a couple of alternative times available. 
      Would any of these work better for you?"
      
      Offer the following alternative times:
      - ${details.alt_date_1} at ${details.alt_time_1}
      - ${details.alt_date_2} at ${details.alt_time_2}

      If they say they can make one of the alternative times, select "${ActionEnum.NEW_DATE_CONFIRMED}".

      If they cannot make either of the alternative times, select "${ActionEnum.CANCEL_APPOINTMENT}".
    `,
    actions: {
      [ActionEnum.NEW_DATE_CONFIRMED]: {
        description: "Confirm new appointment date",
        nextState: StateEnum.RESCHEDULE_CONFIRMED
      },
      [ActionEnum.CANCEL_APPOINTMENT]: {
        description: "Cancel the appointment",
        nextState: StateEnum.APPOINTMENT_CANCELLED,
        updateData: (callData) => ({ ...callData, cancelled: true })
      }
    }
  },
  
  /**
   * RESCHEDULE_CONFIRMED - New appointment time has been confirmed
   * 
   * This state handles the confirmation of a new appointment time,
   * summarizing the new details to the client.
   */
  [StateEnum.RESCHEDULE_CONFIRMED]: {
    description: "Appointment rescheduled for a new time",
    template: ({ callData, details }) => `
      Confirm their selection by saying something like:
      "Great! I've rescheduled your appointment for 
      ${callData.rescheduled_date} at ${callData.rescheduled_time}. 
      We look forward to seeing you then, ${details.client_first}. 
      Is there anything else I can help you with today?"
      
      Address any additional questions they might have, then thank them for their time
      and select "${ActionEnum.END_CALL}".
    `,
    actions: {
      [ActionEnum.END_CALL]: {
        description: "End the call",
        nextState: StateEnum.CALL_ENDED
      }
    }
  },
  
  /**
   * APPOINTMENT_CANCELLED - Appointment has been cancelled
   * 
   * This state handles the cancellation of an appointment,
   * providing closure to the client and ending the call.
   */
  [StateEnum.APPOINTMENT_CANCELLED]: {
    description: "Appointment cancelled",
    template: () => `
      Let them know you'll cancel the current appointment by saying something like:
      "I understand. I'll cancel the appointment for now. 
      Please feel free to reach out to us in the future when you'd like to reschedule. 
      Thank you for letting us know, and we hope to see you soon!"
      
      Select "${ActionEnum.END_CALL}" to end the call.
    `,
    actions: {
      [ActionEnum.END_CALL]: {
        description: "End the call",
        nextState: StateEnum.CALL_ENDED
      }
    }
  },
  
  /**
   * CALL_ENDED - Final state, call has concluded
   * 
   * Terminal state that indicates the call has ended.
   * Has no outgoing actions.
   */
  [StateEnum.CALL_ENDED]: {
    description: "Call completed",
    template: () => `
      The call has ended.
    `,
    actions: {} // No actions for ending state
  }
};

/**
 * ACTION_DESCRIPTIONS - Maps action keys to their human-readable descriptions
 * 
 * This derived mapping is useful for our UI components.
 */
export const ACTION_DESCRIPTIONS = Object.values(states).reduce(
  (descriptions, state) => {
    Object.entries(state.actions).forEach(([actionKey, actionObj]) => {
      descriptions[actionKey] = actionObj.description;
    });
    return descriptions;
  },
  {} as Record<string, string>
);

/**
 * STATE_DESCRIPTIONS - Maps state keys to their human-readable descriptions
 * 
 * This derived mapping is useful for our UI components.
 */
export const STATE_DESCRIPTIONS = Object.entries(states).reduce(
  (descriptions, [stateKey, state]) => {
    descriptions[stateKey] = state.description;
    return descriptions;
  },
  {} as Record<string, string>
);