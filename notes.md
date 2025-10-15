docker container ls -a

docker start -i elegant_jemison
apt-get update
apt-get install curl
curl --version
curl -sL https://deb.nodesource.com/setup_20.x | bash
apt install -y nodejs
cd usr/src/app
node index.js

docker commit elegant_jemison first_image

---

echo "console.log('Hello, World')" > index.js
🏃 Step 3: Run it inside a ready Node image
Run Node directly using a Node image from Docker Hub:

docker run -it -v "$(pwd)":/usr/src/app -w /usr/src/app node:20 bash
Explanation:

-v "$(pwd)":/usr/src/app → mounts your current folder into the container

-w /usr/src/app → sets that folder as working directory

node:20 → uses an official image that already has Node installed

- later
docker run -v "$(pwd)":/usr/src/app -w /usr/src/app node:20 node index.js
That line runs the file in one shot (no need to type bash or node manually).

# 12.2

```
FROM node:20

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci

ENV DEBUG=first-image:*

USER node

CMD npm start
```

docker build -t fs-hello-world . 
docker run first_image

list
`docker image ls`
remove
`docker image rm`
run
`docker run -it first_image bash`

auto create express
`express first_image`
run
`DEBUG=first-image:* npm start`

# φτιάξαμε έναν express server
```
FROM node:20

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci

ENV DEBUG=first-image:*

USER node

CMD npm start
```
- build
`docker build -t express-server .`
`docker run -p 3130:3000 express-server`

- explain
docker run -p 3123:3000 express-server
you’re using the syntax:

-p <HOST_PORT>:<CONTAINER_PORT>
🧠 Meaning
Side	Description
3000	The port inside the container — this is where your Express app is listening (app.listen(3000))
3123	The port on your host machine (your Windows laptop) that Docker forwards incoming traffic to

So, Docker acts like a bridge:

Your browser → localhost:3123 → Docker → container’s port 3000 → Express server


## test with
`docker build -t todo-backend . && docker run -p 3000:3000 todo-backend`

## docker-compose.yml
```
services:
  app:                    # The name of the service, can be anything
    image: express-server # Declares which image to use
    build: .              # Declares where to build if image is not found
    ports:                # Declares the ports to publish
      - 3000:3000
```

- τώρα τρέχει με 
```bash
docker compose up
```
- μπορώ να τρέξω συγκεκριμένο αρχείο σε αυτό έχουμε εγκαταστήσει την mongo ως container
```bash
docker compose -f docker-compose.dev.yml up
```

κλείνει 
```bash
docker compose down
```

## Mongo
τελικά έτρεξε ως εξής. άλλαξα το αρχειο και του έβαλα τα δικά μου
```js
db.createUser({
  user: '***',
  pwd: '***',
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
```

- Run MongoDB inside Docker, but keep running your Node app directly on your machine.
```bash
docker compose -f docker-compose.dev.yml down --volumes
docker compose -f docker-compose.dev.yml up -d
MONGO_URL=mongodb://***alk***:***210***5@localhost:3456/the_database npm run dev
```

### **δικές μου αλλαγές**
εφτιαξα ένα .env με
```
MONGO_USER=***
MONGO_PASS=***
```
και 
```js
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
```

και part12-containers-applications\todo-app\todo-backend\docker-compose.dev.yml
(προσθεσα τα επιπλέων env)
```yml
services:
  mongo:
    image: mongo
    ports:
      - 3456:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      MONGO_INITDB_DATABASE: the_database
      MONGO_USER: ${MONGO_USER}
      MONGO_PASS: ${MONGO_PASS}
    env_file:
      - .env
    volumes: 
      - ./mongo/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
      - ./mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 6
```

έτρεξε με 
```bash
docker compose -f docker-compose.dev.yml down --volumes
# επρεπε να τρέξουμε και αυτο γιατι το Init της mongo γινετε μονο την πρώτη φορα
rm -rf mongo_data
docker compose -f docker-compose.dev.yml up -d
# πρέπει να τρεχω αυτό ωσπου να μου πει connected
docker compose -f docker-compose.dev.yml ps
MONGO_URL=mongodb://***alk***:***210***5@localhost:3456/the_database npm run dev
```

# 12.c
## frontend
```yml
# The first FROM is now a stage called build-stage

FROM node:20 AS build-stage 

WORKDIR /usr/src/app

COPY . .

RUN npm ci

ENV VITE_BACKEND_URL=http://localhost:3000

RUN npm run build

# This is a new stage, everything before this is gone, except for the files that we want to COPY

FROM nginx:1.25-alpine

# COPY the directory dist from the build-stage to /usr/share/nginx/html
# The target location here was found from the Docker hub page

COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
```

```bash
docker images
docker build . -t todo-frontend
docker run -p 8000:80 todo-frontend
```

## moving whole app
### front

part12-containers-applications\todo-app\todo-frontend\dev.Dockerfile
```yml
FROM node:20

WORKDIR /usr/src/app

COPY . .

# Change npm ci to npm install since we are going to be in development mode
RUN npm install

# npm run dev is the command to start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]
```

```bash
docker build -f ./dev.Dockerfile -t todo-frontend-dev .
docker run -p 5173:5173 todo-frontend-dev
```

part12-containers-applications\todo-app\todo-frontend\docker-compose.dev.yml
```yml
services:
  app:
    image: todo-frontend-dev
    build:
      context: . 
      dockerfile: dev.Dockerfile
    volumes:
      - ./:/usr/src/app   
    ports:
      - 5173:5173
    container_name: todo-frontend-dev
  debug-helper:
    image: busybox
```
```bash
docker compose -f docker-compose.dev.yml up
```

## compose
```bash
docker compose -f docker-compose.dev.yml run --rm debug-helper wget -O - http://app:5173
```