import React, {Component} from 'react'
import logo from './logo.png'
import './App.css'
import GCodeEdit from './components/GCodeEdit'
import ConnectPanel from './components/ConnectPanel'
import ActionPanel from './components/ActionPanel'
import LogPanel from './components/LogPanel'

class App extends Component {

    constructor() {
        super()
        this.state = {
            connected: false
        }

        this.onConnectChange = this.onConnectChange.bind(this)
        this.onExecute = this.onExecute.bind(this)
        this.clearBatchLog = this.clearBatchLog.bind(this)
        this.batchLogRef = React.createRef()
    }

    onConnectChange(connected) {
        this.setState({
            connected: connected
        })
    }

    onExecute() {
        this.clearBatchLog()
        console.log("EXEC")
    }

    clearBatchLog() {
        this.batchLogRef.current.setState({log: "", next: 0})
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" id="logo"/>
                    <ConnectPanel onConnectChange={this.onConnectChange} preConnect={this.clearBatchLog}/>
                </header>
                <div id="appContainer">
                    <div id="leftPanel">
                        <div className="header">GCODE</div>
                        <GCodeEdit/>
                    </div>
                    <div id="middlePanel">
                        <div className="header">ACTION</div>
                        <ActionPanel onExecute={this.onExecute.bind(this)}
                                     connected={this.state.connected}/>
                    </div>
                    <div id="rightPanel">
                        <div className="header">LOG</div>
                        <LogPanel ref={this.batchLogRef}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default App
