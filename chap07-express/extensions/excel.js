const xlsx = require("xlsx");
const pool = require("../db.js");
const workbook = xlsx.readFile("../uploads/엑셀연습1.xlsx");
const encoder = require("../crypto.js");
const firstSheetName = workbook.SheetNames[0];
const firstSheet = workbook.Sheets[firstSheetName];

const result = xlsx.utils.sheet_to_json(firstSheet);
console.log(result);

console.log(firstSheet["A3"].c);
console.log(firstSheet["A2"].v);
firstSheet["A2"].v = "change";

result.forEach(async (elem) => {
  console.log(elem);
  const { createPassword, salt } = await encoder.createPassword(
    String(elem.password),
  );
  try {
    await pool.query(
      "insert into member (user_id,user_pw,user_name,salt) values(?,?,?,?)",
      [elem.user_id, createPassword, elem.user_name, salt],
      (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(data);
      },
    );
  } catch (error) {
    if (error.errno) {
      pool.query(
        "update member set user_name=?,user_pw=?,salt=? where user_id=?",
        [elem.user_name, createPassword, salt, elem.user_id],
        (err, data) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(data);
        },
      );
    }
  }

  // console.log(result);
});
xlsx.writeFile(workbook, "../uploads/엑셀연습2.xlsx");
