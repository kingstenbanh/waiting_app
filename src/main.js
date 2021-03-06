require.config({

    // baseUrl: 'src/lib',

    // map: {
    //  '*': {
    //      backbone: '../src/lib2/backbone',
    //      underscore: '../src/lib2/underscore',
    //      jquery: '../src/lib2/jquery'
    //  }
    // },
    waitSeconds: 7,
    paths: {
        // appLib: '../src/lib2/',
        // famous: '../lib/famous',
        // requirejs: '../lib/requirejs/require',
        // almond: '../lib/almond/almond',
        // 'famous-polyfills': '../lib/famous-polyfills/index',

        'famous-map': 'bower_components/famous-map',
        'famous-boxlayout': 'bower_components/famous-boxlayout/BoxLayout',

        async : '../src/requirejs-plugins/src/async',

        underscore: '../src/lib2/underscore',
        jquery: '../src/lib2/jquery',
        backbone: '../src/lib2/backbone',
        moment: '../src/lib2/moment',
        // history: '../src/lib2/history',
        utils: '../src/utils',
        handlebars: '../src/lib2/handlebars',
        'backbone-adapter' : '../src/lib2/backbone-adapter',
        'jquery-adapter' : '../src/lib2/jquery-adapter',

        inappbrowsercss: '../css/inappbrowser.css',
        inappbrowserjs: '../src/views/Misc/inappbrowser.js'

    },

    shim: {
        'underscore': {
            exports: '_'
        },
        'jquery' : {
            exports: 'jquery',
        },
        'backbone': {
            deps: ['underscore', 'jquery','moment'],
            exports: 'Backbone'
        },
        'backbone-adapter': {
            deps: ['backbone'],
            exports: 'Backbone'
        },
        'jquery-adapter': {
            deps: ['jquery'],
            exports: 'jquery'
        },
        'hammer' : {
            deps: ['jquery'],
            exports: 'Hammer'
        },
        'handlebars' : {
            exports: 'Handlebars'
        },
        'handlebars-adapter' : {
            deps: ['handlebars'],
            exports: 'Handlebars'
        },

        'lib2/leaflet/leaflet.label' : {
            deps: ['lib2/leaflet/leaflet']
        },
        'lib2/leaflet/leaflet.iconlabel' : {
            deps: ['lib2/leaflet/leaflet']
        },
        'lib2/leaflet/tile.stamen' : {
            deps: ['lib2/leaflet/leaflet']
        }

        // // 'async!http://maps.googleapis.com/maps/api/js?sensor=false'

        // 'http://maps.googleapis.com/maps/api/js?sensor=false' : {
        //     // deps: ["src/lib2/map_markerWithLabel.js",
        //     //         "src/lib2/map_styledmarker.js",
        //     //         "src/lib2/map_geomarker.js",
        //     //         "src/lib2/map_markerclusterer.js",
        //     //         "src/lib/functionPrototypeBind.js",
        //     //         "src/lib/classList.js",
        //     //         "src/lib/requestAnimationFrame.js"]
        // },
        // // Google maps
        //             "http://maps.googleapis.com/maps/api/js?sensor=false",
        //             "src/lib2/map_markerWithLabel.js",
        //             "src/lib2/map_styledmarker.js",
        //             "src/lib2/map_geomarker.js",
        //             "src/lib2/map_markerclusterer.js",
        //             "src/lib/functionPrototypeBind.js",
        //             "src/lib/classList.js",
        //             "src/lib/requestAnimationFrame.js",
    },

    // urlArgs: new Date().toString(),
    urlArgs: 'v1.8'

});

// Global "App" variable
var App = {},
    S = null; // Utils.hbSanitize

