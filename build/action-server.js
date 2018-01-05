"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
var Product = (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, '第一个商品', 1.99, 3.5, '这是我的第一个商品', ['电子产品', '电子设备']),
    new Product(2, '第二个商品', 2.99, 4.5, '这是我的第二个商品', ['图书']),
    new Product(3, '第三个商品', 3.99, 1.5, '这是我的第三个商品', ['电子产品', '电子设备']),
    new Product(4, '第四个商品', 4.99, 2.5, '这是我的第四个商品', ['图书']),
    new Product(5, '第五个商品', 5.99, 4.5, '这是我的第五个商品', ['电子产品', '电子设备']),
    new Product(6, '第六个商品', 6.99, 3.5, '这是我的第六个商品', ['电子设备'])
];
var comments = [
    new Comment(1, 1, '2017-10-16 22:22', '张三', 3, '东西不错'),
    new Comment(2, 1, '2017-10-16 22:22', '李四', 4, '东西不错'),
    new Comment(3, 1, '2017-10-16 22:22', '王五', 5, '东西不错'),
    new Comment(4, 2, '2017-10-16 22:22', '张三三', 3, '东西不错'),
    new Comment(5, 3, '2017-10-16 22:22', '张三六', 2, '东西不错')
];
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.category !== "-1" && result.length > 0 && params.category) {
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, 'localhost', function () {
    console.log("地址是8000");
});
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on('connection', function (websocket) {
    websocket.send('这是服务器主动推送的消息');
    websocket.on('message', function (message) {
        console.log('接收到消息:' + message);
    });
});
setInterval(function () {
    if (wsServer.clients) {
        wsServer.clients.forEach(function (client) {
            client.send("这是定时推送");
        });
    }
}, 2000);
