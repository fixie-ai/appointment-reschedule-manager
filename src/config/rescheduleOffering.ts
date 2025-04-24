export default {
  name: "reschedule_offering",
  description: "Offering alternative appointment times",
  
  template: `
    Say something like:
    "I'm sorry to hear that. We do have a couple of alternative times available. 
    Would any of these work better for you?"
    
    Offer the following alternative times:
    - {{details.alt_date_1}} at {{details.alt_time_1}}
    - {{details.alt_date_2}} at {{details.alt_time_2}}

    If they say they can make one of the alternative times, select "new_date_confirmed".

    If they cannot make either of the alternative times, select "cancel_appointment".
  `,
  
  actions: {
    "new_date_confirmed": {
      description: "Confirm new appointment date",
      nextState: "reschedule_confirmed"
    },
    "cancel_appointment": {
      description: "Cancel the appointment",
      nextState: "appointment_cancelled"
    }
  }
};