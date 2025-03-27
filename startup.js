const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("startup");
});

server.listen(3002, () => {
    console.log("Startup dashboard running on port 3002");
});
