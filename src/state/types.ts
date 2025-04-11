// src/state/types.ts

// Define the appointment details structure
export interface AppointmentDetails {
  client_name: string;
  company_name: string;
  appointment_date: string;
  appointment_time: string;
  alt_date_1?: string;
  alt_time_1?: string;
  alt_date_2?: string;
  alt_time_2?: string;
}

// Define the call data structure
export interface CallData {
  stateHistory?: string[];
  rescheduled_date?: string;
  rescheduled_time?: string;
  confirmed?: boolean;
  cancelled?: boolean;
  wrongNumber?: boolean;
  notes?: string;
  [key: string]: unknown;
}

// Define the call state
export interface CallState {
  previousState?: string | null;
  currentState: string;
  callData: CallData;
}

// Define the state machine transitions
export interface StateMachine {
  [state: string]: {
    [action: string]: string;
  };
}

// Define the template function type
export type TemplateFunction = (data: {
  details: AppointmentDetails;
  callData: CallData;
  previousState?: string | null;
}) => string;