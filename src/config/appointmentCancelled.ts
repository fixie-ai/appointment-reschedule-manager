export default {
  name: "appointment_cancelled",
  description: "Appointment cancelled",
  
  template: `
    Let them know you'll cancel the current appointment by saying something like:
    "I understand. I'll cancel the appointment for now. 
    Please feel free to reach out to us in the future when you'd like to reschedule. 
    Thank you for letting us know, and we hope to see you soon!"
    
    Select "end_call" to end the call.
  `,
  
  actions: {
    "end_call": {
      description: "End the call",
      nextState: "call_ended"
    }
  }
};