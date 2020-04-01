import React, {Component} from 'react'
import PropTypes from 'prop-types'

class OnOffButtons extends Component {
    constructor() {
        super()
    }

    render() {
        return <div>
            <button onClick={this.props.onAction}>{this.props.title} ON</button>
            <button onClick={this.props.offAction}>{this.props.title} OFF</button>
        </div>
    }
}

OnOffButtons.propTypes = {
    title: PropTypes.string.isRequired,
    onAction: PropTypes.func.isRequired,
    offAction: PropTypes.func.isRequired
}

export default OnOffButtons