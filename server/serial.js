var fs = require('fs')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const devicePrefixes = ["/dev/ttyUSB", "/dev/ttyACM"]
const batchlog_module = require('./batchlog')

const baudrate = 115200


const serial = {
    port: null,
    running: false,
    halted: false,
    aborted: false,
    eta: "",
    connect: () => {
        doConnect()
    },
    disconnect: () => {
        doDisconnect()
    },
    status: () => getStatus(),
    run: (program) => {
        if (serial.port !== null) {
            const programToRun = program
                .map(line => line.split("//").shift().trim())
                .map(line => line.split("--").shift().trim())
                .map(line => line.split("#").shift().trim())
                .filter(line => line.length > 0)
            if (programToRun.length>0) {
                doRun(programToRun)
            }
        }
    },
    runStatus: () => {
        if (serial.running) {
            return {
                status: serial.halted ? "PAUSED" : "RUNNING",
                eta: serial.eta
            }
        } else {
            return {status: "IDLE"}
        }
    },
    haltResume: () => {
        if (serial.port === null) {
            console.log("Not connected, serial.port is null")
            return
        }
        if (serial.halted) {
            serial.halted = false
            serial.port.resume()
        } else {
            serial.port.pause()
            serial.halted = true
        }
    },
    abort: () => {
        if (serial.port === null) {
            console.log("Not connected, serial.port is null")
            return
        }
        if (serial.running) {
            serial.aborted = true
            if (serial.halted) {
                serial.halted = false
                serial.port.resume()
            }
        }
    }
}

function doConnect() {
    if (serial.port === null) {
        SerialPort.list().then(
            ports => {
                const livePorts = ports.filter(p => p.manufacturer !== undefined)
                if (livePorts.length > 0) {
                    const deviceFile = livePorts[0].comName
                    const p = new SerialPort(deviceFile, {baudRate: baudrate, autoOpen: true}, (err) => {
                        if (err) {
                            console.log(`Open failed: ${err}`)
                            serial.port = null
                        } else {
                            batchlog_module.reset()
                            console.log("Connected to: " + deviceFile)
                            serial.port = p
                            serial.aborted = false
                            serial.running = false
                            serial.halted = false

                            const parser = new Readline()
                            p.pipe(parser)
                            parser.on('data', line => {
                                batchlog_module.log("INIT " + line)
                                if (line.trim() === "READY") {
                                    p.unpipe(parser)
                                    batchlog_module.log("--------------------")
                                    serial.port = p
                                    serial.aborted = false
                                    serial.running = false
                                    serial.halted = false
                                }
                            })
                        }
                    })
                }
            }
        )
    }
}

function doDisconnect() {
    if (serial.port !== null) {
        serial.port.close((err) => {
            if (err) {
                console.log("Failed to close serial port " + serial.port.path)
            } else {
                console.log("Serial port " + serial.port.path + " closed.")
                serial.port = null
            }
        })
    }
}

function getStatus() {
    return (serial.port === null)
        ? {connected: false}
        : {connected: true, device: serial.port.path}
}

function updateEta(starttime, line, lines) {
    serial.eta = "" + Math.round(line / lines * 100) + "%"
}

function doRun(program) {
    if (serial.port !== null && serial.runstate !== "RUNNING") {
        serial.running = true
        serial.halted = false
        batchlog_module.reset()
        var index = 0
        const parser = new Readline()
        serial.port.pipe(parser)
        parser.on('data', line => {
            batchlog_module.log("RECV " + line)
            updateEta(0, index, program.length)
            if (line.startsWith(">")) {
                if (index < program.length && !serial.aborted) {
                    const instr = program[index++]
                    serial.port.write(instr + "\n")
                    batchlog_module.log("SEND " + instr)
                } else {
                    serial.running = false
                    serial.halted = false
                    serial.aborted = false
                    serial.port.unpipe(parser)
                    serial.eta = ""
                    console.log("DONE")
                }
            }
        })
        serial.port.write("-- m999\n")
    }
}

module.exports = serial