#诺玛建工
[除非另有声明，本仓库内容采用CC BY-NC-SA 3.0授权。](https://creativecommons.org/licenses/by-nc-sa/3.0/ CC BY-NC-SA 3.0)
诺玛建工，一个为Minecraft基岩版设计的，基于Minecraft 脚本引擎的快速建造附加包，加快您的建筑过程。  
如果你正在寻找适合Minecraft基岩版的“小木斧”，那么恭喜你来对地方了！  
原作者虽然是中国人但是为了发展选择了使用英文。  
本人将此附加包进行了人工翻译，并且进行了一些优化。
![https://github.com/NorthernOceanS/NormaConstructor 点击前往原地址](https://github.com/MCDRZF/NormaConstructor/.github/workflows/icon.png)
***
##介绍
###什么是Minecraft 脚本引擎（Minecraft Script Engine）
Minecraft 脚本引擎（Minecraft Script Engine）是一套使用JavaScript的基岩版附加包功能。  
它可以在Minecraft中执行脚本，做到一些普通附加包难以做到的功能，如执行大规模计算，监听多个事件并做出反应，调用UI。  
大家无需特地去了解它的工作方式，为了方便，后面将称其为脚本API（Scripting API）。  
###为什么不使用ModPE呢？
现在也有很多类似WE的js，像MP4创世神和6g3y的快速建造，为什么要再做一个呢？
区别所在：
#### ModPE:
- 需要第三方启动器(如BlockLauncher)  
- 通常免费但是有广告  
- 不同版本需要不同的启动器  
- 通常只可以在Android运行  
- 无法在服务器或领域使用  
- 稳定性差  
- 用户群体在减少  
####脚本API
- 支持大部分的基岩版  
- 没有任何广告,并且算法开源  
- 算法在不断更新  
- 安装步骤简单  
- 可以在服务器(pm/nk等除外)或领域使用  
- 1.12左右就能使用脚本API了  
- 巨大的未被发掘的潜力
###什么是诺玛建工（NormaConstructor）
前面提到诺玛建工是一个为Minecraft基岩版设计的，基于Minecraft 脚本引擎的快速建造附加包，可以加快您的建筑过程。

- 用更少的时间创建更令人印象深刻且更大的建筑  
- 在几秒钟内快速创建，替换或删除数万个方块  
- 生成球体，圆，多边形，铁路，地铁站等复杂几何结构  
- 迷失于各种绝妙的功能之中！
这个附加包是完全开源的，您可以fork这个项目并参与到开发当中。
##使用方法
###前置条件
请前往`https://github.com/MCDRZF/NormaConstructor/releases` 下载最新版本的.mcaddon文件
####Windows 10版
双击文件并使用Minecraft打开
####Linux
使用Minecraft 基岩版打开文件
####Android
在文件管理中找到下载的.mcaddon文件，长按使用Minecraft打开，安装完成后退出游戏。
使用blocklauncher进入游戏
####其他版本也大同小异，此处不再赘述
###配置并装载
####配置
进入Minecraft，打开你要使用诺玛建工的世界的设置  
启用实验玩法  
在左侧点击资源包并装载NormaConstructor Resource  
点击行为包并装载NormaConstructor Behavior
####进入世界后出现错误
#####“您的设备不支持运行脚本”
如果你是Android：请确定已使用Block Launcher进入游戏
如果你是iOS：由于环境过于封闭，可能需要越狱，此处不再赘述
如果你是Windows 10：请关闭您的反病毒程序（如360）
#####聊天栏出现“Script Error：XXXX”
请截图并在QQ群`820683439`上报
####正常进入
请在聊天栏运行`/function getTools`获取全套工具或运行`/function getGTools`获取本人认为有用的工具。（如出现未找到相关功能请重新安装此附加包或退出重新进入Minecraft）
###开始使用
####了解物品
除全局开关和打开生成器控制面板外需要在“允许插件运行”为“是”的情况使用
任何方块：设置放置的方块为生成器的方块（建议与“自动获取坐标”搭配使用）
![全局开关](https://github.com/MCDRZF/NormaConstructor/packs/resources/chooseNextGenerator.png) 切换“生成器控制面板”中的“允许插件运行”（默认关闭）。  
![空气](https://github.com/MCDRZF/NormaConstructor/packs/resources/getAir.png) 设置方块种类为空气，也就是执行后将拆除一片区域（可以与“自动获取坐标”搭配使用）。  
![打开生成器控制面板](https://github.com/MCDRZF/NormaConstructor/packs/resources/showMenu.png) 顾名思义，打开生成器控制面板。  
![设置坐标](https://github.com/MCDRZF/NormaConstructor/packs/resources/getPosition.png) 设置点击的点为生成器的坐标  
![设置方向](https://github.com/MCDRZF/NormaConstructor/packs/resources/getDirection.png) 添加点击时玩家的方向为生成器的方向  
![删除上一个坐标](https://github.com/MCDRZF/NormaConstructor/packs/resources/removeLastPosition.png) 删除最新设置的坐标  
![删除上一个方向](https://github.com/MCDRZF/NormaConstructor/packs/resources/removeLastDirection.png) 删除最新设置的方向  
![删除上一个方块类型](https://github.com/MCDRZF/NormaConstructor/packs/resources/removeLastBlockType.png) 删除最新设置的方块类型  
![查看设置](https://github.com/MCDRZF/NormaConstructor/packs/resources/showSavedData.png) 查看存储的设置  
![读取标签](https://github.com/MCDRZF/NormaConstructor/packs/resources/readTag.png) 开发者选项  
![开始生成](https://github.com/MCDRZF/NormaConstructor/packs/resources/execute.png) 开始生成 
####了解UI
请使用“打开生成器控制面板”打开UI
![UI](https://github.com/MCDRZF/NormaConstructor/.github/workflows/UI.png)
你应该会看到类似图片上的一个UI  
#####左边的全局设置
项目|功能|默认
-|-|-
允许插件运行|这个插件的全局开关|关
-|-|-
自动获取坐标|在执行一个行为（比如放置方块）时同步获取坐标|开
-|-|-
自动获取方块类型|在执行一个行为（比如获取坐标）时同步获取方块类型|关
-|-|-
自动获取方向|在执行一个行为（比如放置方块）时同步获取方向|开-|-
-|-|-
日志最低等级|什么等级及以上的日志会输出（高低从下到上）|信息
#####中间的生成器设置
单独的生成器请转到[生成器](####生成器)

图片中的例子|功能
-|-
NZ IS JULAO|当前生成器
-|-
So HUGE NZ is!|普通注释
-|-
How huge NZ is:|输入文本（一般为数字，无法输入可以用旁边的小键盘）
-|-
Is NZ the one and only JULAO?|切换可选功能
-|-
let's all shout:NZ IS JULAO!|直接运行某项功能
####生成器
#####两点生成长方体
设置两点坐标并选择方块即可生成长方体

项目|功能|默认
-|-|-
自动执行|在参数齐全时自动生成长方体|是
-|-|-
取最大XYZ与最小XYZ|在有多个坐标的情况下计算出最大XYZ与最小XYZ|否
-|-|-
坐标|确定两点坐标|2个
-|-|-
方块类型|确定填充物|1个

#####克隆一个区域到另一个点
设置三点坐标并把第一点和第二点复制到第三点（向x+y+z+延伸）

项目|功能|默认
-|-|-
坐标|确定两点坐标和第三点坐标|3个

#####创建线段
顾名思义，画一条线

项目|功能|默认
-|-|-
长度|决定线的长度|0
-|-|-
间隔||否
-|-|-
坐标|确定两点坐标|2个
-|-|-
方块类型|确定填充物|1个
#未完
## Credit
Credits to reimarPB for CSS  
Credits to WavePlayz for block.js  
Credits to DrZaofu for icons and Chinese version 
& Thanks @过期牛奶rlgou for the video!