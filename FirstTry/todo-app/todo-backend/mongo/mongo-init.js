db.createUser({
  user: process.env.MONGO_USER || 'the_username',
  pwd: process.env.MONGO_PASS || 'the_password',
  roles: [
    {
      role: 'dbOwner',
      db: 'the_database',
    },
  ],
});

db.createCollection('todos');

db.todos.insert({ text: 'Write code', done: true });
db.todos.insert({ text: 'Learn about containers', done: false });