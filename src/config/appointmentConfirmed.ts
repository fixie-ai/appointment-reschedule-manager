export default {
  name: "appointment_confirmed",
  description: "Appointment confirmed for the original time",
  
  template: `
    We're all set! You are confirmed for your appointment on 
    {{details.appointment_date}} at {{details.appointment_time}}.
    
    Thank them for their time and select "end_call" to end the call.
  `,
  
  actions: {
    "end_call": {
      description: "End the call",
      nextState: "call_ended"
    }
  }
};