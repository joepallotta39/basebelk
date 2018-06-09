const AWS = require('aws-sdk')
const path = require('path')

const esDomain = {
    region: process.env.AWSregion,
    endpoint: process.env.esEndpoint,
    index: process.env.esIndex,
    doctype: process.env.esDocType
};
const endpoint = new AWS.Endpoint(esDomain.endpoint)

const creds = new AWS.EnvironmentCredentials('AWS')

/*
 * Post the given document to Elasticsearch
 */
function postToES(doc, context) {

    let req = new AWS.HttpRequest(endpoint)

    req.method = 'POST'
    req.path = path.join('/', esDomain.index, esDomain.doctype)
    req.region = esDomain.region
    req.headers['Content-Type'] = 'application/json'
    req.headers['presigned-expires'] = false
    req.headers['Host'] = endpoint.host
    req.body = JSON.stringify(doc)

    let signer = new AWS.Signers.V4(req , 'es');  // es: service code
    signer.addAuthorization(creds, new Date());

    let send = new AWS.NodeHttpClient()
    send.handleRequest(req, null, function(httpResp) {
        let respBody = ''
        httpResp.on('data', function (chunk) {
            respBody += chunk
        });
        httpResp.on('end', function () {
            context.succeed('Lambda added document ' + doc)
        });
    }, function(err) {
        context.fail('Lambda failed with error ' + err)
    })
}


module.exports = {
    postToES
}