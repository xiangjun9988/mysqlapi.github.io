# MysqlApi
**node.js MySQL API 数据库 - 提供（增、删、改、查），通过 HTTP 方式 (POST, GET, PUT, and DELETE)。**

## 特征
- 提供RESTful
- 提供基础 API 授权认证
- 提供防止SQL注册
- 提供数据库条件查询
- 提供分页查询
- 自动提供数据库所有表的API

## 配置简单
```javascript
config.port = 3000;

//设置权限
config.auth = false;

//数据库设置
config.database = 'database';
config.username = 'username';
config.password = 'password';
config.table_prefix = '';

//默认分页设置
config.paginate = true;
config.page_limit = 10;
```
- "身份验证" 为 true, 启用 API 的 HTTP 基本验证。使用者名和密码存儲在 "keys.htpasswd" 中, 格式为 "使用者名: 密码"
- 输入数据库名称、用户名和密码, 连接到本地 mysql。
- "分页" 为 true, 在获取请求中启用分页。

## Create (POST)
插入一条新纪录

```
POST http://www.domain.com/api/table_name
```
**Response**
- 操作成功 :
```json
{
  "success": 1,
  "id": inserted_id
}
```
- 操作失败 :
```json
{
  "success": 0,
  "message": "Parameters missing"
}
```

## Read (GET)
读取数据

- 读取整表数据
```
GET http://www.yourdomain.com/api/table_name
```
- 读取指定ID的记录
```
GET http://www.yourdomain.com/api/table_name/id
```

## 条件查询语法

- 字段名_ne  不等于操作 != 
```
GET http://www.yourdomain.com/api/table_name?username_ne=jack
```
- 字段名_gte 大于等于 >= 
```
GET http://www.yourdomain.com/api/table_name?price_gte=100
```
- 字段名_lte 小于等于 <= 
```
GET http://www.yourdomain.com/api/table_name?price_lte=800
```
- 字段名_like 内容 like '%?%'
```
GET http://www.yourdomain.com/api/table_name?content_like=searchword
```
- 字段名 in (A,B,....)
```
GET http://www.yourdomain.com/api/table_name?username=A&username=B
```
- 查询指定页记录 _page
```
GET http://www.yourdomain.com/api/table_name?_page=1
```
- 查询指定页记录数 _limit
```
GET http://www.yourdomain.com/api/table_name?_limit=20
```


**Response**
- 找到数据，返回 :
```json
{
  "success": 1,
  "data": "..."
}
```
- 没有找到数据 :
```json
{
  "success": 0,
  "message": "No rows found"
}
```

## Update (PUT)
按照指定ID更新记录

```
PUT http://www.yourdomain.com/api/table_name/id
```
**Response**
- 更新操作成功 :
```json
{
  "success": 1,
  "message": "Updated"
}
```
- 更新操作失败 :
```json
{
  "success": 0,
  "message": "Parameters missing"
}
```

## Delete (DELETE)
删除指定ID的记录

```
DELETE http://www.yourdomain.com/api/table_name/id
```
**Response**
- 删除操作成功 :
```json
{
  "success": 1,
  "message": "Deleted"
}
```
