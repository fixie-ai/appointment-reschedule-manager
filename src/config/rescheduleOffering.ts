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
    
    After offering these alternatives, select "offer_alternatives".
    
    NOTE: The only valid action in this state is "offer_alternatives". 
    You cannot use "cannot_reschedule" or "can_reschedule" or "confirm_reschedule" directly from this state.
  `,
  
  actions: {
    "offer_alternatives": {
      description: "Offer alternative appointment times",
      nextState: "reschedule_checking"
    }
  }
};