var express = require('express');

module.exports = (function() {

	var router = express.Router();
	var Sequelize = require('sequelize');
	var config = require('./config');
	var host = config.host || 'localhost'
	//Initialize database
	var sequelize = new Sequelize(config.database, config.username, config.password,{
		host: host
	});
	var TABLE_PREFIX = config.table_prefix;

	//Pagination settings
	var paginate = config.paginate;
	var page_limit = config.page_limit;

	var mysql_clean = function (string) {
		return sequelize.getQueryInterface().escape(string);
	};

	//Create 
	router.post('/:table', function(req, res) {
		if(JSON.stringify(req.body) == '{}') {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "Parameters missing"
			});
			return false;
		}
		var keys = '';
		var values = '';
		Object.keys(req.body).forEach(function(key, index) {
			var val = req.body[key];
			keys += "`"+key+"`";
			values += mysql_clean(val);
			if(Object.keys(req.body).length != (index+1)) {
				keys += ',';
				values += ',';
			}
		});
		sequelize.query("INSERT INTO `" + ( TABLE_PREFIX + req.params.table ) + "` (" + keys + ") VALUES ("+ values +")", { type: sequelize.QueryTypes.INSERT})
		.then(function(id) {
			res.status(201);
			res.json({
				"success" : 1,
				"id" : id
			});
		})
		.catch( function(err) {
			res.status(404);
			res.send({
				"success" : 0,
				"message" : err.message
			});
		});
	});

	//Update by ID 
	router.put('/:table/:id', function(req, res) {
		sequelize.query("SHOW KEYS FROM `" + ( TABLE_PREFIX + req.params.table ) + "` WHERE Key_name = 'PRIMARY'", { type: sequelize.QueryTypes.SELECT})
		.then(function(keys) {
			var primary_key = keys[0].Column_name;
			if(JSON.stringify(req.body) == '{}') {
				res.status(200);
				res.json({
					"success" : 0,
					"message" : "Parameters missing"
				});
				return false;
			}
			var update_string = '';
			Object.keys(req.body).forEach(function(key, index) {
				var val = req.body[key];
				update_string += "`" + key + "` = " + mysql_clean(val); 
				if(Object.keys(req.body).length != (index+1)) {
					update_string += ',';
				}
			});
			sequelize.query("UPDATE `" + ( TABLE_PREFIX + req.params.table ) + "` SET " + update_string + " WHERE `"+ primary_key +"` = "+mysql_clean(req.params.id), { type: sequelize.QueryTypes.UPDATE})
			.then(function() {
				res.status(200);
				res.json({
					"success" : 1,
					"message" : "Updated"
				});
			})
			.catch( function(err) {
				res.status(404);
				res.send({
					"success" : 0,
					"message" : err.message
				});
			});
		})
		.catch( function(err) {
			res.status(404);
			res.send({
				"success" : 0,
				"message" : err.message
			});
		});
	});

	//Read 
	router.get('/:table', function(req, res) {
		console.log(req.query);

		var query_string = '';
		Object.keys(req.query).forEach(function(key, index) {
			if(key.substr(0,1) != "_"){
				var val = req.query[key];
				if(key.substr(key.length-3) == '_ne'){
					query_string += "`" + key.substr(0, key.length-3) + "` != " + mysql_clean(val); 
				}else if(key.substr(key.length-4) == '_gte'){
					query_string += "`" + key.substr(0, key.length-4) + "` >= " + mysql_clean(val); 
				}else if(key.substr(key.length-4) == '_lte'){
					query_string += "`" + key.substr(0, key.length-4) + "` <= " + mysql_clean(val); 
				}else if(key.substr(key.length-5) == '_like'){
					query_string += "`" + key.substr(0, key.length-5) + "` like " + mysql_clean("%"+val+"%"); 
				}else{
					query_string += "`" + key + "` in (" + mysql_clean(val) + ")"; 
				}
				if(Object.keys(req.query).length != (index+1)) {
					query_string += ' AND ';
				}
			}			
		});

		var order_string = '';
		if(req.query._order)
		order_string = req.query._order;

		if(paginate) {
			var _page = 1;
			if(req.query._page)
			_page = req.query._page;

			var _limit = page_limit;
			if(req.query._limit)
			_limit = req.query._limit;

			var offset = (_page-1) * _limit;

			//Calculate pages
			var next = Number(_page)+1;
			if(_page != 1)
				var previous = Number(_page)-1;
			else
				var previous = Number(_page);
			var read_query = "SELECT * FROM `" + ( TABLE_PREFIX + req.params.table ) + "`"
			if(query_string != ''){
				read_query = read_query + " where " + query_string;
			}
			if(order_string != ''){
				read_query = read_query + " order by " + order_string;
			}
			read_query = read_query + " LIMIT "+_limit+" OFFSET "+offset;
		} else {
			var read_query = "SELECT * FROM `" + ( TABLE_PREFIX + req.params.table ) + "`";
			if(query_string != ''){
				read_query = read_query + " where " + query_string;
			}
			if(order_string != ''){
				read_query = read_query + " order by " + order_string;
			}
 		}
		sequelize.query(read_query, { type: sequelize.QueryTypes.SELECT})
		.then(function(rows) {
			if(!rows.length) {
				res.status(404);
				res.json({
					"success" : 0,
					"data" : "No rows found"
				});
			}
			res.status(200);
			if(!next)
				res.json({
					"success" : 1,
					"data" : rows
				});
			else
				var last = Math.ceil(rows.length/_limit);
			res.json({
				"success" : 1,
				"data" : rows,
				"pages" : {
					"next": next,
					"previous": previous,
					"last": last
				}
			});
		})
		.catch( function(err) {
			res.status(404);
			res.send({
				"success" : 0,
				"message" : err.message
			});
		});
	});

	//Read by ID 
	router.get('/:table/:id', function(req, res) {
		sequelize.query("SHOW KEYS FROM `"+TABLE_PREFIX+req.params.table+"` WHERE Key_name = 'PRIMARY'", { type: sequelize.QueryTypes.SELECT})
		.then(function(keys) {
			var primary_key = keys[0].Column_name;
			sequelize.query("SELECT * FROM `"+TABLE_PREFIX+req.params.table+"` WHERE `"+ primary_key +"` = " + mysql_clean(req.params.id), { type: sequelize.QueryTypes.SELECT})
			.then(function(rows) {
				if(!rows.length) {
					res.status(404);
					res.json({
						"success" : 0,
						"data" : "No rows found"
					});
				}
				res.status(200);
				res.json({
					"success" : 1,
					"data" : rows
				});
			})
			.catch( function(err) {
				res.status(404);
				res.send({
					"success" : 0,
					"message" : err.message
				});
			});
		})
		.catch( function(err) {
			res.status(404);
			res.send({
				"success" : 0,
				"message" : err.message
			});
		});
	});

	//Delete by ID 
	router.delete('/:table/:id', function(req, res) {
		sequelize.query("SHOW KEYS FROM `"+TABLE_PREFIX+req.params.table+"` WHERE Key_name = 'PRIMARY'", { type: sequelize.QueryTypes.SELECT})
		.then(function(keys) {
			var primary_key = keys[0].Column_name;
			sequelize.query("DELETE FROM `"+TABLE_PREFIX+req.params.table+"` WHERE `"+ primary_key +"` = "+mysql_clean(req.params.id), { type: sequelize.QueryTypes.DELETE})
			.then(function() {
				res.status(200);
				res.json({
					"success": 1,
					"message": "Deleted"
				});
			})
			.catch( function(err) {
				res.status(404);
				res.send({
					"success" : 0,
					"message" : err.message
				});
			});
		})
		.catch( function(err) {
			res.status(404);
			res.send({
				"success" : 0,
				"message" : err.message
			});
		});
	});

	return router;

})();