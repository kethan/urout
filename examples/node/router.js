const { Router } = require('../../dist/urout.umd');
const http = require('http');
class Server extends Router {
    constructor(opts) {
        super(opts);
        this.server = opts && opts.server;
    }

    listen(port, err) {
        (this.server = this.server || http.createServer()).on('request', this.handler);
        this.server.listen.apply(this.server, arguments);
    }
}

module.exports = function({
    onError = (err, req, res) => {
        res.end(err)
    }, onNoMatch = (req, res, next) => {
        res.end('no match');
    }
} = {}) {
    return new Server({ onError, onNoMatch });
}