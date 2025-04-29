# appointment-reschedule-manager
An Ultravox agent for outbound appointment reminders and rescheduling.

This example shows how to use the following:
1. [Inline instructions](https://docs.ultravox.ai/guides/guidingagents#introduction-to-inline-instructions)
1. Specifically uses [tool response messages](https://docs.ultravox.ai/guides/guidingagents#tool-response-messages) to keep the agent focused

The application uses a state machine and provides a visualizer of the states and transitions.

## Installation
1. Install all dependencies
  ```bash
  pnpm install
  ```

## Setup
1. Add your Ultravox API Key
  * create a file called `.env.local` and add your key as follows
  ```bash
  VITE_ULTRAVOX_API_KEY=<your_key_here>
  ```

## Additional Configuration
1. System Prompt → Defined in `src/config/systemPrompt.ts`
1. State Machine Definition → Defined in `src/config/states.ts`

## Run
1. Start the app with `pnpm dev`
1. Start a call by clicking on the "Start Call" button.
* Note: This is creating an outbound call so you need to answer the call before the agent will speak.
1. You can provide additional instructions to the agent during the call by clicking the "Wrap Up Call" button or by entering a message in the text box that appears above the conversation transcript.
* The wrap up call button sends a hard coded instruction to the agent to wrap up the call.
* You can also click on the available actions for the various call states and see how those trigger messages to the agent.

## Creating a State Machine Agent
Let's talk about how you can use the state machine approach to create your own Ultravox agent.

### 1. Define Your State and Action Enums
First, define your states and actions as TypeScript enums for type safety and better code organization:

```typescript
// src/config/states.ts
export enum StateEnum {
  INITIAL = 'initial',
  IDENTITY_CHECKING = 'identity_checking',
  // Add all your states here...
}

export enum ActionEnum {
  START_CALL = 'start_call',
  CONFIRM_IDENTITY = 'confirm_identity',
  // Add all your actions here...
}
```

### 2. Create State Definitions
Define all the prompts and actions for each state:

```typescript
// src/config/states.ts
export const states: Record<StateEnum, StateDefinition> = {
  [StateEnum.INITIAL]: {
    description: "Preparing to start the call",
    template: ({ details }) => `
      This template provides instructions for this state.
      You can dynamically insert data like: ${details.client_name}
      
      To start the call, select "${ActionEnum.START_CALL}".
    `,
    actions: {
      [ActionEnum.START_CALL]: {
        description: "Initiate the outbound call",
        nextState: StateEnum.NEXT_STATE
      }
    }
  },
  // Define all other states...
};
```

### 3. Define State Machine Types
Create proper TypeScript types for your state machine components:

```typescript
// Type for template function
export type TemplateFunction = (data: {
  details: AppointmentDetails;
  callData: CallData;
  previousState?: StateEnum | null;
}) => string;

// Type for state action
export type StateAction = {
  description: string;
  nextState: StateEnum;
  condition?: (callData: CallData) => boolean;
  updateData?: (callData: CallData) => Partial<CallData>;
};

// Generic state type
export type StateDefinition = {
  description: string;
  template: TemplateFunction;
  actions: Partial<Record<ActionEnum, StateAction>>;
};
```

### 4. Initialize and Use the State Machine
In your app, use the state machine:

```typescript
// App.tsx or another entry point
import { getAvailableActions, initializeStateMachine, transition } from "./stateMachine/stateMachine";
import { StateEnum, ActionEnum } from "./config/states";

// Initialize the state machine
const initialState = initializeStateMachine();
setCallState(initialState);
setAvailableActions(getAvailableActions(StateEnum.INITIAL));

// Handle transitions
const performAction = (action: string) => {
  if (availableActions.includes(action)) {
    const newCallState = transition(
      currentCallState.currentState, 
      action,
      currentCallState.callData
    );
    
    setCallState(newCallState);
    setAvailableActions(getAvailableActions(newCallState.currentState));
  }
};
```