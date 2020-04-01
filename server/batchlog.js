const batchlog = {
    maxSize: 10000,
    sliceSize: 1000,
    startId: 0,
    lines: [],
    log: (line)=>doLog(line),
    getLog: (fromId)=>getLog(fromId),
    reset: () => {
        batchlog.lines=[]
        batchlog.startId=0
    }
}

function doLog(line) {
    console.log(line)
    batchlog.lines.push(line)
    if (batchlog.lines.length > batchlog.maxSize) {
        batchlog.lines = batchlog.lines.slice(batchlog.sliceSize)
        batchlog.startId += batchlog.sliceSize
    }
}

function getLog(fromId) {
    fromId=Math.max(fromId,batchlog.startId)
    const startIndex=fromId-batchlog.startId
    return {
        log: batchlog.lines.slice(startIndex),
        next: batchlog.startId+batchlog.lines.length
    }
}

module.exports=batchlog