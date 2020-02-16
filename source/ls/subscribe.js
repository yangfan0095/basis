class publisher {
    constructor() {
        this.subscribers = {
            any: []
        }
    }
    subscribe(fn, type = 'any') {
        if (typeof this.subscribers[type] === 'undefined') {
            this.subscribers[type] = []
        }
        this.subscribers[type].push(fn)
    }
    unsubscribe(fn, type) {
        this.visitSubscribers('unsubscribe', fn, type)
    }
    publish(publication, type) {
        this.visitSubscribers('publish', publication, type)
    }
    visitSubscribers(action, arg, type = 'any') {
        this.subscribers[type].forEach((currentValue, index, array) => {
            if (action === 'publish') {
                currentValue(arg)
            } else if (action === 'unsubscribe') {
                if (currentValue === arg) {
                    this.subscribers[type].splice(index, 1)
                }
            }
        })
    }
}

let publish = new publisher();

let funcA = function(cl) {
    console.log('msg1' + cl)
}
let funcB = function(cl) {
    console.log('msg2' + cl)
}

publish.subscribe(funcA)
publish.subscribe(funcB)
publish.unsubscribe(funcB)

publish.publish(' in publisher')     // msg1 in publisher