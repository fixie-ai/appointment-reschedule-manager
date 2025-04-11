import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Transcript, UltravoxSession, UltravoxSessionStatus, } from "ultravox-client";
import { checkDateAvailability } from "./date-checker";
import { STATES, getAvailableActions, initializeStateMachine, transition } from "./state/appointmentStateMachine";
import { getTemplate } from "./state/appointmentTemplates";
import { getSystemPrompt, getInstructionsFromTemplate } from "./state/appointmentSystemPrompt";
import { AppointmentDetails, CallState } from "./state/types";
import StateMachineVisualization from "./components/StateMachineVisualization";
import "./components/StateMachineVisualization.css";

function useUltravoxSession(joinURL: string | undefined, muted: boolean) {
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [status, setStatus] = useState<UltravoxSessionStatus>(
    UltravoxSessionStatus.IDLE
  );
  const [transcript, setTranscript] = useState<Transcript[]>([]);

  useEffect(() => {
    if (!joinURL) {
      return;
    }

    const session = new UltravoxSession();
    setSession(session);
    setTranscript([]);

    // Expose session status changes
    const handleStatusChange = () => {
      setStatus(session.status);
    };
    session.addEventListener("status", handleStatusChange);

    // Expose transcripts
    const handleTranscriptChange = () => {
      setTranscript(session.transcripts.slice());
    };
    session.addEventListener("transcripts", handleTranscriptChange);
    session.joinCall(joinURL, "uv_console");

    return () => {
      session.removeEventListener("status", handleStatusChange);
      session.removeEventListener("transcript", handleTranscriptChange);
      setStatus(UltravoxSessionStatus.IDLE);
      setSession(null);
      session.leaveCall();
    };
  }, [joinURL]);

  useEffect(() => {
    if (
      session &&
      status !== UltravoxSessionStatus.DISCONNECTED &&
      status !== UltravoxSessionStatus.CONNECTING
    ) {
      if (muted) {
        session.muteMic();
      } else {
        session.unmuteMic();
      }
    }
  }, [session, status, muted]);

  return { session, status, transcript };
}

// Sample appointment details - in a real app, this would come from a database or API
const appointmentDetails: AppointmentDetails = {
  client_name: "Steve Jackson",
  company_name: "Medical Depot",
  appointment_date: "April 15, 2025",
  appointment_time: "2:30 PM",
  alt_date_1: "April 16, 2025",
  alt_time_1: "10:00 AM",
  alt_date_2: "April 17, 2025",
  alt_time_2: "3:15 PM",
};

// Function to create and start a new Ultravox call
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
            description: "Updates the current state and call data",
            client: {},
            dynamicParameters: [
              {
                name: "action",
                location: "PARAMETER_LOCATION_BODY",
                schema: {
                  type: "string",
                  description: "The action to perform in the current state.",
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

function TextInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState<string>("");

  const clearAndSubmit = () => {
    if (text) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="text-input-container">
      <input
        className="text-input-field"
        placeholder="Type your message here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && text && clearAndSubmit()}
      />
      <button 
        className="text-input-button"
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
    getAvailableActions(STATES.INITIAL)
  );

  // Update the ref whenever callState changes
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Reset state when call ends
  useEffect(() => {
    if (!joinURL) {
      setCallState(initializeStateMachine());
      setAvailableActions(getAvailableActions(STATES.INITIAL));
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
          return "Error updating state. Please try a different action.";
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
      setAvailableActions(getAvailableActions(STATES.INITIAL));
      
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Appointment Confirmation Call</h1>
        <div className="call-status">
          {status && <span>Call Status: {status}</span>}
        </div>
      </header>

      <main className="app-main">
        {/* Call Controls */}
        {!session ||
        status === UltravoxSessionStatus.IDLE ||
        status === UltravoxSessionStatus.DISCONNECTED ? (
          <div className="call-controls">
            <button 
              onClick={startNewCall} 
              disabled={isStartingCall}
              className="start-call-btn"
            >
              {isStartingCall ? "Starting Call..." : "Start Call"}
            </button>
          </div>
        ) : (
          <div className="active-call-controls">
            <button onClick={handleWrapUp} className="wrap-up-btn">
              Wrap Up Call
            </button>
            <button onClick={() => setJoinURL(undefined)} className="end-call-btn">
              End Call
            </button>
          </div>
        )}

        {/* State Machine Visualization Component */}
        {session && (
          <StateMachineVisualization 
            callState={callState}
            availableActions={availableActions}
            onActionClick={performAction}
          />
        )}
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

        {/* Transcript Display */}
        <div className="transcript-container">
          <h2>Conversation Transcript</h2>
          <div className="transcript-messages">
            {transcript.map((t, i) => (
              <div
                key={i}
                className={`transcript-message ${t.speaker === "You" ? "user-message" : "ai-message"}`}
              >
                <strong>{t.speaker}:</strong> {t.text}
              </div>
            ))}
            {transcript.length === 0 && (
              <div className="no-transcript">
                No conversation yet. Start a call to begin.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Debug panel */}
      {session && (
        <div className="debug-panel">
          <h3>Debug Data</h3>
          <details>
            <summary>Call Data</summary>
            <pre>
              {JSON.stringify(callState.callData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default App;