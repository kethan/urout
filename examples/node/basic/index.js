const getRouter = require('../router');

let app = getRouter();
let users = getRouter()
    .get('/', (req, res) => {
        res.end('users!')
    })
app
    .use((req, res, next) => {
        console.log('mid');
        next();
    })
    .use('users', users)
    .get('/', (req, res) => {
        res.end('root');
    })
    .get('/err', (req, res) => {
        throw 'e';
    })
    .listen(3000)