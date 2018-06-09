const baseball = require('./baseball')

/* Lambda "main": Execution begins here */
exports.handler = function(event, context, callback) {
    try {
        baseball.getData(context)
    } catch (err) {
        callback(err)

    }    
}


