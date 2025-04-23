export default {
  name: "reschedule_confirmed",
  description: "Appointment rescheduled for a new time",
  
  template: `
    Confirm their selection by saying something like:
    "Great! I've rescheduled your appointment for 
    {{callData.rescheduled_date}} at {{callData.rescheduled_time}}. 
    We look forward to seeing you then, {{details.client_first}}. 
    Is there anything else I can help you with today?"
    
    Address any additional questions they might have, then thank them for their time
    and select "end_call".
  `,
  
  actions: {
    "end_call": {
      description: "End the call",
      nextState: "call_ended"
    }
  }
};