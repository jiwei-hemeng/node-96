// 存放 获取英雄、添加、修改、删除、等等和英雄相关的 路由 （接口）
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // 配置上传文件的存放目录
// 加载自定义的模块
const db = require(path.join(__dirname, "../utils", "db.js"));
const db2 = require(path.join(__dirname, "../utils", "db2.js"));
// 1. 加载express
const express = require("express");
// 2. 创建路由对象，
const router = express.Router();
// 3. 把路由挂载到路由对象上

// 添加英雄接口
router.post("/addhero", upload.single("heroIcon"), (req, res) => {
  // 添加提交的信息到数据库
  let sql = "insert into herose set ?";
  let values = {
    heroname: req.body.heroName,
    nickname: req.body.heroNickName,
    skill: req.body.skillName,
    img_url: req.file.filename,
  };
  db(sql, values, (err, result) => {
    console.log(err);
    if (err || result.affectedRows < 1) {
      res.json({ status: 1, message: "添加失败" });
    } else {
      res.json({ status: 0, message: "添加成功" });
    }
  });
});

// 获取英雄的接口
router.get("/heroeslist", async (req, res) => {
  // 接收请求参数，并设置默认值
  let pagenum = req.query.pagenum || 1; // 当前的页码
  // console.log(pagenum);
  let pagesize = req.query.pagesize || 2; // 每页显示多少条
  let keywords = req.query.keywords || ""; // 搜索关键字
  // console.log(keywords);

  // 根据关键字，设置查询添加
  let w = "";
  if (keywords) {
    w = ` where heroname like '%${keywords}%' or nickname like '%${keywords}%' `;
  }

  // 查询总记录数，并计算总页数
  let sql1 = "select count(*) cc from herose" + w;
  let sql2 = `select * from herose ${w} order by id limit ${
    (pagenum - 1) * pagesize
  }, ${pagesize}`;

  let res1 = await db2(sql1, null);
  let res2 = await db2(sql2, null);

  // 做出响应
  res.json({
    status: 0,
    message: "获取数据成功",
    data: res2,
    total: Math.ceil(res1[0].cc / pagesize),
  });
});

// 删除英雄的接口
router.get("/deletehero", (req, res) => {
  let id = req.query.id;
  if (!id || isNaN(id)) {
    res.json({ status: 1, message: "参数不正确" });
  }
  // 写SQL，完成删除
  db("delete from herose where id=?", id, (err, result) => {
    if (err || result.affectedRows < 1) {
      res.json({ status: 1, message: "删除失败" });
    } else {
      res.json({ status: 0, message: "删除成功" });
    }
  });
});

// 根据id获取一个英雄
router.get("/detail/:id", (req, res) => {
  // 获取动态参数id
  let id = req.params.id; // req.params是express提供的属性，直接拿来使用，不用设置中间件
  if (!id || isNaN(id)) {
    res.json({ status: 1, message: "id不可用" });
  }
  db("select * from herose where id=?", id, (err, result) => {
    if (err) return console.log(err);
    /*
        result = [{id: 1, heroname: 'xxx', nickname: 'yyy', ...}]
        * */
    console.log(result);
    res.json({
      status: 0,
      message: "获取一个英雄成功",
      data: result[0],
    });
  });
});

// 根据id，更新数据
router.post("/updatehero", upload.single("heroIcon"), (req, res) => {
  // console.log(req.file);
  // console.log(req.body);
  let values = {
    heroname: req.body.heroName,
    nickname: req.body.heroNickName,
    skill: req.body.skillName,
  };
  // 判断，用户有没有提交新的图片
  if (req.file) {
    values.img_url = req.file.filename;
  }
  //
  let sql = "update herose set ? where id = ?";
  db(sql, [values, req.body.id], (err, result) => {
    if (err || result.affectedRows < 1) {
      res.json({ status: 1, message: "更新失败" });
    } else {
      res.json({ status: 0, message: "更新成功" });
    }
  });
});

// 4. 导出路由对象
module.exports = router;
