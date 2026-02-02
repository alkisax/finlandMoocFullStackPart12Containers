const express = require('express');
const { Todo } = require('../mongo')
const { getAsync, setAsync } = require('../redis');

const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })

  const currentCount = Number(await getAsync('added_todos')) || 0;
  await setAsync('added_todos', currentCount + 1);

  res.send(todo);
});

// statistics
router.get('/statistics', async(_req, res) => {
  const addedTodos = Number(await getAsync('added_todos')) || 0;
  res.status(200).json({ added_todos: addedTodos })
})

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.json(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const { text, done } = req.body;

  // update fields
  req.todo.text = text;
  req.todo.done = done;

  const updated = await req.todo.save();
  res.json(updated);
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
