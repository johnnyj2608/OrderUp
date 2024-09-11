const NodeCache = require('node-cache');

const cache = new NodeCache();

const userInfo = {
    "member": "",
    "units": 0,
    "insurance": "",
    "row": 0,
};

module.exports = {
    cache,
    userInfo,
};