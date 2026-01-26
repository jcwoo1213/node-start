//writefile,writefilesync
const fs = require("fs");
let data = fs.readFileSync("output/stdout.log", "utf8") + "\ntesttest";
fs.writeFile("output/stdout.log", data, "utf8", (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("파일쓰기 완료");
});

// const res = fs.writeFileSync("output/error.log", data, "utf8");
// console.log(res);
