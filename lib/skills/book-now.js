//
// Command: book now
//
module.exports = function(controller) {

    controller.hears(["book now"], 'direct_message,direct_mention', function(bot, message) {



 bot.startConversation(message,function(err,convo) {
  convo.addQuestion('What location do you want to book a room in?',[
    {
      pattern: 'seattle',
      callback: function(response,convo) {
        convo.say('OK looking for rooms in Seattle');
        params = {
          location_ids: "7178",
          before:"2017-08-09T21:15:00Z",
          after: "2017-08-09T19:15:00Z"

        }
        controller.robin.api.free_busy(params, function(err,result){
          if (!err)
          {
            console.log(JSON.stringify(result,null,2))
          }
          else {
            console.dir(err)
          }
        })
        convo.next();
      }
    },
    {
      pattern: 'vegas',
      callback: function(response,convo) {
        convo.say('Ok looking for rooms in Las Vegas.');
        // do something else...
        convo.next();

      }
    },
    {
      default: true,
      callback: function(response,convo) {
        // just repeat the question
          convo.say('Room Booked thanks.');
      }
    }
  ],{},'default');
  convo.addMessage("Thanks!",'default')

})

});


}
