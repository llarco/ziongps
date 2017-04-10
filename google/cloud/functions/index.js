/**
 * Google Cloud Function used to read a Cloud Pub/Sub message and store it into
 * a ziongps datastore entity.
 *
 * @author Luis Larco <luis@luislarco.com>
 */
 
const ds = require('@google-cloud/datastore')();
var key = ds.key('ziongps');

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.subscribe = function subscribe(event, callback) {
  // The Cloud Pub/Sub Message object.
  const pubsubMessage = event.data;
  
  if (!pubsubMessage.data) {
    callback();
    return;
  }
  
  var entry = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString())
  
  var obj = {
    gc_pub_sub_id: pubsubMessage.id,
    device_id: pubsubMessage.attributes.device_id,
    event: pubsubMessage.attributes.event,
    lat: entry.lat,
    lon: entry.lon,
    age: entry.age,
    published_at: pubsubMessage.attributes.published_at
  }
  
  ds.save({
    key: key,
    data: obj
  }, function(err) {
    if(err) {
      console.log('There was an error storing the event: ' + obj, err);
    }
    console.log('zion stored: ' + obj)
  });
  
  // Don't forget to call the callback.
  callback();
};
