// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
import BombEffect from "../Scripts/BombEffect";

cc.Class({
    extends: cc.Component,

    properties: {
        cameraNode: cc.Node,
        roleSpriteFrame: cc.SpriteFrame,
        bombEffectAtlas: cc.SpriteAtlas,
        enemy: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        cc.view.enableAntiAlias(false);
        this._tile_map = this.node.getComponent(cc.TiledMap);
        this._floor_layer = this._tile_map.getLayer('floor');
        this._block_layer = this._tile_map.getLayer('block');
        this._role_list = [];
        this.registerEvent();
        this.InitStoneWall();
        this.InitialFireMap();
        this.AddRole(
            { isSelf: true },
            cc.v2(1, 1),
            RoleType.PLAYER
        );
        for (let i = 0; i < 20; i++) {
            this.AddRole(
                {
                    aiLevel: 1,
                    position: new cc.Vec2(3, 3)
                },
                {
                    wall_layer: null,
                    block_layer: this._block_layer,
                    floor_layer: this._floor_layer,
                    fire_map: this._fire_map
                },
                RoleType.ENEMY
            );
        }
    },

    onDestroy() {
        this.unregisterEvent();
    },

    registerEvent() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.OnKeyUp, this);

        this._event_handler = this.HandleEvent.bind(this);
        window.EventMgr.register_event(this._event_handler);
    },

    unregisterEvent() {
        window.EventMgr.unregister_event(this._event_handler);
    },

    InitStoneWall(){
        this._stone_map = [];
        let mapSize = this._tile_map.getMapSize();
        for(let x = 0; x < mapSize.width; x++){
            for(let y = 0; y < mapSize.width; y++){
                
            }   
        }
    },

    InitialFireMap() {
        //有火焰的地图块
        let mapSize = this._tile_map.getMapSize();
        this._fire_map = [];
        for (let i = 0; i < mapSize.width; i++) {
            this._fire_map[i] = new Array(mapSize.height).fill(0);
        }
    },

    UpdateFireCount(posMap, decorate) {
        for (let pos of posMap) {
            this._fire_map[pos.x][pos.y] += 1 * decorate;
        }
    },

    HandleEvent(ev) {
        switch (ev.event_type) {
            case EventType.EVENT_CLEAR_FIRE:
                this.UpdateFireCount(ev.pos_map, -1);
                break;
            case EventType.EVENT_ADD_FIRE:
                this.UpdateFireCount(ev.pos_map, 1);
                break;
                
            default:
                break;
        }
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

    AddRole(param1, param2, type) {
        switch (type) {
            case RoleType.PLAYER:
                this.AddPlayer(param1, param2);
                break;
            case RoleType.ENEMY:
                this.AddEnemy(param1, param2);
                break;
            default:
                break;
        }
    },

    AddPlayer(info, position) {
        let node = new cc.Node();
        node.addComponent(cc.Sprite).spriteFrame = this.roleSpriteFrame;
        node.parent = this.node;
        node.position = this._floor_layer.getPositionAt(position);
        node.anchorX = 0;
        node.anchorY = 0;
        node.color = cc.Color.RED;
        // this._role_list.push(node);
        if (info.isSelf) {
            this.role = node;
            this.role._tile_pos = position;
            this.cameraNode.getComponent('FollowPlayer').setFollowPlayer(this.role);
        }
    },

    AddEnemy(roleInfo, mapInfo) {
        let node = cc.instantiate(this.enemy);
        node.parent = this.node;
        // this._role_list.push(node);
        node.getComponent('AiController').InitAi(roleInfo, mapInfo);
    },

    AddBombEffect(pos, lvl) {
        let pos_map = this.BombAreaFilter(pos, lvl);
        let node = new cc.Node();
        let cmp = node.addComponent(BombEffect);
        cmp.InitView(pos_map, lvl, this.bombEffectAtlas);
        node.parent = this.node;
    },

    BombAreaFilter(pos, lvl) {
        let pos_map = [];
        let map_size = this._tile_map.getMapSize();
        let direction = [1, -1];
        pos_map.push({
            position: pos,
            type: BoomEffectType.CENTER,
            pixPos: this._floor_layer.getPositionAt(pos)
        });
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
                            type: dir == 1 ? BoomEffectType.HOR_RIGHT_1 : BoomEffectType.HOR_LEFT_1,
                            pixPos: this._floor_layer.getPositionAt(cc.v2(start_pos.x, start_pos.y))
                        });
                    } else {
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.HOR_RIGHT_2 : BoomEffectType.HOR_LEFT_2,
                            pixPos: this._floor_layer.getPositionAt(cc.v2(start_pos.x, start_pos.y))
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
                            type: dir == 1 ? BoomEffectType.VER_BOTTOM_1 : BoomEffectType.VER_TOP_1,
                            pixPos: this._floor_layer.getPositionAt(cc.v2(start_pos.x, start_pos.y))
                        });
                    } else {
                        pos_map.push({
                            position: cc.v2(start_pos.x, start_pos.y),
                            type: dir == 1 ? BoomEffectType.VER_TOP_2 : BoomEffectType.VER_BOTTOM_2,
                            pixPos: this._floor_layer.getPositionAt(cc.v2(start_pos.x, start_pos.y))
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
