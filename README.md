# Universal Router

**Start developing server/browser apps in seconds** ✨

Fast, unopinionated, minimalist browser and server Router ;)

A router version of [```express```](http://expressjs.com/) built with [```polka```](https://github.com/lukeed/polka) and based heavily on [```trouter```](https://github.com/lukeed/trouter).

# Features

* **Lightweight** - less than 1.7kb min+gzip
* **No Dependency** - No Bloating. No external dependencies
* **Node/Browser compatible code** - Use the same code for server and browser
* **Express.js Middleware compatible** - Middleware support, including Express middleware you already know & love
* **Express.js identical API** - Nearly identical application API & route pattern definitions

# Install
```
$ npm install --save urout
```
# Usage
```
const Router = require('urout');
function getRouter({
        onError = (err, req, res) => {
            res.end(err)
        }, onNoMatch = (req, res, next) => {
            res.end('no match');
        }
    } = {}) {
        return new Router.Router({ onError, onNoMatch });
    }

    let res = {
        end: (chunk, cb) => {
            console.log(chunk);
        }
    }

    let app = getRouter();
    let users = getRouter()
        .get('/', (req, res) => {
            res.end('users!');
        })
    app
        .use((req, res, next) => {
            console.log('mid');
            next()
        })
        .use('users', users)
        .get('/', (req, res) => {
            res.end('root');
        })
        .get('/err', (req, res) => {
            throw 'e';
        });
    app.handler({ method: 'GET', url: '/' }, res);
    app.handler({ method: 'GET', url: '/err' }, res);
    app.handler({ method: 'GET', url: '/nomatch' }, res);
    app.handler({ method: 'GET', url: '/users' }, res);
```

Look for more usage in examples folder for node.js API server, express middleware and browser implementation.

# API

# License

MIT © Kethan Surana