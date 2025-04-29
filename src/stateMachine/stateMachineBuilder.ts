import { StateEnum, states } from '../config/states';
import { AppointmentDetails, CallData } from '../config/types';

// Gets the template for a given state
export function getTemplate(state: StateEnum): (data: {
  details: AppointmentDetails;
  callData: CallData;
  previousState?: StateEnum | null;
}) => string {
  const stateDefinition = states[state];
  if (!stateDefinition) {
    return () => `No template found for state: ${state}`;
  }
  
  return stateDefinition.template;
}

// Build state transitions for visualization
export function buildStateTransitions(): Record<string, string[]> {
  const stateTransitions: Record<string, string[]> = {};
  
  Object.entries(states).forEach(([stateName, stateDefinition]) => {
    stateTransitions[stateName] = Object.entries(stateDefinition.actions).map(
      ([, actionObj]) => actionObj.nextState
    );
  });
  
  return stateTransitions;
}

// Export a compiled state machine for use in the application
export const STATE_TRANSITIONS = buildStateTransitions();