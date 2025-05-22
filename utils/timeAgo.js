// plugins/timeAgoPlugin.js
var { getRelativeTime } = require('../utils/dateFunctions');

function timeAgoPlugin(schema, options = {}) {
  var timeField = options.timeField || 'createdAt';
  var outputField = options.outputField || 'timeAgo';
  var nestedPaths = options.nestedPaths || [];

  function addTimeAgoTo(doc) {
    if (!doc || typeof doc !== 'object') return;

    // Add to top-level
    if (doc[timeField] && !doc[outputField]) {
      doc[outputField] = getRelativeTime(doc[timeField]);
      console.log(`✔ Added ${outputField} to main doc`);
    }

    // Add to nested paths (like comments)
    nestedPaths.forEach(path => {
      var nested = doc[path];
      if (Array.isArray(nested)) {
        nested.forEach(n => {
          if (n[timeField] && !n[outputField]) {
            n[outputField] = getRelativeTime(n[timeField]);
            console.log(`✔ Added ${outputField} to ${path} item`);
          }
        });
      } else if (nested && nested[timeField] && !nested[outputField]) {
        nested[outputField] = getRelativeTime(nested[timeField]);
        console.log(`✔ Added ${outputField} to ${path}`);
      }
    });
  }

  function middlewareHandler(result) {
    if (Array.isArray(result)) {
      result.forEach(addTimeAgoTo);
    } else {
      addTimeAgoTo(result);
    }
  }

  schema.post('find', middlewareHandler);
  schema.post('findOne', middlewareHandler);
  schema.post('findOneAndUpdate', middlewareHandler);
  schema.post('findById', middlewareHandler);
}

module.exports = timeAgoPlugin;
