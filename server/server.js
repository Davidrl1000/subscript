const app = require('./server-config.js');
const todoRoutes = require('./routes/todo.js')
const userRoutes = require('./routes/user.js')

const port = process.env.PORT || 5000;

// Todos
app.get('/todo', todoRoutes.getAll);
app.get('/todo/:id', todoRoutes.get);

app.post('/todo', todoRoutes.post);
app.patch('/todo/:id', todoRoutes.patch);

app.delete('/todo', todoRoutes.deleteAll);
app.delete('/todo/:id', todoRoutes.delete);

// Users
app.get('/users', userRoutes.getAll);
app.post('/user', userRoutes.post);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;