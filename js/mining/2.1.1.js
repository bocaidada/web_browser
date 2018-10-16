new Vue({
    el:'#root',
    data:{
        // 用户信息
        initData:{},
        //服务器
        // api:'https://yun1.janesi.net',
        api:'https://yun.janesi.com',
        //页面链接
        pageUrl:{
            price:'/janesi-solian/solian-2.1.1/templates/guli.html',
            rankIng:'/janesi-solian/solian-2.1.1/templates/rank_list_2.1.1.html',
            task:'/janesi-solian/solian-2.1.1/templates/task.html',
            white_paper:'/janesi-solian/solian-2.1.1/templates/white_paper_2.1.1.html'
        },
        //数据埋点
        track:{
            price:'price_button',
            task:'power_button',
            white_paper:'declare_button',
            mining:'mining_detail',
            toLogin:'login_detail'
        },
        // 提现提示
        toExchangeFlag:false,
        // 登录状态
        isLogin:false,
        // 挖矿中状态
        minState:false,
        // 挖矿状态
        jewelState:false,
        chargeSwitch:true,
        // 钻石左右位置去重集合
        leftPosition:[],
        topPosition:[],
        // 倒计时背景
        bgWith:'',
        count_down:'',
        // 倒计时总时间
        allTime:'7200',
        // 用户钻石数量以及换算钱数
        juwNumTotal:'',
        moneyNumTotal:'',
        // 钻石数据
        jewelData:[],
        //倒计时时间函数Y
        timerTask:'',
        //挖矿累积量数据
        getChartDates:{},
        //公告
        noticeCon:'布谷区块链即将上线，来玩就可获得算力奖励，每人奖励7.7算力',
        //新手引导
        scrollFlag:true,
        noviceFlag:false,
        noviceBoxFlag:false,
        totalSlkFlag:0,
        moneyImgFlag:0,
        taskImgFlag:0,
        goodImgFlag:1,
        noviceNum:'1',
        juwTotal:0
    },
    created: function() {
        // this.getUserData();
        // this.getData();
        this.getLoginState();
        this.getChartData ()
    },
    mounted: function () {
        this.reload();
        // this.exposure('show','mining')
    },
    watch: {

    },
    methods: {
        // 数据埋点
        exposure(eventType,param) {
            // window.JanesiApi.reqUrl = "http://118.25.10.151:8808/log/spm"
            var that = this;
            var myDate = new Date().getTime();
            JanesiApi.trackApi('/log/spm', 'get', {
                eventType: eventType,
                eventTime: myDate,
                end_type: 'h5',
                url: window.location.href,
                referrer: '',
                h5_locaiton: that.track[param]
            }, function (res) {
                console.log('ok')
            })
        },
        //页面刷新
        reload () {
            var _this = this;
            window.JanesiBridge.commonNativeCallJS = function (res) {
                console.log(res);
                if (res.action == 'reloaded') {
                    _this.getLoginState();
                }
            }
        },
        //判断是否需要新手引导
        noviceGuide () {
            var _this= this;
            window.JanesiBridge.callNativeWithCallBack('shouldShowGuide',{
                "position":'SLK'
            },function(res){
                console.log(res);
                if(res.show == '1'){
                    _this.noviceFlag = true;
                }
                _this.getData();
            })
        },
        // 判断是否登录
        getLoginState () {
            var _this= this;
            window.JanesiBridge.callNativeWithCallBack('getUserInfo',{},function(res){
                //callback 通知原生返回回调，获取登陆与否的状态,将状态存到loginState
                console.log(res);
                // 数据初始化
                _this.juwTotal = 0;
                _this.jewelData = [];
                _this.topPosition = [];
                _this.leftPosition = [];
                // 状态初始化
                if(res.loginState == '0'){
                    _this.minState = false;
                    _this.handShow = false;
                    _this.jewelState = false;
                    _this.isLogin = true;
                    _this.initData = {
                        totalSlk:'--',
                        moneyValue:'--',
                        totalPower:'--'
                    };
                }else{
                    _this.isLogin = false;
                    _this.minState = false;
                    _this.getUserData();
                    _this.noviceGuide();
                }
            });
        },
        // 获取用户信息
        getUserData () {
            var _this= this;
            window.JanesiApi.reqUrl = 'http://10.10.10.81:8803';
            JanesiApi.sendApi('/app/soulian/slk/slk_info', 'post', {
                userId:'1336'
            }, function (res) {
                console.log(res);
                _this.initData = res.result;
                _this.juwNumTotal = _this.initData.totalSlk;
                _this.moneyNumTotal = _this.initData.moneyValue;
                if(_this.scrollFlag) {
                    _this.scrollFlag = false;
                    _this.runNum('juwNum','0.00000',_this.initData.totalSlk,'5');
                    _this.runNum('money','0.00',_this.initData.moneyValue,'2')
                }
            })
        },
        //累计挖矿量以及曲线图
        getChartData () {
            var _this= this;
            window.JanesiApi.reqUrl = 'http://10.10.10.81:8803';
            JanesiApi.sendApi('/app/soulian/slk/daily_slk', 'post', {
            }, function (res) {
                console.log(res);
                _this.getChartDates = res.result;
                //挖矿总量最多显示九位，当末尾为.截取掉
                if(_this.getChartDates.totalSlk.length > '10'){
                    _this.getChartDates.totalSlk = _this.getChartDates.totalSlk.substr(0,10);
                    if(_this.getChartDates.totalSlk.slice(9) == '.'){
                        _this.getChartDates.totalSlk = _this.getChartDates.totalSlk.substr(0,9);
                    }
                }
                var len = _this.getChartDates.totalSlk.indexOf(".");
                if(len == '-1'){
                    len = '0'
                }else{
                    len = _this.getChartDates.totalSlk.substr(len).length-1;
                }
                _this.runNum('totalSlk','0',_this.getChartDates.totalSlk,len);
                _this.runNum('personCount','0',_this.getChartDates.personCount,'0');
                //绘制每日挖矿曲线
                initLine('SLKecharts', _this.getChartDates.dateTime, _this.getChartDates.dailySlk);
            })
        },
        // 钻石位置去重
        checkPosition (lefts, tops) {
            for(var i = 0; i < this.topPosition.length; i++) {
                if(Math.abs(this.topPosition[i] - tops) < 53 && Math.abs(this.leftPosition[i] - lefts) < 55) {
                    return true;
                }
            }
        },
        // 钻石位置去重
        de_weight (val) {
            var minBack = document.querySelector('.minBox');
            for (var i=0;i<val;i++){
                var lefts, tops;
                do {
                    lefts = (minBack.offsetWidth - 42) * Math.random();
                    tops = (minBack.offsetHeight - 55) * Math.random();
                } while (this.checkPosition(lefts, tops));
                this.leftPosition.push(lefts);
                this.topPosition.push(tops);
            }
        },
        //获取钻石数据
        getData () {
            var _this= this;
            window.JanesiApi.reqUrl = 'http://10.10.10.81:8803';
            JanesiApi.sendApi('/app/soulian/slk/mining_info', 'post', {
                userId:'1336',
                appVersion:'1.0.0'
            }, function (res) {
                console.log(res.result);
                if(res.result.completeSlk.length == 0){
                    window.JanesiBridge.callNative('miningComplete',{});
                    _this.jewelState = false;
                    if(_this.timerTask){
                        clearInterval(_this.timerTask);
                    }
                    _this.time(res.result.residueTime);
                    _this.minState = true
                }else{
                    _this.chargeSwitch = true;
                    _this.jewelState = true;
                    _this.jewelData = res.result.completeSlk;
                    _this.de_weight(_this.jewelData.length);
                }
            })
        },
        // 点击收取钻石
        click (param,index) {
            var _this = this;
            document.getElementById('music').play();
            $('#jewel'+index).animate({
                top: '-360'+'px',
            }, '600', function() {
                _this.initData.totalSlk = _this.juwNumTotal;
                _this.initData.moneyValue = _this.moneyNumTotal;
                _this.juwNumTotal = (parseFloat(_this.initData.totalSlk) + parseFloat(param.slkNum)).toFixed(5);
                _this.moneyNumTotal =Math.floor((parseFloat(_this.juwNumTotal) * _this.initData.rate)*100)/100;
                _this.runNum('juwNum',_this.initData.totalSlk,_this.juwNumTotal,'5');
                _this.runNum('money',_this.initData.moneyValue,_this.moneyNumTotal,'2');
                if(_this.noviceFlag) {
                    _this.noviceBoxFlag = true
                }
                window.JanesiApi.reqUrl = 'http://10.10.10.81:8803';
                JanesiApi.sendApi('/app/soulian/slk/collect', 'post', {
                    // userId:'1336',
                    slkId :param.id
                }, function (res) {
                    console.log(res);
                    if(res.code >= '0'){
                        _this.juwTotal += 1;
                        if(_this.juwTotal == _this.jewelData.length) {
                            // 数据初始化
                            _this.juwTotal = 0;
                            _this.jewelData = [];
                            _this.topPosition = [];
                            _this.leftPosition = [];
                            _this.getData ()
                        }
                    }
                });
            });
        },
        //页面跳转
        linkTo (params) {
            // 用户初次安装新手引导
            if(params == 'novice'){
                if(this.noviceNum == '1'){
                    this.goodImgFlag = 0;
                    this.totalSlkFlag = 1;
                    this.noviceNum = '2';
                }else if(this.noviceNum == '2') {
                    this.totalSlkFlag = 0;
                    this.taskImgFlag = 1;
                    this.noviceNum = '3';
                }else if(this.noviceNum == '3') {
                    this.taskImgFlag = 0;
                    this.moneyImgFlag = 1;
                    this.noviceNum = '4';
                }else{
                    this.noviceBoxFlag = false;
                    this.noviceFlag = false;
                    window.JanesiBridge.callNativeWithCallBack('shouldShowGuideFinish',{
                        "position":'SLK'
                    },function(res){});
                }
                return
            }
            // 关闭提现提示弹窗
            if(params == 'toExchangeTip') {
                this.toExchangeFlag = false;
                return
            }
            // 打开提现提示弹窗
            if(params == 'toExchange') {
                this.toExchangeFlag = true;
                return
            }

            // 未登录状态点击算力跳转登录页面
            if(this.isLogin){
                if(params == 'task') {
                    params = 'toLogin';
                }
            }
            //数据埋点
            // this.exposure('click',params);
            //打开H5页面与打开原生页面
            if(params == 'toLogin'){
                window.JanesiBridge.callNative('open',{page: params});
            }else{
                if(params == 'price'){
                    window.JanesiBridge.callNative('open',{url: this.api+this.pageUrl[params]});
                }else{
                    window.JanesiBridge.callNative('open',{url: this.api+this.pageUrl[params],data:{needFullScreen:'1'}});
                }
            }
        },
        // 数字滚动动画
        runNum (el, start, end, some) {
            var options = {
                useEasing: true,
                useGrouping: true,
                separator: ',',
                decimal: '.',
            }
            var demo = new CountUp(el, start, end, some, 1.5, options);
            demo.start()
        },
        //  开采倒计时
        time (param) {
            this.timeInit(param);
            var _this = this;
            var totalTime = parseInt(param);
            this.timerTask = setInterval(function () {
                totalTime -= 1;
                if(totalTime == '0') {
                    clearInterval(this.timerTask);
                    _this.minState = false;
                    _this.getData()
                }else{
                    _this.timeInit(totalTime)
                }
            }, 1000)
        },
        //初始化倒计时状态
        timeInit (param) {
            var totalTime = parseInt(param);
            this.bgWith = ((parseInt(this.allTime)-totalTime)/parseInt(this.allTime)*100).toFixed(2)+'%';
            var hour = '0' + Math.floor(totalTime / (60 * 60)) + ':';
            param = totalTime % (60 * 60);
            var minute = Math.floor(param / 60) < 10 ? '0' + Math.floor(param / 60) : Math.floor(param / 60);
            param = totalTime % 60;
            var second = param < 10 ? '0' + param : param;
            this.count_down = hour + minute + ':' + second
        }
    }
})

    },
    //数据初始化
    init:function () {
        this.maxlength=8;
    },
    //获取所有钻石
    getJewels:function () {
        for(let i=0;i<this.maxlength;i++){
            this.getJewel();
        }
    },
    //钻石水平位置去重
    checkLeftPosition:function(tops,lefts){
        console.log(3)
        // return this.leftPosition.some(function(value){
        //     return Math.abs(value-lefts)<20;
        // })
        let that=this;
        return this.leftPosition.some(function(value){
            if(value>tops-30||value<tops+30){
                return that.leftPosition.some(function(value){
                    return Math.abs(value-lefts)<25;
                })
            }
        })
    },
    //钻石垂直位置去重
    checkTopPosition:function(lefts,tops){
        console.log(4)
        return this.topPosition.some(function(value){
                return Math.abs(value-tops)<30;
        })
        // let that=this;
        // return this.leftPosition.some(function(value){
        //     if(value>lefts-20||value<lefts+20){
        //         return that.topPosition.some(function(values){
        //             return Math.abs(values-tops)<20;
        //         })
        //     }
        // })
    },
    // 产生每一个钻石
    getJewel:function(){
        let minBack=document.querySelector('.minBack');
        let lefts,tops;
        let jewel=document.createElement('div');

        //垂直位置去重
        do{
            tops = (minBack.offsetHeight-250)*Math.random()+40;
        }while(this.checkTopPosition(tops));
        //水平位置去重
        do{
            lefts = (minBack.offsetWidth-60)*Math.random()+10;
        }while(this.checkLeftPosition(tops,lefts));
        jewel.classList.add('jewel');
        jewel.innerHTML=`
                     <div></div>
                     <span>0.040${Math.ceil(Math.random()*90+10)}</span>
                `;
        jewel.style.cssText=`
    	       left:${lefts}px;
    	       top:${tops}px;
    	`;
        minBack.appendChild(jewel);
        this.leftPosition.push(lefts);
        this.topPosition.push(tops);
    },
    // 点击收取钻石
    click:function () {
        let jewelNum=document.querySelectorAll('.jewel').length;
        let i=0;
        let that=this;
        let minBack=document.querySelector('.minBack');
        mui('.minBack').on('tap','.jewel',function () {
            i+=1;
            let jewel=document.querySelector('.jewelNum');
            let total=parseFloat(jewel.children[2].innerHTML);
            let count=parseFloat(this.children[1].innerHTML);
            total=total+count;
            jewel.children[2].innerHTML=total.toFixed(5);
            $(this).animate({left:"0.5rem",top:'0.3rem',width:'0',height:'0',fontSize:'0'},'slow','linear',function () {
                minBack.removeChild(this);
                console.log(i);
                console.log(jewelNum);
                if(i==jewelNum){
                    that.leftPosition=[];
                    that.topPosition=[];
                    // that.getJewels();
                    that.exploit();
                    i=0;
                }
            })
        })
    },
    // 钻石开采
    exploit:function () {
        let minBack=document.querySelector('.minBack');
        let jewel=document.createElement('div');
        jewel.innerHTML=`
                     <div></div>
                     <span>开采中</span>
                `;
        jewel.classList.add('exploit');
        jewel.style.cssText=`
    	       left:46%;
    	       top:2.8rem;
    	       transform:translateX(-50%)
    	`;
        minBack.appendChild(jewel);
    }
};
