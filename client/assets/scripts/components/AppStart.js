function urlParse(){
    var params = {};
    if(window.location == null){
        return params;
    }
    var name,value; 
    var str=window.location.href; //取得整个地址栏
    var num=str.indexOf("?") //返回某个指定的字符串值在字符串中首次出现的位置
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

    var arr=str.split("&"); //各个参数放到数组里
    for(var i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            params[name]=value;
        } 
    }
    return params;
}

function initMgr(){
    cc.vv = {};
    var UserMgr = require("UserMgr");
    cc.vv.userMgr = new UserMgr();
    
    var ReplayMgr = require("ReplayMgr");
    cc.vv.replayMgr = new ReplayMgr();
    
    cc.vv.http = require("HTTP");
    cc.vv.global = require("Global");//Global 全局变量缓存
    cc.vv.net = require("Net");//socket.io 连接管理，消息封装
    
    var GameNetMgr = require("GameNetMgr");//服务器消息中转派发，已知桌⾯麻将信息储存（包括⾃家所有牌和其他家打在桌⾯上的牌）
    cc.vv.gameNetMgr = new GameNetMgr();
    cc.vv.gameNetMgr.initHandlers();
    
    var AnysdkMgr = require("AnysdkMgr");//AnySDK 原⽣接⼝调⽤管理管理
    cc.vv.anysdkMgr = new AnysdkMgr();
    cc.vv.anysdkMgr.init();
    
    var VoiceMgr = require("VoiceMgr");//语⾳聊天模块
    cc.vv.voiceMgr = new VoiceMgr();
    cc.vv.voiceMgr.init();
    
    var AudioMgr = require("AudioMgr");//⾳频管理
    cc.vv.audioMgr = new AudioMgr();
    cc.vv.audioMgr.init();
    
    var Utils = require("Utils");//为任意节点添加点击、滑动、退出事件绑定
    cc.vv.utils = new Utils();
    
    //var MJUtil = require("MJUtil");
    //cc.vv.mjutil = new MJUtil();
    
    cc.args = urlParse();
}
    

    
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        label: {
            default: null,
            type:cc.Label
        },

        loadingProgess:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        initMgr();
        console.log('haha'); 
        this._mainScene = 'loading';
        this.showSplash(function(){
            var url = cc.url.raw('resources/ver/cv.txt');
            cc.loader.load(url,function(err,data){
                cc.VERSION = data;
                console.log('current core version:' + cc.VERSION);
                this.getServerInfo();
            }.bind(this));
        }.bind(this));
        
    },

    onBtnDownloadClicked:function(){
        cc.sys.openURL(cc.vv.SI.appweb);
    },
    
    showSplash:function(callback){
        var self = this;
        var SHOW_TIME = 3000;
        var FADE_TIME = 500;
        this._splash = cc.find("Canvas/splash");
        /*
        if(true || cc.sys.os != cc.sys.OS_IOS || !cc.sys.isNative){
            this._splash.active = true;
            if(this._splash.getComponent(cc.Sprite).spriteFrame == null){
                callback();
                return;
            }
            var t = Date.now();
            var fn = function(){
                var dt = Date.now() - t;
                if(dt < SHOW_TIME){
                    setTimeout(fn,33);
                }
                else {
                    var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
                    if(op < 0){
                        self._splash.opacity = 0;
                        callback();   
                    }
                    else{
                        self._splash.opacity = op;
                        setTimeout(fn,33);   
                    }
                }
            };
            setTimeout(fn,33);
        }
        else{
        */
            this._splash.active = false;
            callback();
        //}
    },
    
    getServerInfo:function(){
        var self = this;
        var onGetVersion = function(ret){
            if(ret.version == null){
                console.log("error.");
            }
            else{
                cc.vv.SI = ret;
                /*if(ret.version != cc.VERSION){      //版本检查
                    cc.find("Canvas/alert").active = true;
                }
                else{*/
                    cc.director.loadScene(self._mainScene);
                //}
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self.loadingProgess.string = "正在连接服务器";
            xhr = cc.vv.http.sendRequest("/get_serverinfo",null,function(ret){
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.loadingProgess.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    log:function(content){
        this.label.string += content + '\n';
    },
});
