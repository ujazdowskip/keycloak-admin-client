'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove,
  addRole: addRole
};

/**
  A function to get the list of users or a user for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} [options] - The options object
  @param {string} [options.userId] - use this options to get a user by an id. If this value is populated, it overrides the querystring param options
  @param {string} [options.username] - the querystring param to search based on username
  @param {string} [options.firstName] - the querystring param to search based on firstName
  @param {string} [options.lastName] - the querystring param to search based on lastName
  @param {string} [options.email] - the querystring param to search based on email
  @returns {Promise} A promise that will resolve with an Array of user objects or just the 1 user object if userId is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.find(realmName)
        .then((userList) => {
        console.log(userList) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realm, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      let req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.userId) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/users/${options.userId}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/users`;
        req.qs = options;
      }

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to create a new user for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} user - The JSON representation of a user - http://keycloak.github.io/docs/rest-api/index.html#_userrepresentation - username must be unique
  @returns {Promise} A promise that will resolve with the user object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.create(realmName, user)
        .then((createdUser) => {
        console.log(createdUser) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, user) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: user,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // But since we don't know the userId, we need to search based on the username, since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.users.find(realm, {username: user.username})
          .then((user) => {
            return user[0];
          }));
      });
    });
  };
}

/**
  A function to update a user for a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {object} user - The JSON representation of the fields to update for the user - This must include the user.id field.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.update(realmName, user)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (client) {
  return function update (realmName, user) {
    return new Promise((resolve, reject) => {
      user = user || {};
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${user.id}`,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'PUT',
        body: user
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to delete a user in a realm
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @param {string} userId - The id of the user to delete
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.remove(realmName, userId)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, userId) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${userId}`,
        auth: { bearer: privates.get(client).accessToken },
        method: 'DELETE'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status code is a 204
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

function addRole (client) {
  return function addRole (realmName, opts/*, userId, clientId, mappings*/) {
    return new Promise((resolve, reject) => {

      const userId = opts.userId
      const clientId = opts.clientId
      const roles = opts.roles || []

      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${userId}/role-mappings/clients/${clientId}`,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'POST',
        body: roles
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}
