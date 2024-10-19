require('dotenv').config();
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();

const httpPort = process.env.HTTP_PORT || 80;
const httpsPort = process.env.HTTPS_PORT || 443;
const host = process.env.HOST || 'localhost';

// AASA JSON 数据
const aasaData = {
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "7GC459Q68Q.com.qianzhiwei5921.test-aasa",
                "paths": [
                    "/product/*",
                    "/test"
                ]
            }
        ]
    },
    "activitycontinuation": {
        "apps": [
            "7GC459Q68Q.com.qianzhiwei5921.test-aasa"
        ]
    },
    "webcredentials": {
        "apps": [
            "7GC459Q68Q.com.qianzhiwei5921.test-aasa"
        ]
    }
};

// 设置路由来提供 AASA 文件
/**
 * http://localhost:3008/.well-known/apple-app-site-association
 */
app.get('/.well-known/apple-app-site-association', (req, res) => {
    res.json(aasaData);
});
app.get('/apple-app-site-association', (req, res) => {
    res.json(aasaData);
});

// 测试路由
/*
http://localhost:3008/product/aaa
*/
app.get('/product/aaa', (req, res) => {
    res.send('<h1 style="font-size: 24px;">aaa</h1>');
});

// 新增的 /test 路由
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Test Page123</h1>
                <p>Click the link below to go to /product/aaa:</p>
                <a href="/product/aaa">Go to /product/aaa</a>
            </body>
        </html>
    `);
});

// 读取SSL证书
const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// 创建HTTP服务器
http.createServer(app).listen(httpPort, host, () => {
    console.log(`HTTP server is running on http://${host}:${httpPort}`);
});

// 创建HTTPS服务器
https.createServer(httpsOptions, app).listen(httpsPort, host, () => {
    console.log(`HTTPS server is running on https://${host}:${httpsPort}`);
});

// 可选：HTTP到HTTPS的重定向
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
});
