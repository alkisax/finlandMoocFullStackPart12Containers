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

COPY . .

CMD DEBUG=first-image:* npm start
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
`docker build -t express-server . && docker run -p 3123:3000 express-server`