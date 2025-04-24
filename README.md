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
1. Call State → Defined in `src/config/index.ts`
1. Individual Call State Templates → Defined in `src/config/`. These are used in `index.ts`


## Run
1. Start the app with `pnpm dev`
1. Start a call by clicking on the "Start Call" button.
* Note: This is creating an outbound call so you need to answer the call before the agent will speak.
1. You can provide additional instructions to the agent during the call by clicking the "Wrap Up Call" button or by entering a message in the text box that appears above the conversation transcript.
* The wrap up call button sends a hard coded instruction to the agent to wrap up the call.
* You can also click on the available actions for the various call states and see how those trigger messages to the agent.

## Creating a State Machine Agent
Let's talk about how you can use the state machine approach to create your own Ultravox agent.

### 1. Define Your States

Create a file for each state in your application. Some things to keep in mind:

* **Keep States Focused**: Each state should do one thing well.
* **Clear Templates**: Write templates that clearly explain what should happen in each state.
* **Logical Transitions**: Ensure your state transitions make sense and form a complete flow.

```ts
// config/myCustomState.ts
export default {
  name: "my_custom_state",
  description: "A description of this state",
  
  template: `
    This template provides instructions for this state.
    You can use {{details.variable}} syntax to insert data.
  `,
  
  actions: {
    "action_name": {
      description: "Description of what this action does",
      nextState: "next_state_name"
    },
    // Add more actions as needed...
  }
};
```

### 2. Export Your States

In `config/index.ts`, import and export all your states:

```ts
// config/index.ts
import myCustomState from './myCustomState';
import anotherState from './anotherState';
// Import all your state files you created in step 1

// Export state constants
export const STATES = {
  MY_CUSTOM_STATE: 'my_custom_state',
  ANOTHER_STATE: 'another_state',
  // Add constants for all states
};

// Export all state definitions
export const allStates = {
  [STATES.MY_CUSTOM_STATE]: myCustomState,
  [STATES.ANOTHER_STATE]: anotherState,
  // Add all states
};

// Export state order for visualization (optional)
export const STATE_ORDER = [
  STATES.MY_CUSTOM_STATE,
  STATES.ANOTHER_STATE,
  // Order your states for visualization
];
```

### 3. Initialize the State Machine

In your application code, create the state machine:

```ts
// App.tsx or another entry point
import { createStateMachine } from './stateMachine';
import { allStates, STATES } from './config';

// Create your state machine
const myStateMachine = createStateMachine({
  name: "My Application",
  description: "Description of my application",
  initialState: STATES.MY_CUSTOM_STATE,
  states: allStates
});
```

### 4. (Optional) Use the State Machine in Your UI

Use the provided hooks to connect the state machine to your UI:

```ts
// In a React component
import { useStateMachineWithUltravox } from './hooks/useStateMachineWithUltravox';

function MyComponent() {
  // Get everything you need from the hook
  const {
    callState,
    availableActions,
    performAction,
    // ...other methods and properties
  } = useStateMachineWithUltravox(
    myStateMachine,
    myApplicationData
  );
  
  // Use these in your component
  return (
    <div>
      <p>Current state: {callState.currentState}</p>
      <div>
        {availableActions.map(action => (
          <button 
            key={action}
            onClick={() => performAction(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
```