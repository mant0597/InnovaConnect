const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("investor");
});

server.listen(3001, () => {
    console.log("Investor dashboard running on port 3001");
});
