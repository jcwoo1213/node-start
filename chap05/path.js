const path = require("path");
console.log(__dirname); //현재경로
console.log(__filename); //실행중인파일

console.log(path.basename(__filename, ".js"));

console.log(path.format({ root: "/", base: "test", ext: "ignored" }));
