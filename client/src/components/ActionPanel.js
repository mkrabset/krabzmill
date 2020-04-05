import React, {Component} from 'react'
import PropTypes from 'prop-types'

import up from "../arrow-up.png"
import down from "../arrow-down.png"
import left from "../arrow-left.png"
import right from "../arrow-right.png"


import config from '../config'


import "./ActionPanel.css"
import OnOffButtons from "./OnOffButtons"


const WAIT_INTERVAL = 200

class ActionPanel extends Component {
    constructor() {
        super()
        this.runStatusCycle = this.runStatusCycle.bind(this)
        this.updateRunStatus = this.updateRunStatus.bind(this)
        this.toggleCamera = this.toggleCamera.bind(this)
        this.reload_img = this.reload_img.bind(this)
        this.sendCommand = this.sendCommand.bind(this)
        this.runBatch = this.runBatch.bind(this)
        this.abortBatch = this.abortBatch.bind(this)
        this.togglePauseBatch = this.togglePauseBatch.bind(this)
        this.statusDescr = this.statusDescr.bind(this)
        this.toggleExpand = this.toggleExpand.bind(this)
        this.move = this.move.bind(this)
        this.zmove = this.zmove.bind(this)
        this.toggleBigMove=this.toggleBigMove.bind(this)
        this.state = {
            idle: true,
            paused: false,
            eta: "",
            percent: "",
            camOn: false,
            bigMove: false
        }
        this.runStatusCycle()

    }

    runStatusCycle() {
        this.updateRunStatus()
        setTimeout(this.runStatusCycle, WAIT_INTERVAL)
    }

    updateRunStatus() {
        fetch("http://" + config.host + ":" + config.apiPort + "/api/runstatus")
            .then(result => {
                    result.json().then(runStatus => {
                        if (runStatus.status === 'RUNNING') {
                            this.setState({
                                running: true,
                                paused: false,
                                eta: runStatus.eta,
                                percent: runStatus.percent
                            })
                        } else if (runStatus.status === 'PAUSED') {
                            this.setState({
                                running: true,
                                paused: true,
                                eta: runStatus.eta,
                                percent: runStatus.percent
                            })
                        } else {
                            this.setState({
                                running: false,
                                paused: false,
                                eta: "",
                                percent: ""
                            })
                        }
                    })
                }
            )
    }

    sendCommand(command) {
        fetch("http://" + config.host + ":" + config.apiPort + "/api/command", {
            method: "post",
            body: command
        }).then(result => {
                this.updateRunStatus()
            }
        )
    }

    runBatch() {
        this.props.onExecute()
        this.sendCommand("RUN")
    }

    togglePauseBatch() {
        this.sendCommand("HALTRESUME")
    }

    abortBatch() {
        this.sendCommand("ABORT")
    }

    reload_img() {
        var mjpeg_img = document.getElementById("mjpeg_dest")
        if (this.state.camOn) {
            mjpeg_img.src = "http://" + config.host + ":80/cam_pic.php?time=" + new Date().getTime()
            //mjpeg_img.src = "http://128.97.43.214/mjpg/video.mjpg?resolution=352x288&time=" + new Date().getTime();
        } else {
            mjpeg_img.src = null
        }
    }

    error_img() {
        setTimeout(this.reload_img, 100)
    }

    toggleCamera() {
        var camOn = !this.state.camOn
        this.setState({
            camOn: camOn
        }, () => {
            if (this.state.camOn) {
                var mjpeg_img = document.getElementById("mjpeg_dest")
                mjpeg_img.onload = this.reload_img
                mjpeg_img.onerror = this.error_img
                this.reload_img()
            }
        })
    }

    statusDescr() {
        if (this.state.running) {
            return this.state.paused ? "PAUSED" : "RUNNING"
        } else {
            return "IDLE"
        }
    }

    toggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        })
    }

    move(dir) {
        if (!this.state.running && this.props.connected) {
            this.sendCommand("MOVE_"+(this.state.bigMove ? "10":"1") +"_"+ dir)
        }
    }

    zmove(dir) {
        if (!this.state.running && this.props.connected) {
            this.sendCommand("Z_"+(this.state.bigMove ? "10":"1") +"_"+ dir)
        }
    }

    toggleBigMove() {
        this.setState({
            bigMove: !this.state.bigMove
        })
    }


    render() {
        return (
            <div id="actionpanel">
                <span>{this.statusDescr()}</span>
                <br/>
                <span>{this.state.percent}</span>
                <br/>
                <span>{this.state.eta}</span>
                <br/>
                <button onClick={this.runBatch} disabled={this.state.running || !this.props.connected}>EXECUTE</button>
                <button onClick={this.togglePauseBatch} disabled={!this.state.running}>PAUSE/RESUME</button>
                <button onClick={this.abortBatch} disabled={!this.state.running}>ABORT</button>
                <br/>
                <br/>
                <img id="mjpeg_dest" className={this.state.expanded ? "expanded" : ""} hidden={!this.state.camOn}
                     alt="CAM" onClick={this.toggleExpand}/>
                <button onClick={this.toggleCamera}>CAMERA {this.state.camOn ? "OFF" : "ON"}</button>
                <br/>
                <br/>
                <OnOffButtons title="All motors"
                              onAction={(() => {
                                  this.sendCommand("MOTORSON")
                              }).bind(this)}
                              offAction={(() => {
                                  this.sendCommand("MOTORSOFF")
                              }).bind(this)}/>
                <br/>
                <br/>
                <button onClick={(() => {
                    this.sendCommand("TOOLOFF")
                }).bind(this)}
                        disabled={this.state.running || !this.props.connected}>
                    Tool OFF (m5)
                </button>
                <button onClick={(() => {
                    this.sendCommand("TOOLMID")
                }).bind(this)}
                        disabled={this.state.running || !this.props.connected}>
                    Tool MID (m4)
                </button>
                <button onClick={(() => {
                    this.sendCommand("TOOLON")
                }).bind(this)}
                        disabled={this.state.running || !this.props.connected}>
                    Tool ON (m3)
                </button>
                <br/>
                <br/>
                <button onClick={(() => {
                    this.sendCommand("HOMEXY")
                }).bind(this)}
                        disabled={this.state.running || !this.props.connected}>
                    Home XY (g92 z0 g0 z2 g28 x0 y0 z2)
                </button>
                <br/>
                <br/>
                <button onClick={(() => {
                    this.sendCommand("RESETORIGIN")
                }).bind(this)}
                        disabled={this.state.running || !this.props.connected}>
                    Reset origin (g92 x0 y0)
                </button>
                <br/>
                <br/>
                <div align="center">
                    <table className={"wide"}>
                        <tr>
                            <th colspan={3}>XY</th>
                            <th>   </th>
                            <th colspan={1}>Z</th>
                        </tr>
                        <tr>
                            <td></td>
                            <td><img src={up} width={48} onClick={() => {this.move("UP")}}/></td>
                            <td></td>
                            <td></td>
                            <td><img src={up} width={48} onClick={() => {this.zmove("UP")}}/></td>
                        </tr>
                        <tr>
                            <td><img src={left} width={48} onClick={() => {this.move("LEFT")}}/></td>
                            <td><button onClick={this.toggleBigMove}>{this.state.bigMove?"10mm":"1mm"}</button></td>
                            <td><img src={right} width={48} onClick={() => {this.move("RIGHT")}}/></td>
                            <td></td>
                            <td><button onClick={this.toggleBigMove}>{this.state.bigMove?"10mm":"1mm"}</button></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><img src={down} width={48} onClick={() => {this.move("DOWN")}}/></td>
                            <td></td>
                            <td></td>
                            <td><img src={down} width={48} onClick={() => {this.zmove("DOWN")}}/></td>
                        </tr>
                    </table>
                </div>

            </div>
        )
    }
}

ActionPanel.propTypes = {
    onExecute: PropTypes.func.isRequired,
    connected: PropTypes.bool.isRequired
}

export default ActionPanel