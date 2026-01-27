const express = require("express");
const router = express.Router();
const fs = require("fs");
// router.get("/", (req, res) => {
//   res.send("/sample 루트");
// });

router.get("/", (req, res) => {
  const text = fs.readFileSync("./sample.html", "utf-8", (err) => {
    res.status(500).send(err);
  });
  console.log(text);
  if (text) {
    res.status(200).send(text);
  }
  // res.send(text);
  // res.sendFile(__dirname + "/sample.html");
  // res.redirect("sample.html");
  // res.render("./sample", { name: "name" });ejs 사용가능
});

router.get("/test/:msg", (req, res) => {
  fs.writeFile("../test.txt", req.params.msg, "utf-8", (err, buf) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(buf);
  });
  res.send("/test페이지");
});
module.exports = router;
