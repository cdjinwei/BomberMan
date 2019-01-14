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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    InitView(posMap, level, spriteSheet){
        this._sprite_sheet = spriteSheet;
        this._tick = 4;
        this._fires = [];
        for(let info of posMap){
            this._fires.push(this.CreateFire(info));
        }

        let _index = 0;
        this.schedule(() => {
            this.UpdateFire(++_index);
        }, 0.1, 4);
    },

    CreateFire(info){
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this._sprite_sheet.getSpriteFrame(`${info.type}1`);
        node._fire_type = info.type;
        node.anchorX = 0;
        node.anchorY = 0;
        node.parent = this.node;
        node.position = info.pixPos;//this._floor_layer.getPositionAt(info.position);
        return node;
    },

    UpdateFire(index){
        for( let fire of this._fires){
            if(index > 4){
                fire.destroy();
                //notify clean fire position
            }else{
                fire.getComponent(cc.Sprite).spriteFrame = this._sprite_sheet.getSpriteFrame(`${fire._fire_type}${index}`);
            }
        }
    }
    // update (dt) {},
});
