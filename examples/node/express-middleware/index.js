const getRouter = require('../router');
const compression = require("compression");
const cors = require('cors');
const path = require('path')
const dir = path.join(__dirname, 'public');
const serve = require('serve-static')(dir);
const morgan = require("morgan");
const helmet = require("helmet");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

let birds = getRouter()
    .get('/', function (req, res) {
        res.end('Birds home page')
    })
    .get('/about', function (req, res) {
        res.end('About birds')
    })

function one(req, res, next) {
    req.hello = 'world';
    next();
}

function two(req, res, next) {
    console.log('two');
    next();
}

getRouter()
    .use(one, two)
    .use(compression())
    .use(serve)
    .use(cors())
    .use(morgan("common"))
    .use(helmet())
    .use('/birds', birds)
    .get('/', function (req, res) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Hello World!')
    })
    .post('/profile', upload.single('avatar'), function (req, res, next) {
        res.end('Upload Complete!');
    })
    .listen(3000)