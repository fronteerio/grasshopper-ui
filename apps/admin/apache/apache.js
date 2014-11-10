var path = require('path');

module.exports = {
    'documentRoot': path.normalize(__dirname + '/../ui'),
    'hostname': 'admin.grasshopper.com',
    'ip': '127.0.0.1',
    'shared': path.normalize(__dirname + '/../../../shared')
};
