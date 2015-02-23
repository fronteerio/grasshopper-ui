var path = require('path');

module.exports = {
    'admin': path.normalize(__dirname + '/../admin'),
    'apps': path.normalize(__dirname + '/../../../apps'),
    'docs': path.normalize(__dirname + '/../../../docs'),
    'documentRoot': path.normalize(__dirname + '/../ui'),
    'ip': '127.0.0.2',
    'shared': path.normalize(__dirname + '/../../../shared'),
    'tests': path.normalize(__dirname + '/../../../tests')
};
