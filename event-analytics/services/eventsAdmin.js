// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const Request = require("request");

// Your Google Cloud Platform project ID
const projectId = 'sixth-hawk-194719';

// Creates a client
const bigquery = new BigQuery({
    projectId: projectId,
});

module.exports = {
    callEventsAPI: function(accessToken) {
        var eventURL = 'https://api.box.com/2.0/events?stream_type=admin_logs';

        var options = {
            method: 'GET',
            url: eventURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        Request(options, callback);

    }

}

function callback(error, response, body) {
    console.log('response ', response);

}
