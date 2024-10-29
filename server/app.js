require('dotenv').config();
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

let httpPort = process.env.HTTP_PORT || 80;
const httpsPort = process.env.HTTPS_PORT || 443;
const host = process.env.HOST || 'localhost';

// 确保 files 目录存在
const uploadDir = path.join(__dirname, 'files');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 配置 multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

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

// 文件上传路由
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const protocol = req.secure ? 'https' : 'http';
    const fullUrl = `${protocol}://${req.get('host')}/files/${req.file.filename}`;
    res.json({ message: 'File uploaded successfully', downloadLink: fullUrl });
});

// 文件下载路由
app.use('/files', express.static(uploadDir));

// 读取SSL证书
const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// 创建HTTP服务器
function startHttpServer() {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, host, () => {
        console.log(`HTTP server is running on http://${host}:${httpPort}`);
    }).on('error', (e) => {
        if (e.code === 'EACCES' && httpPort < 1024) {
            console.log(`Port ${httpPort} requires elevated privileges. Trying port 8080.`);
            httpPort = 8080;
            startHttpServer();
        } else {
            console.error(e);
        }
    });
}

startHttpServer();

// 创建HTTPS服务器
https.createServer(httpsOptions, app).listen(httpsPort, host, () => {
    console.log(`HTTPS server is running on https://${host}:${httpsPort}`);
}).on('error', (e) => {
    if (e.code === 'EACCES') {
        console.error(`Port ${httpsPort} requires elevated privileges. Please run with sudo or choose a port > 1024.`);
    } else {
        console.error(e);
    }
});

// 可选：HTTP到HTTPS的重定向
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
});

// 新增的 /user-agent 路由
app.get('/user-agent', (req, res) => {
    const userAgent = req.get('User-Agent');
    res.send(`<h1>Your User Agent is:</h1><p>${userAgent}</p>`);
});

// 新增的 /test-redirect-regn-app 路由
app.get('/test-redirect-regn-app', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Test Redirect to REGN App</h1>
                <p>Click the button below to redirect to REGN app:</p>
                <button onclick="window.location.href = 'regn:///product/nP56hOQP7gLx3uEMbyF0'">
                    Redirect to REGN App
                </button>
                <script>
                    // 自动跳转
                    window.location.href = 'regn:///product/nP56hOQP7gLx3uEMbyF0';
                </script>
            </body>
        </html>
    `);
});

// 新增测试自定义协议跳转的路由
app.get('/test-custom-scheme', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Test Custom URL Scheme</h1>
                <p>Click the links below to test app opening:</p>
                <ul>
                    <li><a href="test-aasa:///product/aaa">Open App with test-aasa:///product/aaa</a></li>
                    <li><button onclick="window.location.href='test-aasa:///product/aaa'">
                        Open App (Button)
                    </button></li>
                </ul>
                <script>
                    // 检测是否支持自定义协议
                    function openApp() {
                        // 尝试打开应用
                        window.location.href = 'test-aasa:///product/aaa';
                    }
                </script>
            </body>
        </html>
    `);
});

// 新增的 /test-auto-redirect 路由
app.get('/test-auto-redirect', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Auto Redirect Test</title>
            </head>
            <body>
                <h1>Testing Auto Redirect...</h1>
                <p>Redirecting to app or store...</p>
                <script>
                    // 使用 Promise 和 setTimeout 来检测应用是否打开
                    function tryOpenApp() {
                        const timeout = 1500;
                        
                        // 记录当前时间
                        const start = Date.now();
                        
                        // 在新窗口中尝试打开应用
                        const appWindow = window.open('test-aasa:///product/aaa');
                        
                        // 延迟检查
                        setTimeout(function() {
                            const userAgent = navigator.userAgent || navigator.vendor;
                            // 如果页面隐藏了或者超过1.5秒，认为应用已经打开
                            if (document.hidden || document.webkitHidden || (Date.now() - start) > timeout) {
                                // 应用可能已经打开，关闭新窗口
                                if (appWindow) {
                                    appWindow.close();
                                }
                            } else {
                                // 应用可能未安装，跳转到应用商店
                                if (appWindow) {
                                    appWindow.close();
                                }
                                
                                if (/android/i.test(userAgent)) {
                                    window.location.href = 'https://play.google.com/store/apps/details?id=com.qianzhiwei5921.test-aasa';
                                } else if (/iPad|iPhone|iPod/i.test(userAgent)) {
                                    window.location.href = 'https://apps.apple.com/app/test-aasa/id您的APP_ID';
                                } else {
                                    window.location.href = 'https://apps.apple.com/app/test-aasa/id您的APP_ID';
                                }
                            }
                        }, timeout);
                    }

                    // 页面加载完成后自动执行
                    window.onload = tryOpenApp;
                </script>
            </body>
        </html>
    `);
});
