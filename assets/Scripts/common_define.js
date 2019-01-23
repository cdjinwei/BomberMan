window.BoomEffectType = {
    VER_TOP_1: 'ver_1_',
    VER_TOP_2: 'ver_2_',
    CENTER: 'ver_3_',
    VER_BOTTOM_1: 'ver_5_',
    VER_BOTTOM_2: 'ver_4_',
    HOR_LEFT_1: 'hor_1_',
    HOR_LEFT_2: 'hor_2_',
    HOR_RIGHT_1: 'hor_4_',
    HOR_RIGHT_2: 'hor_3_'
}

window.DirectionType = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
}

window.DirectionList = [0,1,2,3];

window.RoleType = {
    PLAYER: 0,
    ENEMY: 1
}

window.ElementType = {
    WALL: 0
}

window.EventType = {
    EVENT_CLEAR_FIRE: 0,
    EVENT_ADD_FIRE: 1
}

window.ClearFire = function(pos_map){
    this.event_type = EventType.EVENT_CLEAR_FIRE;
    this.pos_map = pos_map;
}

window.AddFire = function(pos_map){
    this.event_type = EventType.EVENT_ADD_FIRE;
    this.pos_map = pos_map;
}