import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

const host = 'http://localhost:5000/';

class App extends Component {
  state = {
    method: 'GET',
    lastRequest: '',

    id: '',
    title: '',
    order: '',
    completed: false,
    assignedUser: 'unsassign',
    user: {
      name: '',
      email: ''
    },
    allUsers: [],
    response: [],
  };

  handleSubmitTodo = async e => {
    e.preventDefault();
    let { method, id, title, order, completed, assignedUser } = this.state;

    console.log(assignedUser)

    let request = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Undefined ensures not changing to empty string.
    title = title ? title : undefined;
    order = order ? Number(order) : undefined;
    const user = assignedUser === 'unsassign' ? null : Number(assignedUser);


    if (method !== "GET")
      request.body = JSON.stringify({ title, order, completed, user })

    this.setState({ lastRequest: `${method} at /${id}` });
    // Code smells, but the setup of todo-backend with get('/') returning a list of todos requires
    // that we directly hit localhost instead of being able to rely on the proxy.
    // We can only proxy non-root gets.
    let response;
    if (process.env.NODE_ENV === "development" && method === "GET" && id === '') {
      response = await fetch(host + 'todo', request);
    } else {
      response = await fetch(`/todo/${id}`, request);
    }

    const contentType = response.headers.get('content-type');

    let body;
    if (contentType && contentType.includes('application/json')) {
      body = await response.json();
    } else if (contentType && contentType.includes('text/html')) {
      body = await response.text();
    }

    if (response.status !== 200) {
      console.log(body);
      this.setState({ response: [{ status: response.status, message: body }] });
      return;
    }

    // Ensures formart of [{}, {}, {}]
    if (!Array.isArray(body))
      body = Array(body);

    this.setState({ response: body });
  };

  async getAllUsers() {
    let request = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await fetch(host + 'users', request);

    const contentType = response.headers.get('content-type');

    let body;
    if (contentType && contentType.includes('application/json')) {
      body = await response.json();
    } else if (contentType && contentType.includes('text/html')) {
      body = await response.text();
    }

    this.setState({ allUsers: body });
  }

  handleSubmitUser = async e => {
    e.preventDefault();
    let { user } = this.state;

    let request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (!user.name || !user.email) {
      console.error('There is an error with the data.')
      return;
    }

    request.body = JSON.stringify({ name: user.name, email: user.email })

    await fetch(host + 'user', request)

    await this.getAllUsers();
  };

  changeMethod = event => {
    this.setState({ method: event.target.value });
  };

  changeUser = event => {
    this.setState({ assignedUser: event.target.value });
  };

  render() {
    const { method, lastRequest, id, title, order, completed, response } = this.state;

    const shouldDisplayIdInput = method !== "POST";
    const shouldDisplayTitleInput = method === "POST" || method === "PATCH";
    const shouldDisplayOrderInput = method === "POST" || method === "PATCH";
    const shouldDisplayCompletedInput = method === "PATCH";

    if (!this.state.allUsers.length)
      this.getAllUsers();

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Powered by React
          </p>
        </header>

        <form onSubmit={this.handleSubmitTodo}>
          <p>
            <h3>Send to Server:</h3>
          </p>
          <select value={method} onChange={this.changeMethod}>
            <option value="GET">Get</option>
            <option value="POST">Post</option>
            <option value="PATCH">Patch</option>
            <option value="DELETE">Delete</option>
          </select>
          <input
            disabled={!shouldDisplayIdInput}
            type="text"
            placeholder="id (int)"
            value={id}
            onChange={e => this.setState({ id: e.target.value })}
          />
          <input
            disabled={!shouldDisplayTitleInput}
            type="text"
            placeholder="title (string)"
            value={title}
            onChange={e => this.setState({ title: e.target.value })}
          />
          <input
            disabled={!shouldDisplayOrderInput}
            type="text"
            placeholder="order (int)"
            value={order}
            onChange={e => this.setState({ order: e.target.value })}
          />

          <select value={this.state.assignedUser ?? "unsassign"} onChange={this.changeUser}>
            <option value="unsassign">Unsassign</option>
            {this.state.allUsers.map(u => <option key={u.email} value={u.id}>{u.name}</option>)}
          </select>

          <label>
            Completed?
            <input
              display="inline-block"
              disabled={!shouldDisplayCompletedInput}
              type="checkbox"
              value={completed}
              onChange={e => this.setState({ completed: e.target.checked })}
            />
          </label>

          <button type="submit">Submit</button>
        </form>
        <h3>{`Last sent: ${lastRequest}`}</h3>
        <p>
          {
            response.map((todo, i) => {
              return (
                <li key={i}>
                  {
                    todo ? Object.entries(todo).map(([key, value]) => {
                      return `${key}: ${value}   `
                    }) : undefined
                  }
                </li>
              )
            })
          }
        </p>
        <div>
          <form onSubmit={this.handleSubmitUser}>
            <p>
              <h3>Create user:</h3>
            </p>
            <input
              type="text"
              placeholder="user name"
              required
              onChange={e => {
                const user = {
                  name: e.target.value,
                  email: this.state.user.email
                }

                this.setState({ user })
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={e => {
                const user = {
                  name: this.state.user.name,
                  email: e.target.value
                }

                this.setState({ user })
              }}
            />

            <button type="submit">Create user</button>
          </form>
          <ul>
            {this.state.allUsers.map(u => <li key={u.email}>{u.email}</li>)}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;