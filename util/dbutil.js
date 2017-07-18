var mysql = require('mysql');
var dbCfg = require('./dbcfg.js');
var logger = require('../util/logutil.js');
var async = require('async');

var connection = mysql.createConnection(dbCfg.server);

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('Mysql connected as id ' + connection.threadId);
});

/**
 * 通过用户名获取用户
 * @param nickname 用户名
 */
exports.findUserByNick = function(nickname, callback) {
    connection.query('select * from `user` where nick_name=?', [nickname], function (err, results){
        if (err) throw err;
        callback(results[0]);
    });
}

/**
 * 通过id获取用户
 * @param userId
 */
exports.findUserById = function(userId, callback) {
    connection.query('select * from `user` where user_id=?', [userId], function (err, results, fields) {
        if (err) throw err;
        callback(results[0]);
    })
}

/**
 * 插入用户信息
 * @param userInfo 用户信息，格式：{userName: 'cy', password: '123', tel: '123', email: '123@qq.com'}
 */
exports.addUser = function(userInfo, callback) {
    connection.query('insert into `user` (nick_name, password, mobile_no, email, icon) values (?, ?, ?, ?, ?)', 
        [userInfo.userName, userInfo.password, userInfo.tel, userInfo.email, 1], function (err, rows) {
            if (err) {
                connection.rollback();
            }
            callback(rows.insertId);
        });
}

/**
 * 通过用户信息查找角色信息
 * @param userId 用户的id5
 */
exports.findRoleInfoByUserId = function(userId, callback) {
    connection.query('select * from role_info where user_id=?',  [userId], function(err, row) {
        if (err) throw err;
        callback(row[0]);
    });
}

exports.hello = function () {
    console.log('hello');
}
/**
 * 通过用户id获取用户的朋友列表
 */
exports.findFriendListByUserId = function(userId, callback) {
    connection.query('select friend_id from friend where id=?', [userId], function(err, friendIds) {
        var friendList = {};
        async.eachSeries(friendIds, function(friend, errCb){
            exports.findUserById(friend.friend_id, function(data) {
                friendList[data.user_id] = data;
                errCb();
            })
        }, function(err) {
            if (err) console.log(err);
            callback(friendList);
        });
    })
}

// exports.findFriendListByUserId(1, function (data) {
//     logger.jsonLog(data);
// });