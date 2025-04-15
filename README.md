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
1. System Prompt → This is defined in `/config/systemPrompt.ts`
1. Call State Messages → Defined in `/config/templates.ts`
1. Call State → Defined in `/config/stateDefinitions.ts`


## Run
1. Start the app with `pnpm dev`
1. Start a call by clicking on the "Start Call" button.
* Note: This is creating an outbound call so you need to answer the call before the agent will speak.
1. You can provide additional instructions to the agent during the call by clicking the "Wrap Up Call" button or by entering a message in the text box that appears above the conversation transcript.
* The wrap up call button sends a hard coded instruction to the agent to wrap up the call.
* You can also click on the available actions for the various call states and see how those trigger messages to the agent.