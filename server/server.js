const app = require('./server-config.js');
const routes = require('./server-routes.js');

const port = process.env.PORT || 5000;

// Todos
app.get('/todo/', routes.getAllTodos);
app.get('/todo/:id', routes.getTodo);

app.post('/todo/', routes.postTodo);
app.patch('/todo/:id', routes.patchTodo);

app.delete('/todo/', routes.deleteAllTodos);
app.delete('/todo/:id', routes.deleteTodo);

// Users
app.get('/users', routes.getAllUsers);
app.post('/user', routes.postUser);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;