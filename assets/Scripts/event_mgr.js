class EventMgr {

    constructor(param) {
        console.log(`init EventMgr ${param}`);
        this.event_list = [];
    }
    register_event(listener) {
        this.event_list.push(listener);
    }
    unregister_event(listener) {
        for(let index in this.event_list){
            if(this.event_list[index] == listener){
                this.event_list.splice(index, 1);
                break;
            }
        }
    }
    fire_event(ev) {
        for(let listener of this.event_list){
            listener(ev);
        }
    }
}

window.EventMgr = new EventMgr('test param');