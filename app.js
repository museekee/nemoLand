const express = require("express")
const path = require("path")

const app = express()

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "web", "views"))

app.use("/assets", express.static(path.join(__dirname, "web", "assets")))

app.get("/", async (req, res) => {
    return res.render("land")
})

app.listen(80, () => {
    console.log("Server on [80]")
})