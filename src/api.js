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
const setConfigInstance = `${serverURL}/config/set`;   // post方法 /set/<实例名称>
const getConfigInstances = `${serverURL}/config/instances`; //get 获取所有实例
const deleteConfigInstance = `${serverURL}/config/delete`; //get 删除指定实例，例如 /delete/instance1
const loginConfigInstance = `${serverURL}/config/login`; //get 登录指定实例， 例如/login/instance1


const getFightTeamListURL = `${serverURL}/fight_team/list`;
const getFightTeamContentURL= `${serverURL}/fight_team/get`;
const createFightTeamListURL = `${serverURL}/fight_team/create`;
const deleteFightTeamListURL = `${serverURL}/fight_team/delete`;
const updateFightTeamListURL = `${serverURL}/fight_team/update`;

// get方法，传送一个文件名称给服务器，服务器从本地读取文件运行战斗脚本
const runFightTeamFromSavedTextURL = `${serverURL}/fight_team/run`;
// post方法，传输文件名以及文本内容，加载到服务器内存，从内存中解析战斗脚本
const runFightTeamFromMemoryRL = `${serverURL}/fight_team/run_memory`;

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
    setConfigInstance,
    getConfigInstances,
    deleteConfigInstance,
    loginConfigInstance,

    // 队伍设置
    getFightTeamListURL,
    createFightTeamListURL,
    deleteFightTeamListURL,
    runFightTeamFromSavedTextURL,
    runFightTeamFromMemoryRL,
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
    oneDragonSaveURL
};
