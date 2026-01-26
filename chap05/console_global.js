console.log(`Hello`);
console.error(`err`);

const ary = [
  {
    name: "홍길동",
    age: 20,
  },
  {
    name: "홍길동",
    age: 20,
  },
  {
    name: "홍길동",
    age: 20,
  },
  {
    name: "홍길동",
    age: 20,
  },
];
console.table(ary);

console.dir(ary);
const obj = {
  level1: {
    name: "depth1",
    level2: {
      name: "depth2",
      level3: {
        name: "depth3",
        level4: {
          name: "depth4",
          level5: {
            name: "depth5",
            value: "끝!",
          },
        },
      },
    },
  },
};
console.dir(obj);
console.dir(obj, { depth: 5, colors: true }); //깊이가 있는거 출력
console.time("time check");
for (let i = 1; i < 1000000; i++) {}
console.timeEnd("time check");
console.count(ary);
