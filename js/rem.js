// (function (doc, win) {
//         var docEl = doc.documentElement,
//             resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
//             recalc = function () {
//                 var clientWidth = docEl.clientWidth;
//                 if (!clientWidth) return;
//                 if(clientWidth>=750){
//                   // 这里的750 取决于设计稿的宽度
//                     docEl.style.fontSize = '100px';
//                 }else{
//                     docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
//                 }
//             };

//         if (!doc.addEventListener) return;
//         win.addEventListener(resizeEvt, recalc, false);
//         doc.addEventListener('DOMContentLoaded', recalc, false);
//     })(document, window);



function resize() {
    var docEl = document.documentElement;
    var clientWidth = window.innerWidth;
    if(clientWidth<=375){
        docEl.style.fontSize='50px';
    }else if(clientWidth>=750){
        docEl.style.fontSize='100px';
    }else{
        docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
    }
}
resize();
