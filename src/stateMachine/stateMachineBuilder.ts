import Mustache from 'mustache';
import { allStates, STATES } from '../config';
import { StateMachine, TemplateFunction } from '../config/types';

export function buildStateMachine(): StateMachine {
  const stateMachine: StateMachine = {};
  
  // Loop through all states and build the state machine
  Object.entries(allStates).forEach(([stateName, stateDefinition]) => {
    stateMachine[stateName] = {};
    
    // Add transitions for each action
    Object.entries(stateDefinition.actions || {}).forEach(([actionName, actionObj]) => {
      const action = actionObj as { description: string; nextState: string };
      stateMachine[stateName][actionName] = action.nextState;
    });
  });
  
  return stateMachine;
}

// Build state transitions for visualization
export function buildStateTransitions(): Record<string, string[]> {
  const stateTransitions: Record<string, string[]> = {};
  
  Object.entries(allStates).forEach(([stateName, stateDefinition]) => {
    stateTransitions[stateName] = Object.entries(stateDefinition.actions || {})
      .map(([, actionObj]) => {
        const action = actionObj as { description: string; nextState: string };
        return action.nextState;
      });
  });
  
  return stateTransitions;
}

export function createTemplateFunction(stateName: string): TemplateFunction {
  return (data) => {
    const stateDefinition = allStates[stateName];
    if (!stateDefinition || !stateDefinition.template) {
      return `No template found for state: ${stateName}`;
    }
    
    return Mustache.render(stateDefinition.template, data);
  };
}

export function getTemplate(state: string): TemplateFunction {
  return createTemplateFunction(state) || createTemplateFunction(STATES.INITIAL);
}

// Export a compiled state machine for use in the application
export const STATE_MACHINE = buildStateMachine();
export const STATE_TRANSITIONS = buildStateTransitions();