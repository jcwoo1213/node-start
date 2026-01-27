const path = require("path");
console.log(__dirname); //현재경로
console.log(__filename); //실행중인파일

console.log(path.basename(__filename, ".js"));

console.log(
  path.format({
    root: "/ignored", //루트 (경로 입력시 무시)
    dir: "home/user/dir", //경로
    base: "test", //파일
  }),
);

console.log(
  path.format({
    root: "/test2",
    dir: "/home/testdir",
    name: "test2", // 파일명 base있으면 무시
    base: "test", // 파일명+확장자
    ext: "ignored", //확장자() base 있으면 무시
  }),
);
console.log(
  path.format({
    root: "/",
    name: "file",
    ext: ".txt",
  }),
);
console.log(path.isAbsolute("D:/Dev/node-start/chap05/output/error.txt"));
console.log(path.isAbsolute("/output"));
console.log(path.join("a", "b", "c", "test.txt"));
console.log(
  path.parse(
    path.format({
      root: "D:/",
      name: "file",
      ext: ".txt",
    }),
  ),
);

console.log(path.win32.sep);
