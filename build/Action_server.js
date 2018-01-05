"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var bodyParser = require('body-parser');
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
var Table = (function () {
    function Table(id, name, sex, phonenumber, address) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.phonenumber = phonenumber;
        this.address = address;
    }
    return Table;
}());
exports.Table = Table;
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
var tables = [
    new Table(1, '张三', '男', '13243234567', '上海市闵行区'),
    new Table(2, '李四', '男', '13243234786', '上海市浦东新区'),
    new Table(3, '王五', '男', '13243234908', '北京市朝阳区'),
    new Table(4, '张天', '男', '13243234678', '上海市松江区'),
    new Table(5, '李丽', '女', '13243234456', '上海市国贸中心'),
    new Table(6, '唐婷', '女', '13243234654', '上海市闵行区'),
];
var i = 9;
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
app.get('/api/tables/edit/:id', function (req, res) {
    res.json(tables.filter(function (tables) { return tables.id == req.params.id; }));
});
app.get('/api/table', function (req, res) {
    res.json(tables);
});
app.post('/api/tables', function (req, res) {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        var name = void 0, sex = void 0, phonenumber = void 0, address = void 0;
        for (var key in req.body) {
            var datas = JSON.parse(key);
            for (var k in datas) {
                name = datas['name'];
                sex = datas['sex'];
                phonenumber = datas['phonenumber'];
                address = datas['address'];
            }
        }
        tables.push(new Table(i++, name, sex, phonenumber, address));
    }
    res.json(tables);
});
app.post('/api/tables/edits/:id', function (req, res) {
    var index = 0;
    tables.forEach(function (v, i) {
        if (v.id == req.params.id)
            index = i;
    });
    for (var key in req.body) {
        var datas = JSON.parse(key);
        for (var k in datas) {
            tables[index]['name'] = datas['name'];
            tables[index]['sex'] = datas['sex'];
            tables[index]['phonenumber'] = datas['phonenumber'];
            tables[index]['address'] = datas['address'];
        }
    }
    console.log(tables);
    res.json(tables);
});
app.get('/api/tables/delete/:id', function (req, res) {
    var index = 0;
    tables.forEach(function (v, i) {
        if (v.id == req.params.id)
            index = i;
    });
    tables.splice(index, 1);
    res.json(tables);
});
app.post('/api/login', function (req, res) {
    res.json('登录成功！');
});
var server = app.listen(8000, 'localhost', function () {
    console.log("地址是8000");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on('connection', function (websocket) {
    websocket.on('message', function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            console.log(newBids);
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
