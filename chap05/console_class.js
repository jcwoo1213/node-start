const fs = require("fs");
//stream활용 파일생성
const output = fs.createWriteStream("./output/stdout.log", { flags: "a" }); //쓰기전용 파일 생성,flags a
const errOutput = fs.createWriteStream("./output/error.log", { flags: "a" });
const { Console } = require("console");
console.log(console);
const logger = new Console({ stdout: output, stderr: errOutput }); //로그,에러 =>따로
console.error("error");
console.log("log");
console.log(logger);
logger.log(`[${new Date()}]:hello,world`);
logger.error(`[${new Date()}]error`);
let count = 0;
const job = setInterval(() => {
  console.log(count);
  count++;

  if (count > 10) {
    console.log("end");
    clearInterval(job);
  }
}, 1000);
