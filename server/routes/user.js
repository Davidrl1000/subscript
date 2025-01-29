const _ = require('lodash');
const queries = require('../database/queries.js');

const utils = require('./utils.js')

function createUser(req, data) {
    return {
        id: data.id,
        name: data.name,
        email: data.email,
    };
}

async function postUser(req, res) {
    const created = await queries.create(utils.TableNames.USERS, { name: req.body.name, email: req.body.email });
    return res.send(createToDo(req, created));
}

async function getAllUsers(req, res) {
    const allEntries = await queries.all(utils.TableNames.USERS);
    return res.send(allEntries.map(_.curry(createUser)(req)));
}


const toExport = {
    post: { method: postUser, errorMessage: "Could not post user" },
    getAll: { method: getAllUsers, errorMessage: "Could not fetch all users" },
}

for (let route in toExport) {
    toExport[route] = utils.addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
