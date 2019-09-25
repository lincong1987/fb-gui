/*
 This file 'index.js' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:31
 */

define(function (require, exports, module) {

	// "use strict";

	/*
	 * 新增组件需要在此处注册，注册方法为 require("PathToComponentName")
	 */

	/************
	 * 系统组件
	 ***********/
	// 图层
	require("./Layer");

	require("./LayerEdit")
	// 日期
	require("./Date");
	// 文本
	require("./Text");
	// Link
	require("./Link");
	// 文本滚动
	require("./TextSlider");
	// 进度条
	require("./ProgressBar");
	// 圆形进度
	require("./ProgressCircle");
	// 图表
	require("./Chart");
	// 图表时间轴
	// require("./ChartTimeLine");
	// // BasicLineChart
	// require("./BasicLineChart");
	// // BasicAreaChart
	// require("./BasicAreaChart");

	/************
	 * 系统组件
	 ***********/
	// 图标，使用 iconfont
	require("./Icon");
	// 图片
	require("./Image");
	// 背景
	require("./Background")
	// 颜色块
	require("./ColorCard");
	// iframe
	require("./Iframe");
	require("./Tianditu");
	require("./BMap");

	/************
	 * 系统组件
	 **********
	// 箭头左
	require("./ArrowLeft");
	// 箭头右
	require("./ArrowRight");
	// 箭头上
	require("./ArrowUp");
	// 箭头下
	require("./ArrowDown");
	// 镜检

	require("./AppearanceInspection");
	 
	// 自动挫角机
	require("./AngleFilingMachine");
	// 自动贴标机
	require("./AutoLabelingMachine");
	// 绝缘耐压测试
	require("./BreakdownVoltageTest");
	// 汇流条焊接机
	require("./BussingMachine");
	// 连接段
	require("./Connector");
	// 交联度测试
	require("./CrossLinkingTest");
	// AB 注胶机
	require("./DispenserMachine");
	// 削边机
	require("./EdgeCuttingMachine");
	// EL检测
	require("./ElInspection");
	// EVA裁切机
	require("./EvaCuttingMachine");
	// EVA裁切机-切刀
	require("./EvaCuttingMachineCutter");
	// 边框自动检测
	require("./FrameBorderTestMachine");
	// 固化位
	require("./FrameCuringHolder");
	// 装框机 - 装框位
	require("./FrameHolder");
	// 装框机
	require("./FramingMachine");
	// 闸口-横
	require("./GateHorizontal");
	// 闸口-竖
	require("./GateVertical");
	// 玻璃位
	require("./GlassHolder");
	// 玻璃分拣机
	require("./GlassPicker");
	// 横板
	require("./HorizontalPlate");
	// 0.5块横板
	require("./HorizontalPlateHalf");
	// 1块横板
	require("./HorizontalPlateOne");
	// 1.5块横板
	require("./HorizontalPlateOneHalf");
	// 2块横板
	require("./HorizontalPlateTwo");
	// IV测试
	require("./IvInspection");
	// IV测试 墙
	require("./IvInspectionWall");
	// 接线盒
	require("./JunctionBox");
	// 层压机
	require("./Laminator");
	// 层压机 腔体
	require("./LaminatorCavity");
	// 层压机 腔体 灯
	require("./LaminatorCavityLight");
	// 层压机 进料台
	require("./LaminatorLoadingTable");
	// 层压机 出料台
	require("./LaminatorUnLoadingTable");
	// 灯
	require("./Lamp");
	// 排版机器人
	require("./LayUpRobot");
	// 进料盒
	require("./LoadingBox");
	// 焊接模板放置机
	require("./ModelPlateLoader");
	// NG 料盒
	require("./NgBox");
	// 原地翻转机
	require("./OverTurningMachine");
	// 翻转检横版
	require("./OverTurningTestHorizontalMachine");
	// 翻转检竖版
	require("./OverTurningTestVerticalMachine");
	// 1.5块旋转平台
	require("./RotaryPlatformOneHalf");
	// 2块旋转平台
	require("./RotaryPlatformTwo");
	// 分档平台
	require("./SortingSystem");
	// 堆栈机 横
	require("./StackStationHorizontal");
	// 堆栈机 竖
	require("./StackStationVertical");
	// 贴胶带机
	require("./StickTapeMachine");
	// 先导串焊机
	require("./TabberStringer");
	// 串焊通道A/B
	require("./TabberStringerChannelAB");
	// 串检通道A/B
	require("./TabberStringerTestChannelAB");
	// TPT裁切机
	require("./TptSlittingMachine");
	// 竖板
	require("./VerticalPlate");
	// 0.5块竖板
	require("./VerticalPlateHalf");
	// 1块竖板
	require("./VerticalPlateOne");
	// 1.5块竖板
	require("./VerticalPlateOneHalf");
	// 2块竖板
	require("./VerticalPlateTwo");
	// 玻璃分拣机
	require("./GlassPicker");
	// 模版
	require("./ModulePlate");

	 */

	/*
	*/
	module.exports = {};
});