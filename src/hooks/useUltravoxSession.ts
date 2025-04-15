import { useState, useEffect } from 'react';
import { UltravoxSession, UltravoxSessionStatus, Transcript } from 'ultravox-client';

/**
 * Custom hook to manage Ultravox session lifecycle and state
 * 
 * @param joinURL - URL to join the Ultravox call session
 * @param muted - Whether the microphone should be muted
 * @returns Object containing session, status, and transcript
 */
export function useUltravoxSession(joinURL: string | undefined, muted: boolean) {
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