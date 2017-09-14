//
// Command: help
//
module.exports = function(controller) {

    controller.hears(["help", "who"], 'direct_message,direct_mention', function(bot, message) {
        var text = "My skills are:";
        text += "\n- " + bot.enrichCommand(message, "Free Now") + ": List conference rooms that are free right now";
        text += "\n- " + bot.enrichCommand(message, "Book Room") + ": Book the room I'm currently in";
        text += "\n\nI also understand:";
        text += "\n- " + bot.enrichCommand(message, "help") + ": spreads the message about my skills";
        bot.reply(message, text);
    });
}
