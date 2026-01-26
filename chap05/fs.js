//파일생성.기록,읽기 동기,비동기방식 존재
const fs = require("fs");
//경로,인코딩방식,콜백함수 비동기방식
fs.readFile("path.js", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("-------------------------------------------------------");
  console.log(data);
  console.log("-------------------------------------------------------");
});
//동기방식
const val = fs.readFileSync("path.js", "utf-8");
console.log(val);

fs.write();
