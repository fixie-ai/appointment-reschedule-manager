import { states, StateEnum, ActionEnum } from '../config/states';
import { CallState, CallData } from '../config/types';

// Function to transition between states
export function transition(currentState: StateEnum, action: string, callData: CallData): CallState {
  const stateDefinition = states[currentState];
  const actionDefinition = stateDefinition.actions[action as ActionEnum];
  
  if (!actionDefinition) {
    throw new Error(`Invalid transition: ${action} from state ${currentState}`);
  }
  
  // Check condition if exists
  if (actionDefinition.condition && !actionDefinition.condition(callData)) {
    throw new Error(`Transition condition failed: ${action} from state ${currentState}`);
  }
  
  // Update call data if needed
  let updatedData = { ...callData };
  if (actionDefinition.updateData) {
    updatedData = { 
      ...updatedData, 
      ...actionDefinition.updateData(updatedData) 
    };
  }
  
  // Return new state
  return {
    previousState: currentState,
    currentState: actionDefinition.nextState,
    callData: {
      ...updatedData,
      stateHistory: [...(updatedData.stateHistory || []), currentState]
    }
  };
}

// Function to get available actions for current state
export function getAvailableActions(currentState: StateEnum): string[] {
  return Object.keys(states[currentState].actions);
}

// Function to initialize the state machine
export function initializeStateMachine(): CallState {
  return {
    currentState: StateEnum.INITIAL,
    previousState: null,
    callData: {
      stateHistory: []
    }
  };
}