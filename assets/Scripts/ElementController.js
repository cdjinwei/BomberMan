// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this._event_handler = this.HandleEvent.bind(this);
        window.EventMgr.register_event(this._event_handler);
    },

    onDestroy(){
        window.EventMgr.unregister_event(this._event_handler);
    },

    InitElement(type, tilePosition, stoneMap){
        this._type = type;
        this._tile_pos = tilePosition;
        this._stoneMap = stoneMap;
    },

    GetElementType(){
        return this._type;
    },

    HandleEvent(ev){
        switch(ev.event_type){
            case EventType.EVENT_ADD_FIRE:
                this.CheckSelfAlive(ev.pos_map);
                break;
        }
    },

    CheckSelfAlive(posMap){
        for (let pos of posMap) {
            if(pos.x == this._tile_pos.x && pos.y == this._tile_pos.y){
                this.DestroySelf(pos);
                break;        
            }
        }
    },

    DestroySelf(pos){
        this._stoneMap[pos.y][pos.x] = undefined;
        this.node.destroy();
    }
    // update (dt) {},
});
