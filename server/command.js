const serial=require('./serial')
const gcode_module=require('./gcode')

const command_module = {
    post: (req, res) => {
        var command = ''
        req.on('data', (data) => {
            command += data
        })
        req.on('end', () => {
            //console.log("command: "+command.trim())
            switch (command.trim()) {
                case "CONNECT": {
                    connect()
                    break
                }
                case "DISCONNECT": {
                    disconnect()
                    break
                }
                case "RUN": {
                    run()
                    break
                }
                case "HALTRESUME": {
                    haltresume()
                    break
                }
                case "ABORT": {
                    abort()
                    break
                }
                case "MOTORSON": {
                    motorsOn()
                    break
                }
                case "MOTORSOFF": {
                    motorsOff()
                    break
                }
                case "TOOLON": {
                    toolOn()
                    break
                }
                case "TOOLMID": {
                    toolMid()
                    break
                }
                case "TOOLOFF": {
                    toolOff()
                    break
                }
                case "RESETORIGIN": {
                    resetOrigin()
                    break
                }
                case "HOMEXY": {
                    homeXY()
                    break
                }
                case "MOVE_10_UP": {
                    move(0,10)
                    break
                }
                case "MOVE_10_LEFT": {
                    move(-10,0)
                    break
                }
                case "MOVE_10_RIGHT": {
                    move(10,0)
                    break
                }
                case "MOVE_10_DOWN": {
                    move(0,-10)
                    break
                }
                case "MOVE_1_UP": {
                    move(0,1)
                    break
                }
                case "MOVE_1_LEFT": {
                    move(-1,0)
                    break
                }
                case "MOVE_1_RIGHT": {
                    move(1,0)
                    break
                }
                case "MOVE_1_DOWN": {
                    move(0,-1)
                    break
                }
            }
            res.end()
        })
    }
}

function connect() {
    serial.connect()
}

function disconnect() {
    serial.disconnect()
}

function run() {
    serial.run(gcode_module.getProgram());
}

function haltresume() {
    serial.haltResume()
}

function abort(){
    serial.abort()
}

function motorsOn() {
    serial.run(["m17"])
}

function motorsOff() {
    serial.run(["m18"])
}

function resetOrigin() {
    serial.run(["g92 x0 y0"])
}

function toolOn() {
    serial.run(["m3"])
}

function toolMid() {
    serial.run(["m4"])
}

function toolOff() {
    serial.run(["m5"])
}

function move(x,y) {
    serial.run(["g91",`g1 x${x} y${y}`,"g90"])
}

function homeXY() {
    serial.run(['g92 z0','g0 z2','g28 x0 y0 z2'])
}


module.exports = command_module