// Imports the Google Cloud client library
const Request = require("request");
const BigQuery = require('@google-cloud/bigquery');

// Your Google Cloud Platform project ID
const projectId = 'sixth-hawk-194719';
const datesetId = 'box_events';
const table_eventsAdmin = 'events_admin';
const table_eventsAdmin_createdBy = 'events_admin_created_by';
const table_add_det = 'events_admin_additional_details';
const table_source = 'events_admin_source';
const table_parent = 'events_admin_source_parent';
var access_token;
var eid;
var event_type;

// Creates a client
const bigquery = new BigQuery({
    projectId: projectId,
});

module.exports = {
    callEventsAPI: function(accessToken, EID, type) {
        access_token = accessToken;
        eid = EID;
        event_type = type;
        Request(getEventURL(), callback);

    }

}

function getEventURL(stream_position)  {
    var eventURL = 'https://api.box.com/2.0/events';
    if( event_type == 'Enterprise')
        eventURL = eventURL + '?stream_type=admin_logs&limit=500';
    if(typeof stream_position != 'undefined') {
        eventURL = eventURL + '&stream_position=' + stream_position;
    }
    console.log('access_token == -- ',access_token, eventURL);
       var options = {
            method: 'GET',
            url: eventURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        }
    return options;
}

function getBQDate(date)    {
         var bq_date = BigQuery.datetime({
         year: date.getFullYear(),
          month: date.getMonth()+1,
          day: date.getDate()+1,
          hours: date.getHours(),
          minutes: date.getMinutes(),
          seconds: date.getSeconds()
         });
    return bq_date;
}

function callback(error, response, body) {
    if(error)
       console.log(error);
    var res = JSON.parse(response.body);
    var next_stream_position = res.next_stream_position;
    console.log('next_stream_position -- ',next_stream_position);
    var entries = res.entries;
    //console.log('response ====', entries);
    var counter;
    var event_admin_rows = [];
    var event_admin_created_by_rows = [];
    var source_rows = [];
    var parent_rows = [];
    var add_det_rows = [];
    
    for(counter=0; counter<entries.length; counter++)   {
        var created_date = new Date(entries[counter].created_at);
         var bq_created_date = getBQDate(created_date);
        var event_admin_row = {event_id: entries[counter].event_id, created_at: bq_created_date, event_type: entries[counter].event_type, ip_address: entries[counter].ip_address, session_id: entries[counter].session_id, inserted_at: getBQDate(new Date()), eid: eid};
        event_admin_rows.push(event_admin_row);
        console.log('event_admin_row -',event_admin_row);
        
        var created_by = entries[counter].created_by;
        var event_admin_created_by_row = {event_id: entries[counter].event_id, type: created_by.type, id: created_by.id, name: created_by.name, login: created_by.login, eid: eid};
    //    console.log('event_admin_created_by_row -',event_admin_created_by_row);
        event_admin_created_by_rows.push(event_admin_created_by_row);

        var source = entries[counter].source;
        if( source != null )    {
            var source_row = {event_id: entries[counter].event_id, item_type: source.item_type, item_id: source.item_id, item_name: source.item_name, eid: eid};
      //      source_rows.push(source_row);
            console.log('source_row -',source_row);
            
            var parent = source.parent;
            if(parent != null)     {
                var parent_row = {source_item_id: source.item_id, type: parent.type, name: parent.name, id: parent.id, eid : eid};
               parent_rows.push(parent_row);
         //       console.log('parent_row -',parent_row);
            }

        }
        
        var add_det = entries[counter].addtional_details;
        if(add_det != null)     {
            var add_det_row = [{event_id: entries[counter].event_id, version_id: add_det.version_id, size: add_det.size, eid : eid}];
       //     console.log('add_det_row -',add_det_row);
           add_det_rows.push(add_det_row);
        }

    }
    if( event_admin_rows.length > 0 )
        insertBigQuery(table_eventsAdmin, event_admin_rows);
    if( event_admin_created_by_rows.length > 0 )
        insertBigQuery(table_eventsAdmin_createdBy, event_admin_created_by_rows);
    if( source_rows.length > 0 )
        insertBigQuery(table_source, source_rows);
    if( parent_rows.length > 0 )
       insertBigQuery(table_parent, parent_rows);
    if( add_det_rows.length > 0 )
        insertBigQuery(table_add_det, add_det_rows);
    
    if (typeof next_stream_position != 'undefined') {
        Request(getEventURL(next_stream_position), callback);
    }
}

function insertBigQuery(tableId, rows)   {
  bigquery
    .dataset('box_events')
    .table(tableId)
    .insert(rows)
    .then(() => {
      console.log(`Inserted ${rows.length} rows `,tableId);
    })
    .catch(err => {
      if (err && err.name === 'PartialFailureError') {
        if (err.errors && err.errors.length > 0) {
          console.log('Insert errors:');
          err.errors.forEach(err => console.error('~~~~Error~~~',err));
        }
      } else {
        console.error(tableId, '===> ERROR:', err);
      }
    });
       console.log('############ BQ insert #############',tableId, rows.length);
}
