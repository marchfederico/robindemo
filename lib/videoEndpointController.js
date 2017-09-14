var CEScript = require('ce_script')

module.exports = function (controller) {

    controller.initEndpoint = function(params)
    {
        controller.script = new CEScript(params.port)
        controller.script.addHTTPFeedbackSlot("/Status/RoomAnalytics")
        controller.script.addHTTPFeedbackSlot("/Status/Spark/PairedDevice")

        controller.script.connect(params.ip,params.username,params.password)
    }

    controller.getPairedDevices = function()
    {
        return controller.script.getPairedDevices(controller.script.ce_endpoints[0])

    }

    controller.setEndpointStatusCallback =function(callback)
    {
        controller.script.callback = callback
        controller.script.on('Status', function(event){
            //  console.log("STATUS --->\n")
            //  console.log(JSON.stringify(event,null,2))
              controller.script.callback(event)
        })
    }
}
