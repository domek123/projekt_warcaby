const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const path = require("path");

app.use(express.static("static"));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

let currentTab = [
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
];
let isInteraction = false;
let posToRemove = null;

let users = [];

let isLost = false;

app.get("/", (req, res) => {
  console.log("a");
  res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.post("/login", (req, res) => {
  const { login } = req.body;
  if (users.length < 2) {
    users.push(login);
    res.end(
      JSON.stringify(
        {
          login,
          number: users.length,
          oponent: users.length == 2 ? users[0] : users[1],
        },
        5,
        null
      )
    );
  } else {
    res.end(JSON.stringify({ isFull: true }));
  }
});

app.get("/reset", (req, res) => {
  users = [];
  currentTab = [
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
  ];
  isInteraction = false;
  isLost = false;
  res.end(JSON.stringify({ info: "array cleared" }));
});

app.get("/waiting", (req, res) => {
  res.end(
    JSON.stringify({
      login: users[0],
      len: users.length,
      number: users.length,
      oponent: users.length == 2 ? users[1] : users[0],
    })
  );
});

app.post("/updateTab", (req, res) => {
  const { startPos, endPos, itemToRemove } = req.body;
  let item = currentTab[startPos.z][startPos.x];
  currentTab[startPos.z][startPos.x] = 0;
  currentTab[endPos.z][endPos.x] = item;
  if (itemToRemove != null) {
    currentTab[itemToRemove.z][itemToRemove.x] = 0;
    posToRemove = itemToRemove;
    console.log(itemToRemove);
  }
  isInteraction = true;

  res.end(JSON.stringify({ currentTab }));
});

app.get("/firstTry", (req, res) => {
  res.end(JSON.stringify({ isInteraction, currentTab }));
});

app.post("/isEquals", (req, res) => {
  const { pionki } = req.body;

  if (JSON.stringify(pionki) === JSON.stringify(currentTab)) {
    res.end(JSON.stringify({ info: "equal" }));
  } else {
    let posToRem = Object.assign({}, posToRemove);
    posToRemove = null;
    res.end(JSON.stringify({ info: "not equal", currentTab, posToRem }));
  }
});

app.get("/checkIsLose", (req, res) => {
  res.end(JSON.stringify({ isLost }));
});

app.get("/setLose", (req, res) => {
  isLost = true;
  res.end(JSON.stringify({ info: "lost" }));
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
