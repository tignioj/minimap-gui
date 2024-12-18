const serverURL = "http://127.0.0.1:5000";
const socketURL = 'ws://127.0.0.1:5000';

/**
 * 返回[
 *     -3893.9776875000007,
 *     -1230.8299218749999
 * ]
 * 或者null
 * @type {string}
 */
const positionURL = `${serverURL}/minimap/get_insert_node`; // 返回

/**
 * 返回指定坐标和宽高的地图
 *  参数x,y,width
 *  例如 http://127.0.0.1:5000/minimap/get_region_map?x=10&y=10&width=100
 * @type {string}
 */
const imgURL = `${serverURL}/minimap/get_region_map`;  // 参数x,y,width, 返回格式image/jpeg

const pathListEditURL= `${serverURL}/pathlist/edit`;
const pathListListURL = `${serverURL}/pathlist/list`;
const pathListFileURL = `${serverURL}/pathlist/get`;
const pathListSaveURL= `${serverURL}/pathlist/save`;
const pathListRemoveURL= `${serverURL}/pathlist/delete`;

// 需要服务器允许跨域请求
const playBackURL= `${serverURL}/playback`;
const playBackStopURL = `${serverURL}/playback/stop`;

// 清单
const todoSaveURL = `${serverURL}/todo/save`;
const todoGetURL= `${serverURL}/todo/get`;
const todoRunURL= `${serverURL}/todo/run`;
const todoStopURL= `${serverURL}/todo/stop`;
const todoRemoveNotExitedFilesURL = `${serverURL}/todo/remove_not_exist_files`;

// 配置
const saveConfigURL = `${serverURL}/config/save`;
const getConfigURL = `${serverURL}/config/get`;
const setConfigInstanceURL = `${serverURL}/config/set`;   // post方法 /set/<实例名称>
const getConfigInstancesURL = `${serverURL}/config/instances`; //get 获取所有实例
const deleteConfigInstanceURL = `${serverURL}/config/delete`; //get 删除指定实例，例如 /delete/instance1
const createInstanceConfigURL= `${serverURL}/config/create_instance`; //get 删除指定实例，例如 /delete/instance1
const saveInstancesConfigURL= `${serverURL}/config/save_instances`; // 保存实例列表
const loginConfigInstance = `${serverURL}/config/login`; // POST登录, 需要表单数据传输账号、密码、服务器名称


const getFightTeamListURL = `${serverURL}/fight_team/list`;
const getFightTeamContentURL= `${serverURL}/fight_team/get`;
const createFightTeamListURL = `${serverURL}/fight_team/create`;
const deleteFightTeamListURL = `${serverURL}/fight_team/delete`;
const updateFightTeamListURL = `${serverURL}/fight_team/update`;

// get方法，传送一个文件名称给服务器，服务器从本地读取文件运行战斗脚本
const runFightTeamFromSavedTextURL = `${serverURL}/fight_team/run`;
// post方法，传输文件名以及文本内容，加载到服务器内存，从内存中解析战斗脚本
const runFightTeamFromMemoryURL = `${serverURL}/fight_team/run_memory`;

const stopFightTeamListURL = `${serverURL}/fight_team/stop`;
const setDefaultFightTeamURL = `${serverURL}/fight_team/set_default`;

// 每日委托
const runDailyMissionTaskURL= `${serverURL}/daily_mission/run`;
const stopDailyMissionTaskURL= `${serverURL}/daily_mission/stop`;
const dailyMissionSetConfigURL = `${serverURL}/daily_mission/set_config`;
const dailyMissionGetConfigURL = `${serverURL}/daily_mission/get_config`;
const claimRewardURL = `${serverURL}/daily_mission/claim_reward`;

// 地脉
const runLeyLineOutcropURL= `${serverURL}/leyline_outcrop/run`;
const stopLeyLineOutcropURL= `${serverURL}/leyline_outcrop/stop`;
const leyLineOutcropSetConfigURL = `${serverURL}/leyline_outcrop/set_config`;
const leyLineOutcropGetConfigURL = `${serverURL}/leyline_outcrop/get_config`;

// 一条龙
const oneDragonRunURL= `${serverURL}/one_dragon/run`;
const oneDragonStopURL= `${serverURL}/one_dragon/stop`;
const oneDragonGetURL= `${serverURL}/one_dragon/get`;  // 获取配置
const oneDragonSaveURL= `${serverURL}/one_dragon/save`; // 保存一条龙配置
const oneDragonRunAllInstanceURL= `${serverURL}/one_dragon/run_all_instance`; // 执行所有的实例的一条龙


// 秘境
const domainListURL = `${serverURL}/domain/list`  // GET请求获取所有秘境列表
const domainRunURL= `${serverURL}/domain/run`  // GET请求, URL参数domain_name=xx&fight_team=xx&timeout=xx
const domainStopURL= `${serverURL}/domain/stop`  // GET 请求停止执行秘境
const domainConfigGet = `${serverURL}/domain/config`  // GET
const domainConfigSet = `${serverURL}/domain/config` // PUT 修改配置

export {
    serverURL,
    positionURL,
    imgURL,
    pathListEditURL,
    pathListListURL,
    pathListFileURL,
    pathListSaveURL,
    pathListRemoveURL,
    socketURL,
    playBackURL,
    playBackStopURL,

    // 清单
    todoSaveURL,
    todoGetURL,
    todoRunURL,
    todoStopURL,
    todoRemoveNotExitedFilesURL,

    // 配置
    saveConfigURL,
    getConfigURL,
    setConfigInstanceURL,
    getConfigInstancesURL,
    deleteConfigInstanceURL,
    loginConfigInstance,
    createInstanceConfigURL,
    saveInstancesConfigURL,

    // 队伍设置
    getFightTeamListURL,
    createFightTeamListURL,
    deleteFightTeamListURL,
    runFightTeamFromSavedTextURL,
    runFightTeamFromMemoryURL,
    updateFightTeamListURL,
    stopFightTeamListURL,
    getFightTeamContentURL,
    setDefaultFightTeamURL,

    // 每日委托
    runDailyMissionTaskURL,
    stopDailyMissionTaskURL,
    dailyMissionGetConfigURL,
    dailyMissionSetConfigURL,

    claimRewardURL,

    // 地脉
    runLeyLineOutcropURL,
    stopLeyLineOutcropURL,
    leyLineOutcropSetConfigURL,
    leyLineOutcropGetConfigURL,

    // 一条龙
    oneDragonRunURL,
    oneDragonStopURL,
    oneDragonGetURL,
    oneDragonSaveURL,
    oneDragonRunAllInstanceURL,

    // 秘境
    domainListURL,
    domainRunURL,
    domainStopURL,
    domainConfigGet,
    domainConfigSet

};
