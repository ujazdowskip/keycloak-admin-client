'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  call
};

/**
  A function to get all the clients or a specific client for a realm
  @param {string} realmName - The name of the realm(not the realmID) to use - ex: master
  @param {object} [options] - The options object
  @param {string} [options.id] - The id of the client(not the client-id), this will override any query param options used
  @param {string} [options.clientId] - the querystring param to search based on clientId
  @returns {Promise} A promise that will resolve with the Array of clients or just 1 client if the id option is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.find(realmName)
        .then((clients) => {
        console.log(clients) // [{...},{...}, ...]
      });
    });
 */
 function call (client) {
   return function call (apiCall) {
     return new Promise((resolve, reject) => {

       let req = {
         url: `${client.baseUrl}` + apiCall.path || '',
         auth: { bearer: privates.get(client).accessToken },
         json: apiCall.json,
         method: apiCall.method || 'GET',
         body: apiCall.body
       };

       request(req, (err, resp, body) => {
         if (err) {
           return reject(err);
         }

         // Check that the status cod
         if (resp.statusCode !== 200) {
           return reject(body);
         }

         return resolve(body);
       });
     });
   };
 }
