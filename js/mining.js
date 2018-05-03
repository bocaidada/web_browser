function Game() {
    this.maxlength=10;
    this.length=0;
    this.flag=true;
    this.userId='139';
    this.leftPosition=[];
    this.topPosition=[];
    this.url='http://10.10.10.81:8801';
}
Game.prototype={
    //开始挖矿
    start:function () {
        this.init();
        this.click();
        this.Ranking();
    },
    //判断初始状态
    init:function () {
        let that=this;
        mui.ajax(this.url+'/app/browser/diamond/info', {
        	type: 'GET',
        	data: {
        		'userId': that.userId,
        	},
        	dataType: "json",
        	success: function(e) {
                console.log(e);
                document.querySelector('.jewelNum').children[2].innerHTML=e.result.currentDiamond;
                document.querySelector('.powerNum').children[2].innerHTML=e.result.currentEnergy;
            }
        })
        if(that.flag){
            that.getJewels();
        }else{
            that.login();
        }
    },
    //获取所有钻石
    getJewels:function () {
        let that=this;
        mui.ajax(that.url+'/app/browser/diamond/list', {
			type: 'GET',
			data: {
				'userId': that.userId,
			},
			dataType: "json",
			success: function(e) {
                console.log(e);
                if(e.code=='0'){
                    if(e.result.length!='0'){
                        if(e.result.length>1){
                            for(let i = 0; i<e.result.length; i++){
                                that.getJewel(e.result[i].diamondNum,e.result[i].id)
                            }
                        }else{
                            if(e.result[0].residuTime!='0'){
                                that.mine(e.result[0].residuTime);
                            }else{
                                that.getJewel(e.result[0].diamondNum,e.result[0].id)
                            }
                        }

                    }else{
                        that.exploit();
                    }
                }

            }
        })
    },
    // 钻石位置去重
    checkPosition:function(lefts,tops){
        let that = this;
        for(let i = 0; i<that.topPosition.length; i++){
            if(Math.abs(that.topPosition[i] - tops)<70 && Math.abs(that.leftPosition[i] - lefts)<70){
                return true;
            }
        }
    },
    // 产生每一个钻石
    getJewel:function(param,id){
        let minBack=document.querySelector('.minBack');
        let lefts,tops;
        let jewel=document.createElement('div');
        // 钻石位置去重
        do{
            lefts = (minBack.offsetWidth-80)*Math.random()+15;
            tops = (minBack.offsetHeight-250)*Math.random()+60;
        }while(this.checkPosition(lefts,tops));

        jewel.classList.add('jewel');
        jewel.setAttribute('listId',id);
        jewel.innerHTML=`
                     <div></div>
                     <span>${param}</span>
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
        let i=1;
        let that=this;
        let minBack=document.querySelector('.minBack');
        mui('.minBack').on('tap','.jewel',function () {
            i+=1;
            let jewel=document.querySelector('.jewelNum');
            let total=parseFloat(jewel.children[2].innerHTML);
            let count=parseFloat(this.children[1].innerHTML);
            console.log(i)

            let jewels=document.querySelectorAll('.jewel');
            let id=this.getAttribute('listId')
            console.log(jewels.length);
            total=total+count;
            jewel.children[2].innerHTML=total.toFixed(5);
            $(this).animate({left:"0.7rem",top:'0.3rem',width:'0',height:'0',fontSize:'0'},'slow','linear',function () {
                minBack.removeChild(this);
                mui.ajax(that.url+'/app/browser/diamond/collect', {
                    type: 'get',
                    data: {
                        'userId':that.userId,
                        'diamondId':id
                    },
                    dataType: "json",
                    success: function(e) {
                        console.log(e)
                        if(jewels.length=='1'){
                            that.leftPosition=[];
                            that.topPosition=[];
                            that.getJewels();
                        }
                    }
                })

            })
        })
    },
    // 能量不足，去获取
    exploit:function () {
        let minBack=document.querySelector('.minBack');
        let jewel=document.createElement('div');
        jewel.innerHTML=`
                <img src="http://yun.janesi.net/web_browser/img/bubble.png" alt="">
                <div>
                    <span>能量不足</span>
                    <a href="" class="state_get">去获取</a>
                </div>
                `;
        jewel.classList.add('state');
        jewel.style.cssText=`
    	       left:37%;
    	       top:3rem;
    	       transform:translateX(-50%)
    	`;
        minBack.appendChild(jewel);
    },
    //登录后挖矿
    login:function () {
        let minBack=document.querySelector('.minBack');
        let jewel=document.createElement('div');
        jewel.innerHTML=`
                <img src="http://yun.janesi.net/web_browser/img/bubble.png" alt="">
                <div>
                    <a href="" class="state_login">登录</a>
                    <span>后开始挖矿</span>
                </div>
                `;
        jewel.classList.add('state');
        jewel.style.cssText=`
    	       left:37%;
    	       top:3rem;
    	       transform:translateX(-50%)
    	`;
        minBack.appendChild(jewel);
    },
    // 开采中，倒计时
    mine:function (param) {
        let that=this;
        let minBack=document.querySelector('.minBack');
        let jewel=document.createElement('div');
        jewel.innerHTML=`
                <img src="http://yun.janesi.net/web_browser/img/bubble.png" alt="">
                <div class="count_down">
                    <span></span> 
                    <span></span>   
                </div>
                <div>开采中...</div>
                `;
        jewel.classList.add('state');
        jewel.style.cssText=`
    	       left:41%;
    	       top:3rem;
    	       transform:translateX(-50%)
    	`;
        minBack.appendChild(jewel);
        that.time(param);
    },
    // 钻石排行
    Ranking:function () {
        mui.ajax(this.url+'/app/browser/diamond/ranking', {
			type: 'GET',
			dataType: "json",
			success: function(e) {
                console.log(e);
                let us_list=document.querySelector('.us_list');
                for(let i=0;i<e.result.length;i++){
                    let li=document.createElement('li');
                    if(i=='0'){
                        li.innerHTML=`
                                <div class="left">
                                    <span>
                                        <img src="http://yun.janesi.net/web_browser/img/ore_first.png" alt="">
                                    </span>
                                    <span>${e.result[i].userName}</span>
                                </div>
                                 <div class="right">${e.result[i].sumDiamond}钻</div>
                                `
                    }else if(i=='1'){
                        li.innerHTML=`
                                    <div class="left">
                                        <span>
                                             <img src="http://yun.janesi.net/web_browser/img/ore_second.png" alt="">
                                        </span>
                                        <span>${e.result[i].userName}</span>
                                    </div>${e.result[i].sumDiamond}钻</div>
                                    `
                    }else if(i=='2'){
                        li.innerHTML=`
                                    <div class="left">
                                        <span>
                                             <img src="http://yun.janesi.net/web_browser/img/ore_third.png" alt="">
                                        </span>
                                        <span>${e.result[i].userName}</span>
                                    </div>
                                     <div class="right">${e.result[i].sumDiamond}钻</div>
                                    `
                    }else{
                        li.innerHTML=`
                                    <div class="left">
                                        <span>${i+1}</span>
                                        <span>${e.result[i].userName}</span>
                                    </div>
                                     <div class="right">${e.result[i].sumDiamond}钻</div>
                                    `
                    }
                    us_list.appendChild(li);
                }
            }
        });
        for(let i=0;i<10;i++){

        }
    },
    //不同终端判断
    terminal:function (type,param) { 
        if(type=='IOS'){
            alert(param);
            // window.webkit.messageHandlers.skip.postMessage(param);
        }else(
            alert(2)
            // window.android.skip(param);
        )
     },
    //  开采倒计时
    time:function (param) {  
        let that=this;
        let totalTime=parseInt(param)
        let t1=setInterval(function () {
           totalTime-=1 ;
           var hour= '0'+Math.floor(totalTime / (60 * 60))+':';
           param=totalTime%(60 * 60);
           var minute=Math.floor(param /60)<10?'0'+Math.floor(param / 60):Math.floor(param /  60);
           param=totalTime%60;
           var second=param<10?'0'+param:param;
           if(totalTime=='0'){
               clearInterval(t1);
               that.getJewels();
           }
           document.querySelector('.count_down').children[1].innerHTML= hour+minute+':'+second;     
         },1000)
         setTimeout(function(){
             document.querySelector('.count_down').children[0].innerHTML='剩余';
         },1000)
    }

};