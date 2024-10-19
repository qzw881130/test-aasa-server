const express = require('express');
const app = express();
const port = 3008; // 更改端口号为 3008

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

// 启动服务器
app.listen(port, () => {
    console.log(`AASA server is running on port ${port}`);
});
