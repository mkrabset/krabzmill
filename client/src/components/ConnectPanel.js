import React, {Component} from 'react'

import "./ConnectPanel.css"
import config from "../config"


const WAIT_INTERVAL = 2000

class ConnectPanel extends Component {
    constructor() {
        super()
        this.updateConnectStatus = this.updateConnectStatus.bind(this)
        this.connectStatusCycle = this.connectStatusCycle.bind(this)
        this.sendCommand = this.sendCommand.bind(this)
        this.connect = this.connect.bind(this)
        this.disconnect = this.disconnect.bind(this)
        this.state = {
            connected: false,
            device: ""
        }
        this.connectStatusCycle()
    }

    connectStatusCycle() {
        this.updateConnectStatus()
        setTimeout(this.connectStatusCycle, WAIT_INTERVAL)
    }

    updateConnectStatus() {
        fetch("http://" + config.host + ":" + config.apiPort + "/api/connectStatus")
            .then(result => {
                    result.json().then(connectStatus => {
                        if (connectStatus.connected) {
                            this.setState({connected: true, device: connectStatus.device})
                        } else {
                            this.setState({connected: false})
                        }
                        this.props.onConnectChange(connectStatus.connected)
                    })
                }
            )
    }

    connect() {
        this.props.preConnect()
        this.sendCommand("CONNECT")
    }

    disconnect() {
        this.sendCommand("DISCONNECT")
    }

    sendCommand(command) {
        fetch("http://" + config.host + ":" + config.apiPort + "/api/command", {
            method: "post",
            body: command
        }).then(result => {
                result.text().then(resp => {
                    this.updateConnectStatus()
                })
            }
        )
    }


    render() {
        return (
            <div id="connectpanel">
                <label>STATUS:</label>
                <span id="status"
                      className={this.state.connected ? "green" : "red"}>{this.state.connected ? "ONLINE" : "OFFLINE"}</span><br/>
                <label>Device:</label>
                <span id="device">{this.state.device}</span><br/>
                {
                    this.state.connected
                        ? <button id="disconnectbutton" onClick={this.disconnect}>DISCONNECT</button>
                        : <button id="connectbutton" onClick={this.connect}>CONNECT</button>
                }
            </div>
        )
    }
}

export default ConnectPanel