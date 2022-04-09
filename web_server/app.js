// 搭建服务器
// 加载核心模块
const path = require("path");
// 加载第三方模块

const cors = require("cors");

const expressJWT = require("express-jwt");
const session = require("express-session");
const express = require("express");

const app = express();
// ---------------------------  配置中间件 ---------------------
// 跨域中间件
app.use(
  cors({
    origin: true, // 发送请求的源
    credentials: true, // 相应的请求源
  })
);

// 跨域的中间件，必须放到最开头
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', "http://localhost:8080");
// });

// 设置请求体
// 当请求体为：application/json时设置
// app.use(express.json());
// 当请求体为：application/x-www-form-urlencoded时设置
// app.use(express.urlencoded({
//    extended: false;
// }));

// 配置session中间件
app.use(
  session({
    secret: "asdfasfda",
    resave: false, // 随便填
    saveUninitialized: true, // 随便填
    // store: {}
  })
);

// 开发静态资源（上传的图片）
app.use(express.static(path.join(__dirname, "public")));

// 设置token
const secretKey = "jiwei-96";
// 解密模块，当有请求带着token请求，下面的中间件，可以把加密的token还原成对象
app.use(expressJWT({
  secret: secretKey
}).unless({
  path: [/^\/api\//]
}));
// 接收类型为 application/x-www-form-urlencoded 类型的请求体
app.use(express.urlencoded({
  extended: false
}));

app.listen(3006, () => console.log("server working at http://localhost:3006"));

// 导入路由模块，并注册成中间件
app.use("/api", require(path.join(__dirname, "router", "login.js")));
app.use("/my", require(path.join(__dirname, "router", "heroes.js")));

// 设置错误中间件(它必须放到所有的接口后面)
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.json({
      status: 1,
      message: "身份认证失败"
    });
  }
});