define(function(require, exports, module) {
    'use strict';

    // var FastClick = require('famous/inputs/FastClick');

    // import dependencies
    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var RenderController = require('famous/views/RenderController');
    var Lightbox = require('famous/views/Lightbox');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var FlexibleLayout = require('famous/views/FlexibleLayout');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var InputSurface = require('famous/surfaces/InputSurface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Matrix = require('famous/core/Transform');
    var RenderNode = require('famous/core/RenderNode');

    var Easing = require('famous/transitions/Easing');
    var Timer = require('famous/utilities/Timer');

    var StandardTabBar = require('views/common/StandardTabBar');

    var EventHandler = require('famous/core/EventHandler');

    var Backbone = require('backbone-adapter');
    var DeviceReady = require('./device_ready');
    var $ = require('jquery-adapter');

    var _ = require('underscore');

    var Utils = require('utils');
    S = Utils.hbSanitize;

    // Models
    var PreloadModels = require('models/preload');
    var UserModel = require('models/user');

    console.info('Loaded main.js');
    var tmpDefaultCache = {
        geolocation_coords: {latitude: 37.441883, longitude: -122.143019},
        ModelReplacers: {},
        RoutesByHash: {},
    };
    // Data store
    App = {
        t: null, // for translation
        Utils: Utils,
        Flags: {},
        Functions: {}, // some global functions, like .action for Splash
        KeyboardShowing: false,
        MainContext: null,
        MainController: null,
        MainView: null,
        Events: new EventHandler(),
        Credentials: JSON.parse(require('text!credentials.json')),
        Config: null, // parsed in a few lines, symlinked to src/config.xml
        ConfigImportant: {},
        BackboneModels: _.extend({}, Backbone.Events),
        Router: null,
        Views: {
            MainFooter: null
        },
        Analytics: null,
        DefaultCache: tmpDefaultCache,
        Cache: _.defaults({},tmpDefaultCache),
        Data: {
            User: null
        },
        Defaults: {
            ScrollView: {
                // friction: 0.001,
                // drag: 0.0001,
                // edgeGrip: 0.5,
                // edgePeriod: 500, //300,
                // edgeDamp: 1,
                // speedLimit: 2

                // friction: 0.0001, // default 0.001
                // edgeGrip: 0.05, // default 0.5
                // speedLimit: 2.5 // default 10
            },
            Header: {
                Icon: {
                    w: 60 // width
                },
                size: 60 // height, width always undefined width
            },
            Footer: {
                size: 0 // height, width always undefined
            },
        },
        Planes: {
            fps: 10, // 10=hidden, frames-per-second counter
            background: -1000000,
            content: 100,
            contentTabs: 400,
            header: 500,
            footer: 500,
            mainfooter: 500,
            popover: 2000,
            splashLoading: 2100
        }
    };

    // Update body stylesheet
    // - remove loading background
    document.body.setAttribute('style',"");

    // Google Analytics Plugin
    Utils.Analytics.init();

    // Config file, symlinked (ln -s) into multiple directories
    var ConfigXml = require('text!config.xml');
    // Parse config.xml and set approprate App variables
    App.Config = $($.parseXML(ConfigXml));
    if(App.Config.find("widget").get(0).attributes.id.value.indexOf('.pub') !== -1){
        App.Prod = true;
        App.ConfigImportant.Version = App.Config.find("widget").get(0).attributes.version.value;
        App.ConfigImportant.StatusBarBackgroundColor = App.Config.find("widget").find('preference[name="StatusBarBackgroundColor"]').get(0).attributes.value.value;
    }

    // Run DeviceReady actions
    // - Push Notifications
    // - Resume, Back, etc.
    App.DeviceReady = DeviceReady;
    App.DeviceReady.init();
    App.DeviceReady.ready.then(function(){
        App.DeviceReady.runGpsUpdate();
    });

    // Language set?
    // - localization / globalization
    App.Cache.Language = localStorage.getItem('language_v1');
    var LanguageDef = $.Deferred();
    if(!App.Cache.Language || App.Cache.Language.length <= 0){
        App.Cache.Language = 'en';
        // Get Language
        try {
            navigator.globalization.getLocaleName(
                function (locale) {
                    console.info('locale: ' + locale.value);
                    // Set the locale
                    // - should validate we support this locale!
                    var localeNormalized = Utils.Locale.normalize(locale.value);
                    if(localeNormalized !== false){
                        // valid value!
                        console.info('locale normalized: ' + localeNormalized);
                        App.Cache.Language = localeNormalized;
                    }
                    LanguageDef.resolve();
                },
                function () {
                    alert('Error getting locale');
                }
            );
        }catch(err){
            // use default
            LanguageDef.resolve();
        }
    } else {
        // Have the language already
        LanguageDef.resolve();
    }
    
    // Localization
    LanguageDef.promise().then(function(){
        $.i18n.init({
            lng: App.Cache.Language, //'ru',
            ns: {namespaces: ['ns.common'], defaultNs: 'ns.common'}, //{ namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
            useLocalStorage: false,
            debug: true
        },function(t){
            // localization initialized
            App.t = t;

            // Router
            App.Router = require('router')(App); // Passing "App" context to Router also

            // create the main context
            App.MainContext = Engine.createContext();
            App.MainContext.setPerspective(1000);

            // MainView
            App.MainView = new View();
            App.MainView.SizeMod = new StateModifier({
                size: [undefined, undefined]
            });
            App.MainContext.add(App.MainView.SizeMod).add(App.MainView);

            // Add main background image (pattern)
            App.MainBackground = new Surface({
                size: [undefined, undefined],
                classes: ['overall-background']
            });
            App.MainView.add(Utils.usePlane('background')).add(App.MainBackground); 

            // Create main Lightbox
            App.MainController = new Lightbox();
            App.MainController.getSize = function(){
                return [undefined, undefined];
            };
            App.MainController.resetOptions = function(){
                this.setOptions(Lightbox.DEFAULT_OPTIONS);
            };

            App.defaultSize = [window.innerWidth, window.innerHeight]; // use Device Width/height via native plugin? 
            // document.body.setAttribute('style',"width:"+window.innerWidth+"px;height:"+window.innerHeight+"px");
            // Utils.Notification.Toast(window.innerHeight);
            App.mainSize = [window.innerWidth, window.innerHeight];
            // Engine.nextTick(function() {
            //     console.log('After tick=' + App.MainContext.getSize());
            //     App.mainSize = App.MainContext.getSize();
            // });
    
            App.MainContext.on('resize', function(e) {
                // Utils.Notification.Toast('Resized');
                App.MainView.SizeMod.setSize(App.mainSize);
                // document.body.setAttribute('style',"height:"+App.mainSize[1]+"px");
            }.bind(this));


            // Layout for StatusBar / Controller
            if(App.Config.devicePlatform == 'ios'){
                App.StatusBar = true;
            }

            // App.StatusBar set in device_ready
            App.DeviceReady.ready.then(function(){

                var ratios = [1];
                if(App.StatusBar === true){
                    ratios = [true, 1];
                }
                App.MainView.Layout = new FlexibleLayout({
                    direction: 1,
                    ratios: ratios
                });
                App.MainView.Layout.Views = [];


                // iOS StatusBar (above MainController lightbox, if necessary)
                App.StatusBarView = new Surface({
                    size: [undefined, 20],
                    classes: ['status-bar-default'],
                    properties: {
                        // backgroundColor: App.ConfigImportant.StatusBarBackgroundColor
                    }
                });
                if(App.StatusBar === true){
                    App.MainView.Layout.Views.push(App.StatusBarView);
                }

                App.MainView.Layout.Views.push(App.MainController);
                App.MainView.Layout.sequenceFrom(App.MainView.Layout.Views);

                // Add Lightbox/RenderController to mainContext
                App.MainView.add(Utils.usePlane('content')).add(App.MainView.Layout);

            });

            // Add GenericToast
            // - attaches to MainContext at the Root at is an overlay for Toast notifications (more fun animation options than Native Toast)
            // - todo...

            // Add GenericOnlineStatus
            // - we want to effectively communicate to the user when we have lost or are experiencing a degraded internet connection
            // - todo...

            // Main Footer
            var createMainFooter = function(){
                // var that = this;
                App.Views.MainFooter = new View();

                // create the footer
                App.Views.MainFooter.Tabs = new StandardTabBar();
                var tmpTabs = App.Views.MainFooter.Tabs;

                tmpTabs.defineSection('home', {
                    content: '<i class="icon ion-home"></i><div><span class="ellipsis-all">'+App.t('footer.waiting')+'</span></div>',
                    onClasses: ['footer-tabbar-default', 'on'],
                    offClasses: ['footer-tabbar-default', 'off']
                });
                tmpTabs.defineSection('messages', {
                    content: '<i class="icon ion-android-inbox"></i><div><span class="ellipsis-all">'+App.t('footer.messages')+'</span></div>',
                    onClasses: ['footer-tabbar-default', 'on'],
                    offClasses: ['footer-tabbar-default', 'off']
                });
                tmpTabs.defineSection('profiles', {
                    content: '<i class="icon ion-person"></i><div><span class="ellipsis-all">'+App.t('footer.profiles')+'</span></div>',
                    onClasses: ['footer-tabbar-default', 'on'],
                    offClasses: ['footer-tabbar-default', 'off']
                });
                tmpTabs.defineSection('friends', {
                    content: '<i class="icon ion-android-friends"></i><div><span class="ellipsis-all">'+App.t('footer.friends')+'</span></div>',
                    onClasses: ['footer-tabbar-default', 'on'],
                    offClasses: ['footer-tabbar-default', 'off']
                });



                tmpTabs.on('select', function(result, eventTriggered){
                    console.error(eventTriggered);
                    console.error(result);
                    switch(result.id){
                        
                        case 'home':
                            App.history.navigate('user/waiting');
                            break;

                        case 'profiles':
                            App.history.navigate('user',{history: false});
                            break;

                        case 'messages':
                            App.history.navigate('inbox');
                            break;

                        case 'friends':
                            App.history.navigate('friend/list');
                            break;

                        default:
                            alert('none chosen');
                            break;
                    }
                });


                // Attach header to the layout 
                App.Views.MainFooter.originMod = new StateModifier({
                    origin: [0, 1]
                });
                App.Views.MainFooter.positionMod = new StateModifier({
                    transform: Transform.translate(0,60,0)
                });
                App.Views.MainFooter.sizeMod = new StateModifier({
                    size: [undefined, 60]
                });

                App.Views.MainFooter.add(App.Views.MainFooter.originMod).add(App.Views.MainFooter.positionMod).add(App.Views.MainFooter.sizeMod).add(App.Views.MainFooter.Tabs);

                App.Views.MainFooter.show = function(transition){
                    transition = transition || {
                        duration: 750,
                        curve: Easing.outExpo
                    };
                    App.Views.MainFooter.positionMod.setTransform(Transform.translate(0,0,0), transition);
                };

                App.Views.MainFooter.hide = function(transition){
                    transition = transition || {
                        duration: 250,
                        curve: Easing.inExpo
                    };
                    App.Views.MainFooter.positionMod.setTransform(Transform.translate(0,1000,0), transition);
                };

                // Add to maincontext
                App.MainView.add(Utils.usePlane('mainfooter')).add(App.Views.MainFooter);

            };
            createMainFooter();

            // Splash Page (bloom loading)
            // - terminated by the 
            var createSplashLoading = function(){
                // var that = this;
                App.Views.SplashLoading = new RenderController({
                    inTransition: false,
                    // outTransition: false,
                });
                App.Views.SplashLoading.View = new View();
                App.Views.SplashLoading.View.SizeMod = new StateModifier({
                    size: [undefined, undefined]
                });
                App.Views.SplashLoading.View.OriginMod = new StateModifier({
                    origin: [0.5,0.5]
                });
                var viewNode = App.Views.SplashLoading.View.add(App.Views.SplashLoading.View.SizeMod).add(App.Views.SplashLoading.View.OriginMod);
                App.Views.SplashLoading.BgSurface = new Surface({
                    content: '',
                    size: [undefined, undefined],
                    properties: {
                        backgroundColor: '#444'
                    }
                });


                // spinning logo

                // 0 - innermost
                App.Views.SplashLoading.Logo = new Surface({
                    content: 'Waiting App',
                    classes: ['splash-surface-default'],
                    properties: {
                        // 'backface-visibility' : 'visible'
                    },
                    // content: 'https://dl.dropboxusercontent.com/u/6673634/wehicle_square.svg',
                    size: [window.innerWidth, 70]
                });
                App.Views.SplashLoading.Logo.useOpacity = 0;
                var splashOpacity = 0;
                App.Views.SplashLoading.Logo.StateMod = new StateModifier({
                    opacity: App.Views.SplashLoading.Logo.useOpacity
                });
                App.Views.SplashLoading.Logo.Mod = new Modifier({
                    opacity: function(){
                        // splashOpacity += 0.01;
                        // var through = splashOpacity % 1.20;
                        // var topOrBottom = (parseInt(splashOpacity / 1.20,10)) % 2;
                        // if(topOrBottom == 1){
                        //     through = 1 - through;
                        // }
                        // return through;
                        return 1;
                    }
                });

                // App.Views.SplashLoading.hide = function(thisView){
                //     // if(App.Views.SplashLoading.CurrentPopover === thisView){
                //         App.Views.SplashLoading.hide();
                //     // }
                // };

                App.Functions.action = function(){

                    var durationOfOpacity = 2000;

                    if(App.Views.SplashLoading.Logo.useOpacity != 1){
                        App.Views.SplashLoading.Logo.useOpacity = 1;
                    } else {
                        App.Views.SplashLoading.Logo.useOpacity = 0.1;
                    }
                    App.Views.SplashLoading.Logo.StateMod.setOpacity(App.Views.SplashLoading.Logo.useOpacity,{
                        curve: 'linear',
                        duration: durationOfOpacity
                    });

                    Timer.setTimeout(function(){
                        if(App.Views.SplashLoading._showing != -1){
                            App.Functions.action();
                        }
                    },durationOfOpacity);
                    
                    // rotate it
                    // Timer.setTimeout(function(){
                        // App.Views.SplashLoading.Logo.StateMod.setTransform(Transform.rotateY(Math.PI),{
                        //     duration: 1000,
                        //     curve: 'linear',
                        // }, function(){
                        //     // App.Views.SplashLoading.Logo.StateMod.setTransform(0,{
                        //     //     duration: 1000,
                        //     //     curve: 'linear'
                        //     // });
                        // });
                    // },250);

                    // if(1==1){
                    //     Timer.setTimeout(function(){
                    //         App.Functions.action();
                    //     },3000);
                    // }

                }

                App.Views.SplashLoading.View.add(Utils.usePlane('splashLoading',1)).add(App.Views.SplashLoading.BgSurface);
                viewNode.add(Utils.usePlane('splashLoading',2)).add(App.Views.SplashLoading.Logo.StateMod).add(App.Views.SplashLoading.Logo.Mod).add(App.Views.SplashLoading.Logo);

                App.Views.SplashLoading.show(App.Views.SplashLoading.View);
                App.MainView.add(Utils.usePlane('splashLoading')).add(App.Views.SplashLoading);

            };
            createSplashLoading();


            // Add ToastController to mainContext
            // - it should be a ViewSequence or something that allows multiple 'toasts' to be displayed at once, with animations)
            // - todo
            var toastNode = new RenderNode();
            App.MainView.add(toastNode);

            // Add FPS Surface to MainView
            var fps = new View();
            fps.Surface = new Surface({
                content: 'fps',
                size: [12,12],
                classes: ['fps-counter-default']
            });
            fps.Mod = new StateModifier({
                opacity: 0,
                origin: [1,1]
            });
            Timer.setInterval(function(){
                var fpsNum = parseInt(Engine.getFPS(), 10);
                var thresh = App.Credentials.fps_threshold;
                if(fpsNum >= thresh){
                    fps.Mod.setOpacity(0);
                }
                if(fpsNum < thresh && App.Credentials.show_fps){
                    fps.Mod.setOpacity(1);
                }

                fps.Surface.setContent(fpsNum);
            },1000);
            fps.add(fps.Mod).add(fps.Surface);
            App.MainView.add(Utils.usePlane('fps')).add(fps);

            App.StartRouter = new App.Router.DefaultRouter();

            console.info('StartRouter');

            // Start history watching
            // - don't initiate based on the first view, always restart
            var initialUrl = false;
            if(1==1 && window.location.hash.toString() != ''){
                // Skip goto Home 
                initialUrl = true;
                Backbone.history.start();
            } else {
                Backbone.history.start({silent: true}); 
                App.history.navigate(''); // should go to a "loading" page while we figure out who is logged in
            }


            // Test login
            $.ajaxSetup({
                cache: false,
                contentType: 'application/json', // need to do JSON.stringify() every .data in an $.ajax!
                statusCode: {
                    401: function(){
                        // Redirect the to the login page.
                        // alert(401);
                        // window.location.replace('/#login');
                     
                    },
                    403: function() {
                        // alert(403);
                        // 403 -- Access denied
                        // window.location.replace('/#denied');
                        App.Data.User.clear();
                    },
                    404: function() {
                        // alert(404);
                        // 403 -- Access denied
                        // window.location.replace('/#denied');
                    },
                    500: function() {
                        // alert(500);
                        // 403 -- Access denied
                        // window.location.replace('/#denied');
                    }
                }
            });
    
            // Start Splashscreen
            Timer.setTimeout(function(){
                try {
                    App.Functions.action();
                    if(App.Data.usePg){
                        navigator.splashscreen.hide();
                    } else {
                        App.Functions.action();
                    }
                }catch(err){
                    alert('failed hiding splash screen');
                    alert(err);
                }
            },500);

            // Set up ajax credentials for later calls using this user
            App.Data.UserToken = localStorage.getItem(App.Credentials.local_token_key);

            App.Data.User = new UserModel.User(); // empty, because Waiting doesn't have a GET for users
            if(!App.Data.UserToken || App.Data.UserToken == 'undefined'){
                App.history.navigate('landing');
                return;
            }
            $.ajaxSetup({
                headers: {
                    'x-token' : App.Data.UserToken
                    // 'Authorization' : 'Bearer ' + App.Data.UserToken
                }
            });

            // Preload models
            PreloadModels(App);

            // Navigate to home_route
            // - if it is a "Default"-style view, we should use history:false
            App.history.navigate(App.Credentials.home_route);

            // if(localStorage.getItem(App.Credentials.Waiting_verified_email_key) == 1){
            //     // Navigate to my controllers (Dashboard)
            //     // Utils.Notification.Toast();
            //     App.history.navigate('fleet');
            //     return;
            // }

            // // Need to check if verified yet
            // App.Data.User.verifiedEmail()
            // .then(function(){
            //     localStorage.setItem(App.Credentials.Waiting_verified_email_key, 1)
            //     App.history.navigate('controller/view');
            // })
            // .fail(function(err){
            //     // alert('failed verify');
            //     // alert(App.Data.UserToken);
            //     // console.log(err);
            //     if([0,503].indexOf(err.status) !== -1){
            //         // server error, we should stop here as well? 
            //         // - no, just pretend it worked ok, that the email was verified
            //         App.history.navigate('controller/view');
            //         return;
            //     }
            //     App.history.navigate('user/verifyemail');
            //     Utils.Popover.Help({
            //         title: "Email Not Verified",
            //         body: "To activate your Waiting, please verify your email address by clicking the link in the email you should have received. "
            //     });
            // });


        });
    });


});
