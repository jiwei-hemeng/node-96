// 使用Promise 对db进行再次的封装
const path = require('path');
const db = require( path.join(__dirname, 'db.js') );

// 使用Promise 对db进行再次封装
module.exports = function (sql, params) {
    return new Promise((resolve, reject) => {
        db(sql, params, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}
