const express = require("express");
const fs = require("fs");
const multer = require("multer");
const sampleRoute = require("./routes/sample.routes.js");
const path = require("path");
const pool = require("./db.js");
const encoder = require("./crypto.js");
const app = express(); //인스턴스 생성
const SERVER_PORT = 3000;
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

//라우팅.url :실행함수
app.use("/sample", sampleRoute);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static("images"));
//multer 설정

app.get("/", (req, res) => {
  res.send("첫페이지");
});
app.post("/upload", upload.single("user_img"), (req, res) => {
  // console.log(req.body);
  // console.log(req.file);
  res.json({
    user_name: req.body.user_name,
    age: req.body.age,
    file: req.file.filename,
  });
});
app.get("/getMember", async (req, res) => {
  const query = `select user_id,user_name,user_img from member`;
  try {
    const [rows, result] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
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

app.post("/create", upload.single("user_img"), async (req, res) => {
  // console.log(req.body);

  const { user_id, user_pw, user_name } = await req.body;
  const user_img = req.file ? req.file.filename : null;

  const { password, salt } = await encoder.createPassword(user_pw);
  // console.log(password, salt);
  const query = `insert into member (user_id,user_pw,user_name,user_img,salt) values(?,?,?,?,?);`;
  try {
    let result = await pool.query(query, [
      user_id,
      password,
      user_name,
      user_img,
      salt,
    ]);
    res.json({ retCode: "Success" });
  } catch (error) {
    console.log(error);
    const ufile = path.join(__dirname, "public/images", user_img);
    fs.unlink(ufile, (err) => {
      console.log(err);
    });
    res.json({ retCode: "NG", retMsg: error.sqlMessage });
  }
});

app.post("/login", async (req, res) => {
  const { login_id, login_pw } = req.body;
  // console.log(req.body);
  const query = `select * from member where user_id =?`;
  try {
    const [rows, result] = await pool.query(query, [login_id]);
    if (!rows.length) {
      res.json({ retCode: "Fail", retMsg: "아이디가 없습니다" });
      return;
    }
    console.log(rows[0]);
    const { user_id, user_pw, salt } = rows[0];
    // console.log(user_pw, salt);
    const check = await encoder.checkPassword(salt, login_pw, user_pw);
    // console.log(check);
    if (check) {
      res.json({
        retCode: "Success",
        name: rows[0].user_name,
        role: rows[0].responsibility,
        id: rows[0].user_id,
      });
    } else {
      res.json({ retCode: "Fail", retMsg: "비밀번호를 다시 확인해 주세요" });
    }
  } catch (error) {
    res.json({ retCode: "Error", retMsg: error });
  }
});
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const query = "delete from member where user_id = ?";
  try {
    const [filename, temp] = await pool.query(
      "select user_img from member where user_id =?",
      [id],
    );
    const file = filename[0].user_img;
    if (file) {
      const ufile = path.join(__dirname, "public/images", file);
      fs.unlink(ufile, (err) => {
        console.log(err);
      });
    }
    const result = await pool.query(query, [id]);
    res.json({ retCode: "Success" });
  } catch (error) {
    console.log(error);
    res.json({ retCode: "error", retMsg: error });
  }
});
app.listen(SERVER_PORT, () => {
  console.log(`서버실행 http://localhost:${SERVER_PORT}`);
});

app.post("/beacon-test", express.raw({ type: "*/*" }), (req, res) => {
  console.log("beacon 수신:", req.body.toString());
  res.status(204).end();
});
