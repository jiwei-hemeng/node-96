module.exports = (sql, params, callback) => {
    // 1. 加载mysql
    const mysql = require('mysql');
    // 2. 创建连接对象
    const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'heroes_manager' // 数据库名，不是表名
    });
    // console.log(conn);
    // 3. 连接到mysql服务器
    conn.connect();
    // 4. 完成增删改查
    conn.query(sql, params, callback);
    // 5. 关闭连接
    conn.end();
}