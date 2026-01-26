const crypto = require("crypto");
const pw = crypto.createHash("sha512").update("pw1234").digest("base64"); //암호화방식,평문,인코딩방식
// console.log(pw);
const createSalt = () => {
  return new Promise((res, rej) => {
    crypto.randomBytes(64, (err, buf) => {
      //크기 ,콜백함수
      if (err) rej(err);
      res(buf.toString("base64"));
    });
  });
};
// createSalt("pw1234")
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// createSalt("pw1234")
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
const createPassword = async (plainPassword) => {
  const salt = await createSalt();

  // console.log(salt);
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, 100000, 64, "sha512", (err, key) => {
      //평문,소금값,반복횟수,암호화길이,암호화 방식
      if (err) reject(err);
      resolve({ password: key.toString("base64"), salt });
    });
  }); //비동기->동기
};
// createSalt("pw1234").then((res) => {
//   console.log(res);
// });

const createPassword2 = async (plainPassword, salt) => {
  // console.log(salt);
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, 100000, 64, "sha512", (err, key) => {
      //평문,소금값,반복횟수,암호화길이,암호화 방식
      if (err) reject(err);
      resolve({ password: key.toString("base64"), salt });
    });
  }); //비동기->동기
};
// createPassword2("pw1234", salt).then((res) => {
//   // console.log(res);
// });
createPassword("pw1234")
  .then((res) => {
    console.log(res);
    // console.log(salt);
    // console.log(res.salt);
    return res.salt;
  })
  .then((salt) => {
    createPassword2("pw1234", salt).then((res) => {
      console.log(res);
    });
  })

  .catch((err) => console.log(err));
