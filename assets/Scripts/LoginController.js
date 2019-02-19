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
        lab_login_status: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // console.log(cc.url.raw('resources/project.manifest'));
        this.InitAssetsManager();
        // this.JumpToMain();
        this._time = 0;
    },

    JumpToMain() {
        this.scheduleOnce(() => {
            cc.director.loadScene('main');
        }, 1);
    },

    CheckUpdate(){
        if(!this.am || this.am.getState() == jsb.AssetsManager.State.UNINITED){
            this.lab_login_status.getComponent(cc.Label).string = 'AssetsManager no initial';
            return console.log('AssetsManager no initial');
        }

        this.am.checkUpdate();
    },

    InitAssetsManager(){
        if(!window.jsb){
            this.JumpToMain();
            return console.log('hotupdate only support on native platform!');
        }
        // cc.loader.loadRes('project', (err, data) => {
            // if(err){
            //     return console.log('load local manifest error');
            // }
            let storagePath = window.jsb.fileUtils.getWritablePath() + 'hotUpdateSearchPaths';
            // let manifestUrl = data.nativeUrl;
            let manifestUrl = 'res/raw-assets/project.manifest';
            if(cc.loader.md5Pipe){
                manifestUrl = cc.loader.md5Pipe.transformUrl(manifestUrl);
            }
            let versionCompareHandler = function(remoteVersion, currentVersion){
                if(remoteVersion > currentVersion){
                    return 1;
                }else if(remoteVersion == currentVersion){
                    return 0;
                }
                return -1;
            }
            this.am = new window.jsb.AssetsManager(manifestUrl, storagePath, versionCompareHandler);
            this.am.setEventCallback(this.HotUpdateHandler.bind(this));
            this.CheckUpdate();
        // });
    },

    HotUpdateHandler(event){
        let updateFinished = false;
        switch(event.getEventCode()){
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log('HOTUPDATE: ERROR_NO_LOCAL_MANIFEST');
                this.lab_login_status.getComponent(cc.Label).string = 'ERROR_NO_LOCAL_MANIFEST';
            break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log('HOTUPDATE: ERROR_PARSE_MANIFEST');
                this.lab_login_status.getComponent(cc.Label).string = 'ERROR_PARSE_MANIFEST';
            break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST :
                console.log('HOTUPDATE: ERROR_DOWNLOAD_MANIFEST ');
                this.lab_login_status.getComponent(cc.Label).string = 'ERROR_DOWNLOAD_MANIFEST';
            break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                if(!this.checked){
                    this.checked = true;
                    console.log('HOTUPDATE: NEW_VERSION_FOUND');
                    this.lab_login_status.getComponent(cc.Label).string = 'NEW_VERSION_FOUND';
                    this.am.update();
                }
            break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log('HOTUPDATE: ALREADY_UP_TO_DATE');
                this.lab_login_status.getComponent(cc.Label).string = 'ALREADY_UP_TO_DATE';
                this.JumpToMain();
            break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                console.log('HOTUPDATE: UPDATE_PROGRESSION');
                console.log(`${event.getDownloadedFiles()}/${event.getTotalFiles()}`);
                this.lab_login_status.getComponent(cc.Label).string = `${event.getDownloadedBytes()} / ${event.getTotalBytes()}`;
            break;
            case jsb.EventAssetsManager.ASSET_UPDATED:
                console.log('HOTUPDATE: ASSET_UPDATED');
                this.lab_login_status.getComponent(cc.Label).string = 'ASSET_UPDATED';
            break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log('HOTUPDATE: ERROR_UPDATING');
                console.log(event.getMessage());
                console.log(event.getCURLECode());
                console.log(event.getCURLMCode());
                console.log(event.getAssetId());
                this.lab_login_status.getComponent(cc.Label).string = 'ERROR_UPDATING';
            break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log('HOTUPDATE: UPDATE_FINISHED');
                this.lab_login_status.getComponent(cc.Label).string = 'UPDATE_FINISHED';
                updateFinished = true;
            break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log('HOTUPDATE: UPDATE_FAILED');
                console.log(event.getMessage());
                this.lab_login_status.getComponent(cc.Label).string = 'UPDATE_FAILED';
            break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log('HOTUPDATE: ERROR_DECOMPRESS');
                this.lab_login_status.getComponent(cc.Label).string = 'ERROR_DECOMPRESS';
            break;
            default:
            break;
        }

        if(updateFinished){
            this.am.setEventCallback(null);
            var searchPaths = window.jsb.fileUtils.getSearchPaths();
            var newSearchPaths = this.am.getLocalManifest().getSearchPaths();
            //将newSearchPaths插入到searchPath的头部
            Array.prototype.unshift.apply(searchPaths, newSearchPaths);
            window.jsb.fileUtils.setSearchPaths(searchPaths);
            cc.sys.localStorage.setItem('hotUpdateSearchPaths', JSON.stringify(searchPaths));
            console.log(JSON.stringify(searchPaths));
            cc.game.restart();
        }
    },

    update (dt) {
        this._time += dt;
    },

});
