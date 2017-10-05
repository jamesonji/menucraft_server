var express = require('express');
var util = require('../modules/util');
var _ = require('../libs/underscore-min.js');

var db = {};

db.getValue = function (model_name, id, next)
{
    var pool = global.db;
    var cache = global.cache;
    if(typeof model_name == "string"){
        model_name = model_name.toLowerCase();
    }
    var cache_key = 'model_' + model_name + '_id_' + id;
    var strsql = 'SELECT * FROM ' + model_name + ' WHERE deleted_at is null AND id=' + pool.escape(id);
    cache.get(cache_key, function (err, reply) {
        if (reply) {
            next(null, util.parseJSON(reply));
        } else if (err) {
            next(err);
        } else {
            db.sqlExec(pool, strsql, null, function (err, records) {
                if(err){
                    next(err);
                }else{
                    var string = '{}';
                    if (records.length > 0) {
                        string = JSON.stringify(records[0]);
                        cache.set(cache_key, string, function (err, reply) {
                            if (reply) {
                                cache.expire(cache_key, 86400);
                                next(null, JSON.parse(string));
                            } else {
                                next(err);
                            }
                        });
                    } else {
                        next(err);
                    }
                }
            });
        }
    });
};

db.getIds = function (model_name, where_conditions, next) {
    var pool = global.db;
    var strsql = "SELECT id FROM " + model_name + " WHERE deleted_at is null AND ?";
    console.log(strsql);
    db.sqlExec(pool, strsql, where_conditions, function (err, records) {
        if (err) {
            next(err);
        } else {
            var ids = _.pluck(records, "id");
            next(null, ids);
        }
    });
};

db.sqlExec = function (pool, strsql, sqlObj, next){
    pool.getConnection(function (err, connection) {
        if (err){
            next(err);
        }else {
            connection.query(strsql, sqlObj, function (err, records) {
                next(err, records);
            });
            connection.release();
        }
    });
};

module.exports = db;
