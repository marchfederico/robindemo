var Robin = require('robin-js-sdk')
var moment = require('moment')
module.exports = function (controller,bot) {

    controller.checkLocation = function(params)
    {
       controller.thisbot = bot
       if (!params || !params.userid || !params.location || !params.room)
          return

       controller.api.people.get(params.userid)
       .then(function(person) {

           console.log(JSON.stringify(person,null,2))
           controller.thisbot.startPrivateConversation({user: person.emails[0]}, function(err,convo) {
           convo.addQuestion('Hi there!  I noticed you are at '+params.location+' in the room called: '+params.room+'.  Would you like to book it for an hour?',[
             {
               pattern: controller.thisbot.utterances.yes,
               callback: function(response,convo) {
                 convo.say('Great booking the room now.');

                 convo.next();
               }
             },
             {
               pattern: controller.thisbot.utterances.no,
               callback: function(response,convo) {
                 convo.say('Ok but be aware that someone else may book this room....');
                 // do something else...
                 convo.next();

               }
             },
             {
               default: true,
               callback: function(response,convo) {
                 // just repeat the question
                   convo.say('Ok I won\'t book the room.');
               }
             }
           ],{},'default');

         })
       })
    }
}
