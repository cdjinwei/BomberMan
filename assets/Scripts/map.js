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
        cameraNode: cc.Node,
        roleSpriteFrame: cc.SpriteFrame,
        bombEffectAtlas: cc.SpriteAtlas,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        cc.view.enableAntiAlias(false);
        this._tile_map = this.node.getComponent(cc.TiledMap);
        this._floor_layer = this._tile_map.getLayer('floor');
        this._block_layer = this._tile_map.getLayer('block');
        // let tile = this._floor.getTiledTileAt(2, 2, true);
        // console.log(tile.node.position);
        // console.log(this._floor.getPositionAt(2,2));
        // tile.node.position = this._floor.getPositionAt(2,2);
        // tile.node.scale = 0.5;
        // let initial_pos = cc.v2(1, 1);
        // this.role.position = this._floor_layer.getPositionAt(initial_pos);
        // this.role._tile_pos = cc.v2(initial_pos);
        console.log(this._tile_map.getMapSize());
        this._role_list = [];
        this.registerEvent();

        this.AddRole({ isSelf: true }, cc.v2(1, 1));
        // this.AddBombEffect(cc.v2(5, 5), 3);
    },

    onDestroy() {
        this.unregisterEvent();
    },

    registerEvent() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.OnKeyUp, this);
    },

    unregisterEvent() {

    },

    OnKeyUp(event) {
        // console.log(event);
        switch (event.keyCode) {
            case cc.macro.KEY.w:
                console.log('move up');
                this.TryMove(cc.v2(
                    this.role._tile_pos.x,
                    this.role._tile_pos.y - 1
                ));
                break;
            case cc.macro.KEY.a:
                console.log('move left');
                this.TryMove(cc.v2(
                    this.role._tile_pos.x - 1,
                    this.role._tile_pos.y
                ));
                break;
            case cc.macro.KEY.s:
                console.log('move down');
                this.TryMove(cc.v2(
                    this.role._tile_pos.x,
                    this.role._tile_pos.y + 1
                ));
                break;
            case cc.macro.KEY.d:
                console.log('move right');
                this.TryMove(cc.v2(
                    this.role._tile_pos.x + 1,
                    this.role._tile_pos.y
                ));
                break;
            case cc.macro.KEY.space:
                this.AddBombEffect(this.role._tile_pos, 3);
                break;
            default:
                break;
        }
    },

    AddRole(info, position) {
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this.roleSpriteFrame;
        node.parent = this.node;
        node.position = this._floor_layer.getPositionAt(position);
        node.anchorX = 0;
        node.anchorY = 0;
        this._role_list.push(node);
        if (info.isSelf) {
            this.role = node;
            this.role._tile_pos = position;
            this.cameraNode.getComponent('FollowPlayer').setFollowPlayer(this.role);
        }
    },

    CreateFire(info) {
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this.bombEffectAtlas.getSpriteFrame(`${info.type}1`);
        node._fire_type = info.type;
        node.anchorX = 0;
        node.anchorY = 0;
        node.parent = this.node;
        node.position = this._floor_layer.getPositionAt(info.position);
        return node;
    },

    UpdateFire(node, lvl) {
        if (lvl > 4) {
            node.destroy();
        } else {
            node.getComponent(cc.Sprite).spriteFrame = this.bombEffectAtlas.getSpriteFrame(`${node._fire_type}${lvl}`);
        }
    },

    AddBombEffect(pos, lvl) {
        let pos_map = this.BombAreaFilter(pos, lvl);
        console.log(pos_map);
        let fireGroup = [];
        for (let info of pos_map) {
            let fire = this.CreateFire(info)
            fireGroup.push(fire);
        }
        let bombIndex = 0;
        this.schedule(() => {
            bombIndex++;
            this.UpdateBombEffect(fireGroup, bombIndex);
        }, 0.1, 4);
    },

    UpdateBombEffect(fireGroup, index) {
        for (let fire of fireGroup) {
            this.UpdateFire(fire, index);
        }
    },

    BombAreaFilter(pos, lvl) {
        let pos_map = [];
        let map_size = this._tile_map.getMapSize();
        let direction = [1, -1];
        pos_map.push({ position: pos, type: BoomEffectType.CENTER });
        for (let dir of direction) {
            let left_count = lvl;
            let start_pos = cc.v2(pos.x, pos.y);
            while (left_count != 0) {
                left_count -= dir * dir;
                start_pos.x += dir;
                if (start_pos.x >= 0 && start_pos.x < map_size.width) {
                    if (false) {
                        //如果有砖块，加入这个坐标，然后停止这个while循环
                        pos_map.push(cc.v2(start_pos.x, start_pos.y));
                        break;
                    }
                    if (this.HaveBlock(start_pos)) {
                        break;
                    }
                    //水平方向
                    if (left_count == 0) {
                        //末端的火焰
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.HOR_RIGHT_1 : BoomEffectType.HOR_LEFT_1
                        });
                    } else {
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.HOR_RIGHT_2 : BoomEffectType.HOR_LEFT_2
                        });
                    }
                }
            }
        }
        for (let dir of direction) {
            let left_count = lvl;
            let start_pos = cc.v2(pos.x, pos.y);
            while (left_count != 0) {
                left_count -= dir * dir;
                start_pos.y += dir;
                if (start_pos.y >= 0 && start_pos.y < map_size.height) {
                    if (false) {
                        //如果有砖块，加入这个坐标，然后停止这个while循环
                        pos_map.push(cc.v2(start_pos.x, start_pos.y));
                        break;
                    }
                    if (this.HaveBlock(start_pos)) {
                        break;
                    }
                    //垂直方向
                    // pos_map.push(cc.v2(start_pos.x, start_pos.y));
                    if (left_count == 0) {
                        //末端的火焰
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.VER_BOTTOM_1 : BoomEffectType.VER_TOP_1
                        });
                    } else {
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.VER_TOP_2 : BoomEffectType.VER_BOTTOM_2
                        });
                    }
                }
            }
        }
        return pos_map;
    },

    HaveBlock(pos) {
        if (this._block_layer.getTileGIDAt(pos)) {
            return true;
        }
        return false;
    },

    TryMove(pos) {
        console.log();
        if (this.HaveBlock(pos)) {
            console.log(`(${pos.x},${pos.y})处有障碍物`);
        } else {
            this.role.position = this._floor_layer.getPositionAt(pos);
            this.role._tile_pos = pos;
        }
    }
    // update (dt) {},
});
