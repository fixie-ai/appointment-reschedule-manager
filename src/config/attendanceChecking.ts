export default {
  name: "attendance_checking",
  description: "Confirming if the client can attend the scheduled appointment",
  
  template: `
    Say something like: "Hi {{details.client_first}}, I'm calling to confirm your upcoming appointment 
    scheduled for {{details.appointment_date}} at {{details.appointment_time}}.
    Is that still going to work for you?"
    
    If they confirm they can attend, express that you're looking forward to 
    seeing them. Say something like:
    "Great! We're looking forward to seeing you on 
    {{details.appointment_date}} at {{details.appointment_time}}. Have a wonderful day!"
    
    Then select "can_attend".
    
    If they say they cannot attend, select "cannot_attend".
  `,
  
  actions: {
    "can_attend": {
      description: "The client can attend the scheduled appointment",
      nextState: "appointment_confirmed"
    },
    "cannot_attend": {
      description: "The client cannot attend the scheduled appointment",
      nextState: "reschedule_offering"
    }
  }
};