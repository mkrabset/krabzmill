var gcode=[];

const gcode_module = {

    get: (req, res) => {
        gcode.forEach((line) => {
            res.write(line + "\n")
        })
        res.end()
    },

    post: (req, res) => {
        var new_gcode = []
        var prefix = ''
        req.on('data', (data) => {
            const line = '' + data
            var splitted = line.replace(/\r\n/, '\n').split('\n')
            splitted.forEach((val, ind) => {
                prefix += val
                if (ind < splitted.length - 1) {
                    new_gcode.push(prefix)
                    prefix = ''
                }
            })
            if (line.endsWith('\n')) {
                new_gcode.push(prefix)
                prefix = ''
            }
        })

        req.on('end', () => {
            if (prefix != '') {
                new_gcode.push(prefix)
            }
            gcode = new_gcode
            console.log(`GCODE is now ${gcode.length} lines`)
            res.status(200).send(`OK. Got ${gcode.length} lines.`)
        })
    },
    getProgram: () => {
        return gcode.slice()
    }
}

module.exports=gcode_module