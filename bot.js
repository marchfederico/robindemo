// Copyright (c) 2017 Altus Consulting
// Licensed under the MIT License

// Portions of this code are licensed and copyright as follows:
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License


// Load env variables
var env = require('node-env-file');
var storage = require('./lib/storage.js');


//
// BotKit initialization
//

var Botkit = require('botkit');

if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as bots require a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line or to the .env file");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX node bot.js");
    process.exit(1);
}

var SparkWebSocket = require('ciscospark-websocket-events')

var accessToken = process.env.SPARK_TOKEN
var PORT = process.env.PORT || 3000

var webHookUrl =  "http://localhost:"+PORT+"/ciscospark/receive"

sparkwebsocket = new SparkWebSocket(accessToken)
sparkwebsocket.connect(function(err,res){
   if (!err) {
         if(webHookUrl)
             sparkwebsocket.setWebHookURL(webHookUrl)
   }
   else {
        console.log("Error starting up websocket: "+err)
   }
})



var env = process.env.NODE_ENV || "development";

var controller = Botkit.sparkbot({
    debug: true,
    log: true,
    public_address: "https://localhost",
    ciscospark_access_token: process.env.SPARK_TOKEN
});


var bot = controller.spawn({});

// Load BotCommons properties
bot.commons = {};
bot.commons["healthcheck"] = process.env.PUBLIC_URL + "/ping";
bot.commons["up-since"] = new Date(Date.now()).toGMTString();
bot.commons["version"] = "v" + require("./package.json").version;
bot.commons["owner"] = process.env.owner;
bot.commons["support"] = process.env.support;
bot.commons["platform"] = process.env.platform;
bot.commons["nickname"] = process.env.BOT_NICKNAME || "Robin";
bot.commons["code"] = process.env.code;

// Function to emulate Python's .format syntax. In the future will
// be moved to a separate file
String.prototype.format = function() {
    var i = 0,
        args = arguments;
    return this.replace(/{}/g, function() {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

// add the Robin controller
//
require("./lib/videoEndpointController.js")(controller);
require("./lib/robinController.js")(controller);
require("./lib/conversationsController.js")(controller,bot);

// Start Endpoint controller
controller.initEndpoint({username:"remotesupport",password:"N+ERaSllTY",ip:"192.168.1.30", port:3001})

controller.setEndpointStatusCallback(function(event){
  console.log("Got an event")
  if(event && event.spark  && event.spark.paireddevice)
  {
    if(event.spark.paireddevice.name)
    {
      console.log(event.spark.paireddevice.name + " Just entered the Office")
      //lookup Office
      params={}
      params.userid  = event.spark.paireddevice.userid
      params.location = "Seattle"
      params.room = "Office"
      controller.checkLocation(params)
    }
    else
    {
      console.log("No one is here....")
    }

  }
  else if (event.roomanalytics)
  {
    if(event.roomanalytics.peoplepresence == "Yes")
    {
        console.log("Someone just entered the room")
    }
    else {
      console.log("I see that...No one is here....")
    }
  }
})

controller.getPairedDevices()
  .then(function(res){
    console.log("Paired Devices:")
    console.dir(res,null,3)
  })
// Start Bot API
controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {

    webserver.post('/ciscospark/receive', function(req, res) {
          res.sendStatus(200)
          controller.handleWebhookPayload(req, res, bot);
    });
    // installing Healthcheck
    webserver.get('/ping', function(req, res) {
        res.json(bot.commons);
    });

    webserver.post('/presence', function(req, res) {
          res.sendStatus(200)
          params =  req.body
          controller.checkLocation(params)
    });
    console.log("Cisco Spark: healthcheck available at: " + bot.commons.healthcheck);
});

// Load skills
var normalizedPath = require("path").join(__dirname, "lib/skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
    try {
        require("./lib/skills/" + file)(controller);
        console.log("Cisco Spark: loaded skill: " + file);
    } catch (err) {
        if (err.code == "MODULE_NOT_FOUND") {
            if (file != "utils") {
                console.log("Cisco Spark: could not load skill: " + file);
            }
        }
    }
});

// Utility to add mentions if Bot is in a 'Group' space
bot.enrichCommand = function(message, command) {
    var botName = process.env.BOT_NICKNAME || "BotName";
    if ("group" == message.roomType) {
        return "`@" + botName + " " + command + "`";
    }
    if (message.original_message) {
        if ("group" == message.original_message.roomType) {
            return "`@" + botName + " " + command + "`";
        }
    }


    return "`" + command + "`";
}
