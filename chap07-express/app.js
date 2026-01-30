require("dotenv").config();
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const sampleRoute = require("./routes/sample.routes.js");
const path = require("path");
const pool = require("./db.js");
const encoder = require("./crypto.js");
const xlsx = require("xlsx");
const transporter = require("./extensions/nodemailer.js");
const { error } = require("console");
// const cron_job = require("./extensions/nodecron.js");

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

const storage2 = multer.diskStorage({
  //저장경로
  destination: (req, file, cb) => {
    // console.log(file);
    cb(null, "etc");
  },
  //파일이름
  filename: (req, file, cb) => {
    const file_name = Buffer.from(file.originalname, "latin1").toString("utf8");
    const { name, ext } = path.parse(file_name);
    // console.log(path.parse(file_name));
    cb(null, name + "_" + Date.now() + ext);
  },
});
const upload2 = multer({ storage: storage2 });
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

  const { createPassword, salt } = await encoder.createPassword(user_pw);
  // console.log(password, salt);
  const query = `insert into member (user_id,user_pw,user_name,user_img,salt) values(?,?,?,?,?)`;
  try {
    let result = await pool.query(query, [
      user_id,
      createPassword,
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
app.get("/members/:to", async (req, res) => {
  const to = req.params.to;
  const query = `select * from member where responsibility="User"`;
  const [result, sec] = await pool.query(query);

  let html = `<table>
        <thead>
          <tr>
            <th>id</th>
            <th>이름</th>
            <th>이미지</th>
          </tr>
        </thead>
        <tbody>`;
  // </tbody>`;
  for (const member of result) {
    const tr = `<tr>
              <td>${member.user_id}</td>
              <td>${member.user_name}</td>
              <td><img
                src="http://192.168.0.34:3000/images/${member.user_img ? member.user_img : "default.jpg"}"
                alt="${member.user_name}"
                class="img-thumbnail"
                width="80"
              />
              </td>
            </tr>`;
    html += tr;
  }
  html += `</tbody>`;
  let options = {
    from: process.env.user,
    to,
    subject: "user list",
    html,
  };
  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
      res.json({ retCode: "Fail", err });
      return;
    }
    res.json({ retCode: "Success", info });
    console.log(info);
  });
});
app.post("/mail_send", upload.single("attachments"), async (req, res) => {
  const { to, subject, text } = req.body;
  // console.log(req.file);
  const attachments = req.file ? req.file.filename : null;
  // console.log(attachments);
  let options = {
    from: process.env.user,
    to,
    subject: "회원 목록",
    text,
  };
  if (attachments) {
    options.attachments = [
      {
        filename: req.file.originalname,
        path: path.join(__dirname, "public/images", attachments),
      },
    ];
  }
  transporter.sendMail(options, (err, info) => {
    if (attachments) {
      const ufile = path.join(__dirname, "public/images", attachments);
      fs.unlink(ufile, (err) => {
        console.log(err);
      });
    }
    if (err) {
      console.log(err);
      res.json({ retCode: "Fail", err });
      return;
    }
    res.json({ retCode: "Success", info });
    console.log(info);
  });
});

// app.get("/start", (req, res) => {
//   cron_job.start();
//   res.send("시작");
// });
// app.get("/end", (req, res) => {
//   cron_job.stop();
//   res.send("끝");
// });
app.post("/beacon-test", express.raw({ type: "*/*" }), (req, res) => {
  console.log("beacon 수신:", req.body.toString());
  res.status(204).end();
});
//인증메일 전송
app.get("/checkMailSend/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const token = encoder.makeToken();
    const tokenhash = encoder.hashToken(token);
    const [result, temp] = await pool.query(
      "select 1 from certification where user_id=?",
      [id],
    );
    if (result.length) {
      await pool.query("delete from certification where user_id=?", [id]);
    }
    const expired = new Date(Date.now() + 10 * 60 * 1000);
    const query = "insert into certification values(?,?,?)";
    await pool.query(query, [id, tokenhash, expired]);
    let options = {
      from: process.env.user,
      to: "jcwoo1213@naver.com",
      subject: "인증 테스트",
      html: `<a href="http://localhost:3000/checkmail/${token}">인증하러가기</a>`,
    };
    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(info);
    });
    res.send("전송완료");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
//메일 인증
app.get("/checkmail/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const tokenhash = encoder.hashToken(token);
    const query =
      "select user_id from certification where hashval=? AND expired > CURRENT_TIMESTAMP";
    const [result, temp] = await pool.query(query, [tokenhash]);
    console.log(result.length);
    if (!result.length) {
      res.json({ retCode: "Fail", retMsg: "만료된 인증입니다" });
      return;
    }
    await pool.query("delete from certification where hashval=?", [tokenhash]);
    res.json({ retCode: "OK", id: result[0].user_id });
  } catch (err) {
    console.log(err);
    res.json({ retCode: "error", error });
  }
});
//엑셀 업로드 -> 신규회원 추가
//post url:/upload/member
app.post("/upload/member", upload2.single("upload_file"), async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const file = req.file.filename;
    const workbook = xlsx.readFile(`etc/${file}`);
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];
    const result = xlsx.utils.sheet_to_json(firstSheet);
    const query = `insert into member (user_id,user_pw,user_name,salt) values(?,?,?,?)`;

    for (const element of result) {
      // console.log(element);
      const { user_id, user_name, user_pw } = element;
      const { createPassword, salt } = await encoder.createPassword(user_pw);
      // console.log(user_id, user_name, password, salt);
      await connection.query(query, [user_id, createPassword, user_name, salt]);
    }
    connection.commit();
    connection.release();
    res.json({ retCode: "Success" });
  } catch (error) {
    console.log(error);
    connection.rollback();
    res.json({ retCode: "Fail", error });
  }
});
