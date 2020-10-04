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
  // 1. 接收post请求体（用户提交的数据）
  console.log(req.body.verify); // {username: 'x', password: 'yy', verify: 'adf'}
  // 2. 检查一下，接收到的数据和数据表中的字段是否一致
  // 检查发现，多了一个verify字段，需要把它删除
  if (!req.session.captcha) {
    return res.json({ status: 4, message: "服务器没有收到cookei" });
  }
  if (req.body.verify.toUpperCase() !== req.session.captcha.toUpperCase()) {
    // console.log("验证码错误");
    return res.json({ status: 1, message: "验证码错误" });
  }
  delete req.body.verify;
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
  // 1. 接收post请求体 {username: 'admin', password: '202cb962ac59075b964b07152d234b70', verfiy:'xxxx'}
  // console.log(req.body);
  // 2. 验证码判断（略）
  // req.body.verify 是用户提交的验证码
  // req.session.captcha 是验证码上的字母
  // console.log(req.body.verify,  req.session.captcha);
  if (!req.session.captcha) {
    return res.json({ status: 4, message: "服务器没有收到cookei" });
  }
  if (req.body.verify.toUpperCase() !== req.session.captcha.toUpperCase()) {
    return res.json({ status: 1, message: "验证码错误" });
  }
  // 3. 判断账号和密码是否匹配
  // 执行下面的SQL，如果查询结果不是空数组，则查到结果了，则表示账号密码正确
  let sql = "select * from user where username=? and password=?";
  db(sql, [req.body.username, req.body.password], (err, result) => {
    if (err) return console.log(err);
    // console.log(result);
    // 判断result这个数组是否为空
    if (result.length > 0) {
      // 4. 如果账号密码正确，则响应结果，结果中必须包含token
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
  console.log(req.session);
  console.log(captcha.text); // 验证码上的字母或运算结果

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
