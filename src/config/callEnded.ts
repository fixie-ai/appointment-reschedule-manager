export default {
  name: "call_ended",
  description: "Call completed",
  
  template: `
    The call has ended.
    
    {{#if callData.rescheduled_date}}
      The appointment has been rescheduled for {{callData.rescheduled_date}} 
      at {{callData.rescheduled_time}}.
    {{else if previousState === "appointment_confirmed"}}
      The original appointment on {{details.appointment_date}} at {{details.appointment_time}} 
      is confirmed.
    {{else if previousState === "appointment_cancelled"}}
      The appointment has been cancelled.
    {{else}}
      Call ended without confirmation or rescheduling.
    {{/if}}
  `,
  
  // No actions for ending state
  actions: {}
};