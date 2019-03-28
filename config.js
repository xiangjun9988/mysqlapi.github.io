var config = {};

config.port = 3000;

//Authentication
config.auth = false;

//Database
config.database = 'wordpress';
config.username = 'root';
config.password = '123456';
config.table_prefix = 'wp_';

//Pagination
config.paginate = true;
config.page_limit = 10;

module.exports = config;