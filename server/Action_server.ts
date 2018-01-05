import * as express from 'express';
import * as path from 'path';
import {Server} from "ws";

const bodyParser = require('body-parser');
const app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

export class Product {

    constructor(public  id: number,
                public  title: string,
                public  price: number,
                public  rating: number,
                public  desc: string,
                public  categories: Array<string>) {

    }
}

export class Comment {
    constructor(public  id: number,
                public  productId: number,
                public timestamp: string,
                public  user: string,
                public rating: number,
                public content: string) {

    }
}

export class Table {
    constructor(public id: number,
                public name: string,
                public sex: string,
                public phonenumber: string,
                public address: string) {
    }
}

const products: Product[] = [
    new Product(1, '第一个商品', 1.99, 3.5, '这是我的第一个商品', ['电子产品', '电子设备']),
    new Product(2, '第二个商品', 2.99, 4.5, '这是我的第二个商品', ['图书']),
    new Product(3, '第三个商品', 3.99, 1.5, '这是我的第三个商品', ['电子产品', '电子设备']),
    new Product(4, '第四个商品', 4.99, 2.5, '这是我的第四个商品', ['图书']),
    new Product(5, '第五个商品', 5.99, 4.5, '这是我的第五个商品', ['电子产品', '电子设备']),
    new Product(6, '第六个商品', 6.99, 3.5, '这是我的第六个商品', ['电子设备'])
];
const comments: Comment[] = [
    new Comment(1, 1, '2017-10-16 22:22', '张三', 3, '东西不错'),
    new Comment(2, 1, '2017-10-16 22:22', '李四', 4, '东西不错'),
    new Comment(3, 1, '2017-10-16 22:22', '王五', 5, '东西不错'),
    new Comment(4, 2, '2017-10-16 22:22', '张三三', 3, '东西不错'),
    new Comment(5, 3, '2017-10-16 22:22', '张三六', 2, '东西不错')
];
const tables: Table[] = [
    new Table(1, '张三', '男', '13243234567', '上海市闵行区'),
    new Table(2, '李四', '男', '13243234786', '上海市浦东新区'),
    new Table(3, '王五', '男', '13243234908', '北京市朝阳区'),
    new Table(4, '张天', '男', '13243234678', '上海市松江区'),
    new Table(5, '李丽', '女', '13243234456', '上海市国贸中心'),
    new Table(6, '唐婷', '女', '13243234654', '上海市闵行区'),
];
let i: number = 9;
app.get('/api/products', (req, res) => {
    let result = products;
    let params = req.query;
    if (params.title) {
        result = result.filter((p) => p.title.indexOf(params.title) !== -1);
    }
    if (params.price && result.length > 0) {
        result = result.filter((p) => p.price <= parseInt(params.price));
    }
    if (params.category !== "-1" && result.length > 0 && params.category) {
        result = result.filter((p) => p.categories.indexOf(params.category) !== -1);
    }
    res.json(result);
});
app.get('/api/product/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
});
app.get('/api/product/:id/comments', (req, res) => {
    res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
});
app.get('/api/tables/edit/:id', (req, res) => {
    res.json(tables.filter((tables) => tables.id == req.params.id));
})
app.get('/api/table', (req, res) => {
    res.json(tables);
});
app.post('/api/tables', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
    } else {
        let name, sex, phonenumber, address;
        for (let key in req.body) {
            let datas = JSON.parse(key);
            for (let k in datas) {
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
app.post('/api/tables/edits/:id', (req, res) => {
    let index = 0;
    tables.forEach( (v, i) => {
        if (v.id == req.params.id) index = i;
    });
    for (let key in req.body) {
        let datas = JSON.parse(key);
        for (let k in datas) {
            tables[index]['name'] = datas['name'];
            tables[index]['sex'] = datas['sex'];
            tables[index]['phonenumber'] = datas['phonenumber'];
            tables[index]['address'] = datas['address'];
        }
    }
    console.log(tables);
    res.json(tables);
})
app.get('/api/tables/delete/:id',(req,res)=>{
    let index = 0;
    tables.forEach( (v, i) => {
        if (v.id == req.params.id) index = i;
    })
    tables.splice(index,1);
    res.json(tables);
})
app.post('/api/login', (req, res) => {
    res.json('登录成功！');
});
const server = app.listen(8000, 'localhost', () => {
    console.log("地址是8000");
});
const subscriptions = new Map<any, number[]>()
const wsServer = new Server({port: 8085});
wsServer.on('connection', websocket => {
    websocket.on('message', message => {
        let messageObj = JSON.parse(<string>message);
        let productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, [...productIds, messageObj.productId]);
    });
});
const currentBids = new Map<number, number>();
setInterval(() => {
    products.forEach(p => {
        let currentBid = currentBids.get(p.id) || p.price;
        let newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach((productIds: number[], ws) => {
        if (ws.readyState === 1) {
            let newBids = productIds.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            console.log(newBids)
            ws.send(JSON.stringify(newBids));
        } else {
            subscriptions.delete(ws);
        }

    });
}, 2000);