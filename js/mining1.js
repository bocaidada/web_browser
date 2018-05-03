function Game() {
    this.maxlength=10;
    this.length=0;
    this.flag=true;
    this.leftPosition=[];
    this.topPosition=[];
}
Game.prototype={
    //开始挖矿
    start:function () {
        this.init();
        this.getJewels();
        this.click();
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