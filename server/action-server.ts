import * as express from 'express';
import * as path from 'path';
import {Server} from "ws";

const app = express();
app.use('/',express.static(path.join(__dirname,'..','client')))
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
})
app.get('/api/product/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
})
app.get('/api/product/:id/comments', (req, res) => {
    res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
})
const server = app.listen(8000, 'localhost', () => {
    console.log("地址是8000");
})
const wsServer = new Server({port: 8085});
wsServer.on('connection', websocket => {
    websocket.send('这是服务器主动推送的消息')
    websocket.on('message', message => {
        console.log('接收到消息:' + message);
    })
});

setInterval(() => {
    if (wsServer.clients) {
        wsServer.clients.forEach(client => {
            client.send("这是定时推送")
        })
    }
}, 2000);