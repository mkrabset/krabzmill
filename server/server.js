const express = require("express")
const cors=require("cors")
const app = express()
const port = 8080
const gcode_module = require('./gcode')
const command_module= require('./command')
const batchlog_module=require('./batchlog')
const serial_module=require('./serial')


app.use(cors());
app.get("/api/gcode", gcode_module.get)

app.post("/api/gcode", gcode_module.post)

app.post("/api/command", command_module.post)

app.get("/api/runstatus", (req, res) => {
    res.send(JSON.stringify(serial_module.runStatus()))
})

app.get("/api/connectStatus", (req, res) => {
    res.send(JSON.stringify(serial_module.status()))
})

app.get("/api/batchlog", (req, res) => {
    const from = parseInt(req.query.from)
    res.send(JSON.stringify(batchlog_module.getLog(from)))
})

app.use(express.static('static'))

app.listen(port, () => console.log(`Server listening on port ${port}!`))