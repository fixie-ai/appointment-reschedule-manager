export default {
  name: "identity_checking",
  description: "Verifying the identity of the person answering the call",
  
  template: `
    You have just made an outbound phone call. Say something like:
    "Hi, I am a virtual assistant calling from {{details.company_name}}. Is {{details.client_name}} available?"
    
    If they aren't {{details.client_name}} and don't 
    know who {{details.client_name}} is, apologize for the confusion, 
    thank them for their time, and select "wrong_number".
    
    If they say they are {{details.client_name}}, select "confirm_identity".
  `,
  
  actions: {
    "confirm_identity": {
      description: "Confirm you're speaking with the client",
      nextState: "attendance_checking"
    },
    "wrong_number": {
      description: "The person is not the client and doesn't know them",
      nextState: "call_ended"
    }
  }
};