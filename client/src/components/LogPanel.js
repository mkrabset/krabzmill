import React, {Component} from 'react'
import PropTypes from 'prop-types';

import config from '../config'


import "./LogPanel.css"

const WAIT_INTERVAL = 500

class LogPanel extends Component {
    constructor() {
        super()
        this.state = {
            log: "",
            next: 0,
            autoscroll: true
        }
        this.runLogCycle = this.runLogCycle.bind(this)
        this.updateLog = this.updateLog.bind(this)
        this.toggleAutoscroll=this.toggleAutoscroll.bind(this)
        this.runLogCycle()
        this.logRef = React.createRef()
    }

    runLogCycle() {
        this.updateLog()
        setTimeout(this.runLogCycle, WAIT_INTERVAL)
    }

    updateLog() {
        fetch("http://" + config.host + ":" + config.apiPort + "/api/batchlog?from=" + this.state.next)
            .then(result => {
                    result.json().then(log => {
                        if (log.log.length > 0) {
                            this.setState({
                                log: this.state.log + "\n" + log.log.join("\n"),
                                next: log.next
                            })
                        } else {
                            this.setState({
                                next: log.next
                            })
                        }
                        this.scrollToBottom()
                    })
                }
            )
    }

    scrollToBottom = () => {
        if (this.state.autoscroll && this.logRef.current) {
            this.logRef.current.scrollTop = this.logRef.current.scrollHeight
        }
    }

    toggleAutoscroll(event) {
        this.setState({
            autoscroll: !this.state.autoscroll
        })
    }

    render() {
        return (
            <div id="logpanel">
                <div>
                    Autoscroll <input type="checkbox" checked={this.state.autoscroll} onChange={this.toggleAutoscroll}/>
                </div>
                <textarea ref={this.logRef} id="log" contentEditable={false} value={this.state.log}/>
            </div>
        )
    }
}

LogPanel.propTypes = {

};

export default LogPanel