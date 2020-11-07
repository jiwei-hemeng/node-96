// 存放 登录、注册、验证码三个路由（接口）
// 加载核心模块
const path = require("path");
// 加载自定义的模块
const db = require(path.join(__dirname, "../utils", "db.js"));

const svgCaptcha = require("svg-captcha");

const jwt = require("jsonwebtoken");
const secretKey = "jiwei-96";
// 1. 加载express
const express = require("express");
// 2. 创建路由对象，
const router = express.Router();
// 3. 把路由挂载到路由对象上

// 导入微信的jssdk
const { Wechat } = require("wechat-jssdk");
// 初始化jssdk
const wx = new Wechat({
  appId: "wx58299832d23f3198",
  appSecret: "7d7eda6f72fcff7e71bc58d1029e8783",
});

// 完成注册接口
router.post("/reguser", (req, res) => {
  if (req.body.vcode.toUpperCase() !== req.session.captcha.toUpperCase()) {
    return res.json({ status: 1, message: "验证码错误" });
  }
  delete req.body.vcode;
  // 3. 添加到数据库，完成注册
  db("insert into user set ?", req.body, (err, result) => {
    console.log(err);
    if (err || result.affectedRows < 1) {
      console.log(err);
      res.json({ status: 1, message: "注册失败！" });
    } else {
      res.json({ status: 0, message: "注册成功！" });
    }
  });
});

// 完成登录接口
router.post("/login", (req, res) => {
  if (req.body.vcode.toUpperCase() !== req.session.captcha.toUpperCase()) {
    return res.json({ status: 1, message: "验证码错误" });
  }
  let sql = "select * from user where username=? and password=?";
  db(sql, [req.body.username, req.body.password], (err, result) => {
    if (err) return console.log(err);
    if (result.length > 0) {
      res.json({
        status: 0,
        message: "登录成功",
        token:
          "Bearer " +
          jwt.sign({ username: req.body.username }, secretKey, {
            expiresIn: "1h",
          }),
      });
    } else {
      res.json({ status: 1, message: "账号或密码错误" });
    }
  });
});

// 验证码接口
router.get("/captcha", function (req, res) {
  let captcha = svgCaptcha.create({}); // 创建验证码对象
  req.session.captcha = captcha.text; // 把验证码上的字母保存到 session 中
  // console.log('session', req.session);
  // console.log(captcha.text); // 验证码上的字母或运算结果

  res.type("svg");
  res.status(200).send(captcha.data); // 做出响应
});
// 配置微信网页版接口

router.get("/getsignature", (req, res) => {
  wx.jssdk.getSignature("http://localhost:3006/").then((signatureData) => {
    res.send(signatureData);
  });
});

// 4. 导出路由对象
module.exports = router;
