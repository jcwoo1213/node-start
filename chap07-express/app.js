const express = require("express");
const app = express(); //인스턴스 생성
const fs = require("fs");
const multer = require("multer");
const SERVER_PORT = 3000;
const sampleRoute = require("./routes/sample.routes.js");
const path = require("path");
const pool = require("./db.js");
//라우팅.url :실행함수
app.use("/sample", sampleRoute);
app.use(express.static("public"));
// app.use(express.static("images"));
//multer 설정
const storage = multer.diskStorage({
  //저장경로
  destination: (req, file, cb) => {
    // console.log(file);
    cb(null, "public/images");
  },
  //파일이름
  filename: (req, file, cb) => {
    const file_name = Buffer.from(file.originalname, "latin1").toString("utf8");
    const { name, ext } = path.parse(file_name);
    // console.log(path.parse(file_name));
    cb(null, name + "_" + Date.now() + ext);
  },
});

const upload = multer({ storage }); //multer인스턴스
app.get("/", (req, res) => {
  res.send("첫페이지");
});
app.get("/test/:msg", (req, res) => {
  fs.writeFile("./test.txt", req.params.msg, "utf-8", (err, buf) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(buf);
  });
  res.send("/test페이지");
});
app.get("/read", (req, res) => {
  // const data = fs.readFileSync("./test.txt", "utf-8");
  // res.send(data);
  fs.readFile("./test.txt", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(data);
  });
});
app.post("/upload", upload.single("user_img"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.json({
    user_name: req.body.user_name,
    age: req.body.age,
    file: req.file.filename,
  });
});

app.post("/create", upload.single("user_img"), async function (req, res) {
  console.log(req.body);
  const { user_id, user_pw, user_name } = req.body;
  const user_img = req.file ? req.file.filename : null;
  const query = `insert into member (user_id,user_pw,user_name,user_img) values(?,?,?,?);`;
  let result = await pool.query(query, [user_id, user_pw, user_name, user_img]);
  res.json(result);
});
app.get("/upload", (req, res) => {
  console.clear();
  console.log(req.url);
  res.send();
});
app.listen(SERVER_PORT, () => {
  console.log(`서버실행 http://localhost:${SERVER_PORT}`);
});
