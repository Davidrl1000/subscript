const _ = require('lodash');
const queries = require('./database/queries.js');

function createToDo(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: `${protocol}://${host}/${id}`
  };
}

function createUser(req, data) {

  return {
    id: data.id,
    name: data.name,
    email: data.email,
  };
}

const TableNames = {
  TODOS: 'todos',
  USERS: 'users',
}

async function getAllTodos(req, res) {
  const allEntries = await queries.all(TableNames.TODOS);
  return res.send(allEntries.map( _.curry(createToDo)(req) ));
}

async function getTodo(req, res) {
  const todo = await queries.get(TableNames.TODOS, req.params.id);
  return res.send(todo);
}

async function postTodo(req, res) {
  const created = await queries.create(TableNames.TODOS, {title: req.body.title, order: req.body.order, user_id: req.body.user});
  return res.send(createToDo(req, created));
}

async function patchTodo(req, res) {
  const patched = await queries.update(TableNames.TODOS, req.params.id, {title: req.body.title, order: req.body.order, user_id: req.body.user});
  return res.send(createToDo(req, patched));
}

async function deleteAllTodos(req, res) {
  const deletedEntries = await queries.clear(TableNames.TODOS);
  return res.send(deletedEntries.map( _.curry(createToDo)(req) ));
}

async function deleteTodo(req, res) {
  const deleted = await queries.delete(TableNames.TODOS, req.params.id);
  return res.send(createToDo(req, deleted));
}

async function postUser(req, res) {
  const created = await queries.create(TableNames.USERS, {name: req.body.name, email: req.body.email});
  return res.send(createToDo(req, created));
}

async function getAllUsers(req, res) {
  const allEntries = await queries.all(TableNames.USERS);
  return res.send(allEntries.map( _.curry(createUser)(req) ));
}

function addErrorReporting(func, message) {
    return async function(req, res) {
        try {
            return await func(req, res);
        } catch(err) {
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
        } 
    }
}

const toExport = {
  // todos
    getAllTodos: { method: getAllTodos, errorMessage: "Could not fetch all todos" },
    getTodo: { method: getTodo, errorMessage: "Could not fetch todo" },
    postTodo: { method: postTodo, errorMessage: "Could not post todo" },
    patchTodo: { method: patchTodo, errorMessage: "Could not patch todo" },
    deleteAllTodos: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
    deleteTodo: { method: deleteTodo, errorMessage: "Could not delete todo" },
    // Users
    postUser: { method: postUser, errorMessage: "Could not post user" },
    getAllUsers: { method: getAllUsers, errorMessage: "Could not fetch all users" },
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
