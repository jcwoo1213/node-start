const crypto = require("crypto");

const createSalt = () => {
  return new Promise((res, rej) => {
    crypto.randomBytes(64, (err, buf) => {
      //크기 ,콜백함수
      if (err) rej(err);
      res(buf.toString("base64"));
    });
  });
};
const createPassword = async (plainPassword) => {
  const salt = await createSalt();
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, 100000, 64, "sha512", (err, key) => {
      //평문,소금값,반복횟수,암호화길이,암호화 방식
      if (err) reject(err);
      resolve({ createPassword: key.toString("base64"), salt });
    });
  }); //비동기->동기
};
const checkPassword = async (salt, plainPassword, password) => {
  // crypto.
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, 100000, 64, "sha512", (err, key) => {
      //평문,소금값,반복횟수,암호화길이,암호화 방식
      if (err) reject(err);
      resolve(key.toString("base64") === password);
    });
  });
};
const makeToken = () => {
  return crypto.randomBytes(32).toString("base64url");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
module.exports = {
  createSalt,
  createPassword,
  checkPassword,
  makeToken,
  hashToken,
};
