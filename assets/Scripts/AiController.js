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

    start() {
        // this.InitAi();
    },

    /**
     * 初始化角色AI
     * @param {Number} aiLevel ai等级 
     * @param {*} wall_layer 土墙
     * @param {*} block_layer 铁墙
     */
    InitAi(roleInfo, mapInfo) {
        //当前位置被堵住的方向
        this._blocked_direction = [];
        this._ai_level = roleInfo.aiLevel;
        this._wall_layer = mapInfo.wall_layer;
        this._block_layer = mapInfo.block_layer;
        this._floor_layer = mapInfo.floor_layer;
        //初始默认朝右边移动
        this._cur_direction = DirectionType.RIGHT;
        //设置起始位置
        this.SetRolePosition(roleInfo.position);
        this.schedule(this.UpdateAiAction, 0.3);
        this.UpdateAiAction();
    },

    /**
     * AI行动
     */
    UpdateAiAction() {
        let next_position = this.node._tile_pos.clone();
        let next_direction = this.GetNextDirection();
        this.GetNextPosition(next_direction, next_position);
        if (this.CanMove(next_position)) {
            this._cur_direction = next_direction;
            this._blocked_direction = [];
            this.SetRolePosition(next_position);
        } else {
            this._blocked_direction.push(next_direction);
        }
    },

    /**
     * 获取AI的下一个移动方向
     */
    GetNextDirection() {
        let next_dir;
        if (this._blocked_direction.length == 4) {
            //role被四面围堵
            next_dir = window.DirectionList[(Math.floor(Math.random() * 10)) % 4];
        } else if (this._blocked_direction.indexOf(this._cur_direction)) {
            //role移动方向没有被堵
            next_dir = this._cur_direction;
            if (this._blocked_direction.length <= 2 && Math.random() > 0.8) {
                //有两个以上的方向可以选择
                let valid_direction = this.GetValidDirection(this._blocked_direction);
                let random = Math.floor(Math.random() * 10 % valid_direction.length);
                next_dir = valid_direction[random];
                console.log(this._blocked_direction);
                console.log(`next_dir:${next_dir}`);
            }
        } else {
            //role移动方向被堵
            let valid_direction = this.GetValidDirection(this._blocked_direction);
            let random = Math.floor(Math.random() * 10);
            let nex = random % valid_direction.length;
            next_dir = valid_direction[nex];
        }
        return next_dir;
    },

    /**
     * 获取可以移动的方向
     * @param {Array} blockedDirections 
     */
    GetValidDirection(blockedDirections) {
        let valid_direction = [];
        for (let i = 0; i < window.DirectionList.length; i++) {
            if (blockedDirections.indexOf(window.DirectionList[i]) == -1) {
                valid_direction.push(window.DirectionList[i]);
            }
        }
        return valid_direction;
    },
    /**
     * 获取AI的
     */
    GetNextPosition(next_direction, next_position) {
        switch (next_direction) {
            case DirectionType.UP:
                next_position.y -= 1;
                break;
            case DirectionType.DOWN:
                next_position.y += 1;
                break;
            case DirectionType.LEFT:
                next_position.x -= 1;
                break;
            case DirectionType.RIGHT:
                next_position.x += 1;
                break;
            default:
                break;
        }
    },

    /**
     * 设置角色的坐标
     * @param {cc.Vec2} tilePosition 角色的tile坐标
     */
    SetRolePosition(tilePosition) {
        this.node.position = this._floor_layer.getPositionAt(tilePosition);
        this.node._tile_pos = tilePosition;
    },

    /**
     * 这个位置是否有障碍物
     * @param {cc.Vec2} pos 
     */
    HaveBlock(pos) {
        if (this._block_layer.getTileGIDAt(pos)) {
            return true;
        }
        return false;
    },

    /**
     * 是否能移动到这个位置
     * @param {cc.Vec2} position 
     */
    CanMove(position) {
        if (!this.HaveBlock(position)) {
            return true;
        }
        return false;
    }
    // update (dt) {},
});
