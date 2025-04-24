export default {
  name: "initial",
  description: "Preparing to start the call",
  
  template: `
    Preparing to make an outbound call to {{details.client_name}} 
    regarding the appointment on {{details.appointment_date}} 
    at {{details.appointment_time}}.
    
    To start the call, select "start_call".
  `,
  
  actions: {
    "start_call": {
      description: "Initiate the outbound call",
      nextState: "identity_checking"
    }
  }
};