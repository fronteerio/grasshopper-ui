var path = require('path');

module.exports = {
    'apps': path.normalize(__dirname + '/../../../apps'),
    'documentRoot': path.normalize(__dirname + '/../ui'),
    'ip': '127.0.0.2',
    'shared': path.normalize(__dirname + '/../../../shared'),
    'tests': path.normalize(__dirname + '/../../../tests')
};
