import { StateEnum } from './states';

// Appointment details that are passed in at call creation
export interface AppointmentDetails {
  client_name: string;
  client_first: string;
  company_name: string;
  appointment_date: string;
  appointment_time: string;
  alt_date_1?: string;
  alt_time_1?: string;
  alt_date_2?: string;
  alt_time_2?: string;
}

export interface CallData {
  stateHistory?: StateEnum[];
  rescheduled_date?: string;
  rescheduled_time?: string;
  confirmed?: boolean;
  cancelled?: boolean;
  wrongNumber?: boolean;
  notes?: string;
  [key: string]: unknown;
}

export interface CallState {
  previousState?: StateEnum | null;
  currentState: StateEnum;
  callData: CallData;
}