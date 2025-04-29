import { useEffect, useRef, useState } from "react";
import { UltravoxSessionStatus } from "ultravox-client";
import { checkDateAvailability } from "./utils/date-checker";
import { getAvailableActions, initializeStateMachine, transition } from "./stateMachine/stateMachine";
import { StateEnum, ACTION_DESCRIPTIONS } from "./config/states";
import { getTemplate } from "./stateMachine/stateMachineBuilder";
import { getSystemPrompt, getInstructionsFromTemplate } from "./config/systemPrompt";
import { AppointmentDetails, CallState } from "./config/types";
import { useUltravoxSession } from "./hooks/useUltravoxSession";
import StateMachineVisualization from "./components/StateMachineVisualization";
import TranscriptDisplay from "./components/TranscriptDisplay";
import DebugPanel from "./components/DebugPanel";
import CallControls from "./components/CallControls";
import CallStatus from "./components/CallStatus";
import AppHeader from "./components/AppHeader";

// Sample appointment details - in a real app, this would come from a database or API
const appointmentDetails: AppointmentDetails = {
  client_name: "Steve Jackson",
  client_first: "Steve",
  company_name: "Medical Depot",
  appointment_date: "April 15, 2025",
  appointment_time: "2:30 PM",
  alt_date_1: "April 16, 2025",
  alt_time_1: "10:00 AM",
  alt_date_2: "April 17, 2025",
  alt_time_2: "3:15 PM",
};

// Function to create and start a new Ultravox call
// Note: This should be done server-side in any production deployment
async function createUltravoxCall(
  details: AppointmentDetails, 
  initialCallState: CallState
): Promise<string> {
  const response = await fetch("https://api.ultravox.ai/api/calls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Unsafe-API-Key": import.meta.env.VITE_ULTRAVOX_API_KEY,
    },
    body: JSON.stringify({
      systemPrompt: getSystemPrompt(details),
      voice: "Mark",
      firstSpeakerSettings: {
        user: {},
      },
      initialMessages: [
        {
          role: "MESSAGE_ROLE_USER",
          text: getInstructionsFromTemplate(
            getTemplate(initialCallState.currentState)({
              details,
              callData: initialCallState.callData,
              previousState: initialCallState.previousState
            })
          ),
        },
      ],
      selectedTools: [
        {
          toolName: "hangUp",
        },
        {
          temporaryTool: {
            modelToolName: "updateState",
            description: "Updates the current state and call data. Only use actions that are valid for the current state.",
            client: {},
            dynamicParameters: [
              {
                name: "action",
                location: "PARAMETER_LOCATION_BODY",
                schema: {
                  type: "string",
                  enum: Object.keys(ACTION_DESCRIPTIONS),
                  description: "The action to perform in the current state. IMPORTANT: Only use actions that are valid for the current state. For example, in 'reschedule_offering' state, you can only use 'new_date_confirmed' or 'cancel_appointment'.",
                },
              },
              {
                name: "additionalData",
                location: "PARAMETER_LOCATION_BODY",
                schema: {
                  type: "object",
                  description: "Additional data to update in the call state.",
                  additionalProperties: true
                },
              },
            ],
            defaultReaction: "AGENT_REACTION_SPEAKS_ONCE",
          },
        },
        {
          temporaryTool: {
            modelToolName: "checkDesiredDate",
            description:
              "Check if the desired date is available for an appointment.",
            client: {},
            dynamicParameters: [
              {
                name: "date",
                location: "PARAMETER_LOCATION_BODY",
                schema: {
                  type: "string",
                  format: "date-time",
                  description: "The ISO 8601 datetime to check.",
                },
              },
            ],
          },
        },
      ],
    }),
  });

  if (response.status >= 400) {
    throw new Error("Failed to create call: " + (await response.text()));
  }

  const { joinUrl } = await response.json();
  return joinUrl;
}
interface TextInputProps {
  onSubmit: (text: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState<string>("");
  const clearAndSubmit = () => {
    if (text) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="mx-auto my-8 w-3xl flex gap-2 p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
      <input
        className="flex-1 px-4 py-3 text-base border border-slate-300 rounded bg-white text-slate-700 transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        placeholder="Type your message here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && text && clearAndSubmit()}
      />
      <button 
        className={`px-6 py-3 bg-blue-500 text-white border-none rounded font-medium cursor-pointer transition-colors hover:bg-blue-600 ${!text && 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'}`}
        onClick={() => text && clearAndSubmit()}
        disabled={!text}
      >
        Send
      </button>
    </div>
  );
}

