const Handlebars = require('handlebars');


Handlebars.registerHelper('getProperty', function(object, propertyName) {
    return object[propertyName];
});

module.exports = Handlebars;
