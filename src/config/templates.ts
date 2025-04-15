// src/state/templates.ts

import { STATES, ACTIONS } from './stateDefinitions';
import { TemplateFunction } from './types';

// Templates for each state
const templates: Record<string, TemplateFunction> = {
  [STATES.INITIAL]: (data) => `
    Preparing to make an outbound call to ${data.details.client_name} 
    regarding the appointment on ${data.details.appointment_date} 
    at ${data.details.appointment_time}.
    
    To start the call, select "${ACTIONS.START_CALL}".
  `,
  
  [STATES.IDENTITY_CHECKING]: (data) => `
    You have just made an outbound phone call. Say something like:
    "Hi, I am a virtual assistant calling from ${data.details.company_name}. Is ${data.details.client_name} available?"
    
    If they aren't ${data.details.client_name} and don't 
    know who ${data.details.client_name} is, apologize for the confusion, 
    thank them for their time, and select "${ACTIONS.WRONG_NUMBER}".
    
    If they say they are ${data.details.client_name}, select "${ACTIONS.CONFIRM_IDENTITY}".
  `,
  
  [STATES.ATTENDANCE_CHECKING]: (data) => `
    Say something like: "Hi ${data.details.client_first}, I'm calling to confirm your upcoming appointment 
    scheduled for ${data.details.appointment_date} at ${data.details.appointment_time}.
    Is that still going to work for you?"
    
    If they confirm they can attend, express that you're looking forward to 
    seeing them. Say something like:
    "Great! We're looking forward to seeing you on 
    ${data.details.appointment_date} at ${data.details.appointment_time}. Have a wonderful day!"
    
    Then select "${ACTIONS.CAN_ATTEND}".
    
    If they say they cannot attend, select "${ACTIONS.CANNOT_ATTEND}".
  `,
  
  [STATES.APPOINTMENT_CONFIRMED]: (data) => `
    We're all set! You are confirmed for your appointment on 
    ${data.details.appointment_date} at ${data.details.appointment_time}.
    
    Thank them for their time and select "${ACTIONS.END_CALL}" to end the call.
  `,
  
  [STATES.RESCHEDULE_OFFERING]: (data) => `
    Say something like:
    "I'm sorry to hear that. We do have a couple of alternative times available. 
    Would any of these work better for you?"
    
    Offer the following alternative times:
    - ${data.details.alt_date_1} at ${data.details.alt_time_1}
    - ${data.details.alt_date_2} at ${data.details.alt_time_2}
    
    After offering these alternatives, select "${ACTIONS.OFFER_ALTERNATIVES}".
    
    NOTE: The only valid action in this state is "${ACTIONS.OFFER_ALTERNATIVES}". 
    You cannot use "${ACTIONS.CANNOT_RESCHEDULE}" or "${ACTIONS.CAN_RESCHEDULE}" or "${ACTIONS.CONFIRM_RESCHEDULE}" directly from this state.
  `,
  
  [STATES.RESCHEDULE_CHECKING]: (data) => `
    Find out if ${data.details.client_name} can make any of the alternative appointment times.
    
    If they say they can make one of the alternative times, collect their preferred 
    date and time, and select "${ACTIONS.CAN_RESCHEDULE}".
    
    If they say they cannot make any of the alternative times, 
    select "${ACTIONS.CANNOT_RESCHEDULE}".
  `,
  
  [STATES.RESCHEDULE_CONFIRMED]: (data) => `
    Confirm their selection by saying something like:
    "Great! I've rescheduled your appointment for 
    ${data.callData.rescheduled_date} at ${data.callData.rescheduled_time}. 
    We look forward to seeing you then, ${data.details.client_first}. 
    Is there anything else I can help you with today?"
    
    Address any additional questions they might have, then thank them for their time
    and select "${ACTIONS.END_CALL}".
  `,
  
  [STATES.APPOINTMENT_CANCELLED]: () => `
    Let them know you'll cancel the current appointment by saying something like:
    "I understand. I'll cancel the appointment for now. 
    Please feel free to reach out to us in the future when you'd like to reschedule. 
    Thank you for letting us know, and we hope to see you soon!"
    
    Select "${ACTIONS.END_CALL}" to end the call.
  `,
  
  [STATES.CALL_ENDED]: (data) => `
    The call has ended.
    
    ${data.callData.rescheduled_date 
      ? `The appointment has been rescheduled for ${data.callData.rescheduled_date} 
        at ${data.callData.rescheduled_time}.` 
      : data.previousState === STATES.APPOINTMENT_CONFIRMED 
        ? `The original appointment on ${data.details.appointment_date} at ${data.details.appointment_time} 
          is confirmed.` 
        : data.previousState === STATES.APPOINTMENT_CANCELLED 
          ? 'The appointment has been cancelled.' 
          : 'Call ended without confirmation or rescheduling.'
    }
  `
};

// Function to get the current template based on state
export function getTemplate(state: string): TemplateFunction {
  return templates[state] || templates[STATES.INITIAL];
}