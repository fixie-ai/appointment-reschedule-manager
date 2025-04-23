export default {
  name: "reschedule_checking",
  description: "Confirming if any of the alternative times work for the client",
  
  template: `
    Find out if {{details.client_name}} can make any of the alternative appointment times.
    
    If they say they can make one of the alternative times, collect their preferred 
    date and time, and select "can_reschedule".
    
    If they say they cannot make any of the alternative times, 
    select "cannot_reschedule".
  `,
  
  actions: {
    "can_reschedule": {
      description: "The client can make one of the alternative times",
      nextState: "reschedule_confirmed"
    },
    "cannot_reschedule": {
      description: "The client cannot make any of the alternative times",
      nextState: "appointment_cancelled"
    }
  }
};