## slotsmachine 水果机 老虎机

<img src="https://github.com/slimeball/slotsmachine/blob/introduction/howtoplay.gif" width="320"/>

## 关于本仓库
这是一个在线上跑的需求，内嵌在app里，目的是为了记录遇到的问题与解决方案

### 分支
把这个项目所有的代码都放在仓库里参考
vue-ver options api代码（完整项目）
vue3-ver composition api代码（页面完整，脚本进度10%）
react-ver react代码（整体进度80%）
phaser-ver phaser代码（整体进度5%）

### envirment and cli
api config src/service/apiAddress.js    
add uat envirment variable config at package.json       
different cli param build different release package         
or set proxy at vite.config.js      

uat package - uat branch: npm run build:uat    
production package - master branch: npm run build   

after develop, merge uat to master then build.  

### 环境和命令
接口配置 src/service/apiAddress.js 根据不同命令走不同环境，uat接口本地不通可走 vite.config.js的代理   

uat环境-uat分支部署: npm run build:uat    
生产环境- master分支部署: npm run build   

开发完成后将uat合并到master，在master编译后上传   

### 项目介绍
由于水果配置和操作都需要接口交互，而接口一部分来自第三方，放在本地也不太好体验出全部内容，只做简单描述，给有需要的开发者提供思路

因为这是一个游戏，需求是内嵌app网页。因为这个项目比较小，所以对我来说是一个实践新框架的机会。最开始的时候定位采用一个游戏框架来做，unity和egret这类似乎不能直接打成网页，最后选择了phaser3，但是由于个人水平有限，游戏开发跟web开发差异还是很大，评估已经无法在工期内完成，最后换成了vite+react，但是react做到了80%时候，也因为自己没用过react，无法更好的处理state异步的问题，最后换回了vite+vue3，不过开发模式用的还是option api，因为工期所剩无几，vue3 composition api还在修改中。

玩法与90-00年代游戏室里的水果机一样，不多做介绍

### 技术实现
* 页面方面rem的单位设为font-size: 4.2666666667vw，再使用的pxtorem转到rem，这样页面缩放的时候也不会变形
水果位置使用定位围绕一圈，在开始后有四个高亮围绕着转，根据当前索引定位，点击开始后开启一个interval定时器，变更索引，同时计算位置，在接口返回数据后用timeout定时器再滚动五秒后将最终位置同步给一个变量，interval定时器执行到指定位置停止。

* 中luck后接口会返回多个水果，然后反向转水果数的圈数，最后返回结果。

* 按钮全部定位，闪动使用interval定时器切换。

* 音效根据指定位置播放。


* 长按押分，js没有默认的长按事件，在长按页面的时候也会弹出菜单和选择内容，首先要用css禁用选择
```css
-webkit-touch-callout:none;
-webkit-user-select:none;
-khtml-user-select:none;
-moz-user-select:none;
-ms-user-select:none;
user-select:none;
```
再用js禁用弹出菜单
```javascript
window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
```
之后用touchstart事件，开启一个interval定时器累加押分         
touchend和touchmove时取消定时器     
> 要定义一个数组，每次按压把定时器push到数据
> 因为touchend有些手机在手按压后离开手机，清不掉指定定时器，也就是新定时器开启了，旧定时器还在内存中跑，因为旧变量变成了新的定时器，那么旧的只能全部清除定时器才可以，而定时器使用的是id，所以清除全部定时器只能用非常大的数去循环，那样是不应该出现的
> 所以在touchend和touchmove的时候清除掉定时器数组里的全部定时器，并把数组清空



* 由于工期被自己折腾的很紧，加上还有别的事处理，所以代码写的一般，其实还有很多可以优化的地方。
