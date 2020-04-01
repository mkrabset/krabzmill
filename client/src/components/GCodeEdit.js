import React, {Component} from 'react';

import "./GCodeEdit.css"
import config from '../config'


const WAIT_INTERVAL = 1000;

class GCodeEdit extends Component {
    constructor() {
        super();
        this.state = {
            gcode: "",
            status: "OutOfSync"
        }
        this.refreshGCode();
        this.handleChange = this.handleChange.bind(this);
        this.updateGCode = this.updateGCode.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
        this.clearGCode = this.clearGCode.bind(this);
        this.hasUncommittedChanges=false;
    }




    componentWillMount() {
        this.timer = null;
    }

    refreshGCode() {
        fetch("http://"+config.host+":"+config.apiPort+"/api/gcode")
            .then(response => {
                response.text().then(data => {
                    this.setState({gcode: data, status: "InSync"});
                })
            })
    }

    handleChange(e) {
        this.hasUncommittedChanges=true;
        this.setState({status: "OutOfSync", gcode: e.target.value});
        clearTimeout(this.timer);
        this.timer = setTimeout(this.updateGCode, WAIT_INTERVAL);
    }

    updateGCode() {
        this.uploadAndSetGCode(this.state.gcode);
    }

    uploadAndSetGCode(gcode) {
        this.hasUncommittedChanges=false;
        fetch("http://"+config.host+":"+config.apiPort+"/api/gcode",
            {
                method: "post",
                body: gcode
            })
            .then(response => {
                response.text().then(data => {
                    if (!this.hasUncommittedChanges) {
                        this.setState({status: "InSync", gcode: gcode});
                    }
                })
            })
    }




    fileUpload(e) {
        const gcodeEdit = this;

        this.setState({status: "OutOfSync"});
        var reader = new FileReader();

        reader.onload = function (event) {
            const contents = event.target.result;
            gcodeEdit.uploadAndSetGCode(contents);
        };

        reader.readAsText(e.target.files[0]);
    }

    clearGCode() {
        this.setState({gcode: "", status: "OutOfSync"});
        this.uploadAndSetGCode("");
    }


    render() {
        return (
            <div id="gcodeedit">
                <div>
                    <div id="upload">
                        <strong>Upload:</strong>
                        <input id="gcodeupload" type="file" onChange={this.fileUpload}/>
                    </div>
                    <button id="cleargcode" onClick={this.clearGCode}>Clear</button>
                    <br/>
                </div>
                <textarea id="gcode" className={this.state.status} value={this.state.gcode}
                          onChange={this.handleChange}></textarea>

            </div>
        )
            ;
    }
}

export default GCodeEdit