function App() {
  const [joinURL, setJoinURL] = useState<string | undefined>(undefined);
  const [isStartingCall, setIsStartingCall] = useState<boolean>(false);
  const { session, status, transcript } = useUltravoxSession(joinURL, false);
  const [callState, setCallState] = useState<CallState>(initializeStateMachine());
  const callStateRef = useRef<CallState>(callState);
  const [availableActions, setAvailableActions] = useState<string[]>(
    getAvailableActions(StateEnum.INITIAL)
  );

  // Update the ref whenever callState changes
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Reset state when call ends
  useEffect(() => {
    if (!joinURL) {
      setCallState(initializeStateMachine());
      setAvailableActions(getAvailableActions(StateEnum.INITIAL));
    }
  }, [joinURL]);

  useEffect(() => {
    // Register tool implementations
    session?.registerToolImplementation(
      "updateState",
      (params: { [key: string]: unknown }) => {
        if (!params.action || typeof params.action !== "string") {
          throw new Error("Invalid parameters: 'action' is required and must be a string.");
        }
        try {
          // Get the current state from the ref for the latest value
          const currentCallState = callStateRef.current;
          
          // Validate that the action is valid for the current state
          const validActions = getAvailableActions(currentCallState.currentState);
          if (!validActions.includes(params.action)) {
            return `Error: The action "${params.action}" is not valid in the current state "${currentCallState.currentState}". Valid actions are: ${validActions.join(", ")}`;
          }          
          
          // Apply the state transition
          const newCallState = transition(
            currentCallState.currentState, 
            params.action, 
            {
              ...currentCallState.callData,
              ...(params.additionalData || {})
            }
          );
          
          // Update the state
          setCallState(newCallState);
          
          // Update available actions
          const newAvailableActions = getAvailableActions(newCallState.currentState);
          setAvailableActions(newAvailableActions);
          
          // Get the template for the new state
          const templateText = getTemplate(newCallState.currentState)({
            details: appointmentDetails,
            callData: newCallState.callData,
            previousState: newCallState.previousState
          });
          
          // Return the instruction for the AI
          return getInstructionsFromTemplate(templateText);
        } catch (error) {
          console.error("Error updating state:", error);
          // Provide more helpful error message
          const currentCallState = callStateRef.current;
          const validActions = getAvailableActions(currentCallState.currentState);
          return `Error updating state. The action "${params.action}" is not valid in state "${currentCallState.currentState}". Valid actions are: ${validActions.join(", ")}`;
        }
      }
    );

    session?.registerToolImplementation(
      "checkDesiredDate",
      (params: Record<string, unknown>) => {
        return JSON.stringify(checkDateAvailability(params.date));
      }
    );
  }, [session]);

  // Function to start a new call
  const startNewCall = async () => {
    setIsStartingCall(true);
    try {
      // Initialize the state machine
      const initialState = initializeStateMachine();
      setCallState(initialState);
      setAvailableActions(getAvailableActions(StateEnum.INITIAL));
      
      // Create the call
      const joinUrl = await createUltravoxCall(appointmentDetails, initialState);
      setJoinURL(joinUrl);
    } catch (error) {
      console.error("Failed to start call:", error);
      alert(`Failed to start call: ${error}`);
    } finally {
      setIsStartingCall(false);
    }
  };

  // Function to perform a manual state transition (for UI buttons)
  const performAction = (action: string) => {
    if (session && availableActions.includes(action)) {
      try {
        // Update local state immediately for better UX
        const currentCallState = callStateRef.current;
        
        // Apply the state transition locally
        const newCallState = transition(
          currentCallState.currentState, 
          action,
          currentCallState.callData
        );
        
        // Update state
        setCallState(newCallState);
        setAvailableActions(getAvailableActions(newCallState.currentState));
        
        // Also send to the Ultravox session
        session.sendData({
          type: "input_text_message",
          text: JSON.stringify({ action }),
          defer_response: true,
        });
      } catch (error) {
        console.error("Error performing action:", error);
      }
    }
  };

  // Function to send a "wrap up" instruction
  const handleWrapUp = () => {
    if (session) {
      session.sendData({
        type: "input_text_message",
        text: "<instruction>This conversation has been going on for too long. Wrap it up.</instruction>",
        defer_response: true,
      });
    }
  };

  // Function to end the call
  const handleEndCall = () => {
    setJoinURL(undefined);
  };

  return (
    <div className="w-full mx-auto p-8 text-center">
      <AppHeader />
      <main className="flex flex-col gap-8">
        <div className="flex flex-row justify-between">
          {/* Call Controls Component */}
          <CallControls 
            session={session}
            status={status}
            isStartingCall={isStartingCall}
            onStartCall={startNewCall}
            onWrapUpCall={handleWrapUp}
            onEndCall={handleEndCall}
          />
          <CallStatus status={status} />
        </div>

        {/* State Machine Visualization Component */}
        <StateMachineVisualization 
          callState={callState}
          availableActions={availableActions}
          onActionClick={performAction}
        />

        {/* Text Input for active calls */}
        {session && status !== UltravoxSessionStatus.IDLE && status !== UltravoxSessionStatus.DISCONNECTED && (
          <TextInput
            onSubmit={(text) =>
              session &&
              session.sendData({
                type: "input_text_message",
                text,
              })
            }
          />
        )}
  
        {/* Transcript Display Component */}
        <TranscriptDisplay transcript={transcript} />

        {/* Debug Panel Component */}
        <DebugPanel callState={callState} visible={!!session} />
      </main>
    </div>
  );
}

export default App;