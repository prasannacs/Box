// Imports the Google Cloud client library
const Request = require("request");
const BigQuery = require('@google-cloud/bigquery');

// Your Google Cloud Platform project ID
const projectId = 'sixth-hawk-194719';
const datesetId = 'box_events';
const table_eventsAdmin = 'events_admin';
const table_add_det = 'events_admin_additional_details';
const table_source = 'events_admin_source';
const table_parent = 'events_admin_source_parent';

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
    if(error)
       console.log(error);
    var entries = response.body.entries;
    console.log('response ====', entries[0]);
    var counter;
    for(counter=0; counter<entries.length; counter++)   {
        var event_admin_row = [{event_id: entries[counter].event_id, created_at: entries[counter].created_at, event_type: entries[counter].event_type, ip_address: entries[counter].ip_address, session_id: entries[counter].session_id}];
        console.log('event_admin_row -',event_admin_row);
        insertBigQuery(table_eventsAdmin, event_admin_row);
    }

}

function insertBigQuery(tableId, rows)   {
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .insert(rows)
    .then(() => {
      console.log(`Inserted ${rows.length} rows`);
    })
    .catch(err => {
      if (err && err.name === 'PartialFailureError') {
        if (err.errors && err.errors.length > 0) {
          console.log('Insert errors:');
          err.errors.forEach(err => console.error(err));
        }
      } else {
        console.error('ERROR:', err);
      }
    });
   
}
