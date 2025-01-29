const _ = require('lodash');
const queries = require('../database/queries.js');
const utils = require('./utils.js')

function createToDo(req, data) {
    const protocol = req.protocol,
        host = req.get('host'),
        id = data.id;

    return {
        title: data.title,
        order: data.order,
        completed: data.completed || false,
        url: `${protocol}://${host}/todo/${id}`
    };
}

async function getAllTodos(req, res) {
    const allEntries = await queries.all(utils.TableNames.TODOS);
    return res.send(allEntries.map(_.curry(createToDo)(req)));
}

async function getTodo(req, res) {
    const todo = await queries.get(utils.TableNames.TODOS, req.params.id);
    return res.send(todo);
}

async function postTodo(req, res) {
    const created = await queries.create(utils.TableNames.TODOS, { title: req.body.title, order: req.body.order, user_id: req.body.user, completed: req.body.completed });
    return res.send(createToDo(req, created));
}

async function patchTodo(req, res) {
    const patched = await queries.update(utils.TableNames.TODOS, req.params.id, { title: req.body.title, order: req.body.order, user_id: req.body.user, completed: req.body.completed });
    return res.send(createToDo(req, patched));
}

async function deleteAllTodos(req, res) {
    const deletedEntries = await queries.clear(utils.TableNames.TODOS);
    return res.send(deletedEntries.map(_.curry(createToDo)(req)));
}

async function deleteTodo(req, res) {
    const deleted = await queries.delete(utils.TableNames.TODOS, req.params.id);
    return res.send(createToDo(req, deleted));
}

const toExport = {
    getAll: { method: getAllTodos, errorMessage: "Could not fetch all todos" },
    get: { method: getTodo, errorMessage: "Could not fetch todo" },
    post: { method: postTodo, errorMessage: "Could not post todo" },
    patch: { method: patchTodo, errorMessage: "Could not patch todo" },
    deleteAll: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
    delete: { method: deleteTodo, errorMessage: "Could not delete todo" },
}

for (let route in toExport) {
    toExport[route] = utils.addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
