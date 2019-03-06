const ds = require('@google-cloud/datastore')();

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

  var decodedMessage = Buffer.from(pubsubMessage.data, 'base64').toString();
  if (decodedMessage == 'test-event') {
    callback();
    return;
  }

  var entry;
  try {
    entry = JSON.parse(decodedMessage);
  } catch (e) {
    console.log('Unable to parse JSON');
    console.log('data = ' + pubsubMessage.data);
    console.log('decodedMessage = ' + decodedMessage);
    throw e;
  }

  var date;
  try {
    date = new Date(pubsubMessage.attributes.published_at);
  } catch (e) {
    console.log('Unable to build Date');
    console.log('published_at = ' + pubsubMessage.attributes.published_at);
   	throw e;
  }

  var obj = {
    gc_pub_sub_id: pubsubMessage.id,
    device_id: pubsubMessage.attributes.device_id,
    event: pubsubMessage.attributes.event,
    lat: entry.lat,
    lon: entry.lon,
    age: entry.age,
    published_at: date
  };

  var key = ds.key(['ziongps', obj.published_at]);

  ds.save({
    key: key,
    data: obj
  }, function(err) {
    if(err) {
      console.log('There was an error storing the event: ' + obj, err);
    } else {
      console.log('zion stored: ' + JSON.stringify(obj));
    }
  });

  // Don't forget to call the callback.
  callback();
};
