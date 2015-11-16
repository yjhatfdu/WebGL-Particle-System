    module Engine{
       export class EventBase {
            listeners = {};

            dispatchEvent(event, args?) {
                if (!this.listeners[event]) {
                    return
                }
                for (var i in this.listeners[event]) {
                    var l = this.listeners[event][i];
                    l.listener( args,this);
                    if (l.useCapture) {
                        return
                    }
                }
            }

            addEventListener(event, listener, useCapture = false) {
                if (!this.listeners[event]) {
                    this.listeners[event] = []
                }
                this.listeners[event].push({listener: listener, useCapture: useCapture})
            }

            removeAllEventListenersOfEvent(event:string) {
                this.listeners[event] = [];
            }
        }
    }

