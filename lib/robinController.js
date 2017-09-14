var Robin = require('robin-js-sdk')
var moment = require('moment')
module.exports = function (controller) {

    controller.robin = new Robin(process.env.ROBIN_TOKEN);
    var request = require("request")
    controller.robin.api.free_busy = function(qs, callback) {
         var now = moment();
         var now1h = moment().add(1,'h')
          qs.after = now.format();
          qs.before = now1h.format()

          console.log(JSON.stringify(qs,null,2))
          request(
              {
                  method: 'GET'
                  , headers: {'content-type': 'application/json;charset=UTF-8', 'Authorization':'Access-Token '+process.env.ROBIN_TOKEN}
                  , uri: 'https://api.robinpowered.com/v1.0/free-busy/spaces'
                  , qs : qs ? qs : {}

              }
              , function (error, response, body) {
                  if(error) {
                      callback(error)
                  }
                  else if (response.statusCode == 200) {
                      try {
                          callback(null,JSON.parse(body))
                      }
                      catch (e)
                      {
                          callback(e)
                      }
                  } else {
                      try {
                          console.log('Response statusCode for get is: '+response.statusCode)
                          console.log('Raw response body is: '+response.body)
                          callback(JSON.parse(body))
                      }
                      catch(e)
                      {
                          callback(e)
                      }
                  }

              }
          )
    }
}
