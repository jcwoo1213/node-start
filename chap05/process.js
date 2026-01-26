const process = require("process");
const os = require("os");
console.log(os.arch());
console.log(os.cpus());
console.log(os.hostname());
console.log(os.networkInterfaces());

// for (let i = 1; i < 10; i++) {
//   console.log(`i=${i}`);
//   if (i == 5) {
//     process.exit(); //프로세스 종료
//   }
// }
console.log(process.env.Path.split(";"));
console.log(os.totalmem());
console.log(os.freemem());
console.log(os.tmpdir());
console.log(os.homedir());
