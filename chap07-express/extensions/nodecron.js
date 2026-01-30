require("dotenv").config({ path: "../.env" });
const cron = require("node-cron");
const transporter = require("./nodemailer.js");
console.log(process.env.user);
let options = {
  from: process.env.user,
  to: "jcwoo1213@naver.com",
  subject: "test",
  text: "test",
};
const cron_job = cron.schedule(
  "0,5,10,15,20,25,30,35,40,45,50,55 * * * * *",
  () => {
    (transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log(err);
      }

      console.log(info);
    }),
      {
        scheduled: false,
      });
  },
);

module.exports = cron_job;
