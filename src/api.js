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
const positionURL = `${serverURL}/minimap/get_position`; // 返回

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

//
const todoSaveURL = `${serverURL}/todo/save`;
const todoGetURL= `${serverURL}/todo/get`;
const todoRunURL= `${serverURL}/todo/run`;
const todoStopURL= `${serverURL}/todo/stop`;

//
const saveConfigURL = `${serverURL}/config/save`;
const getConfigURL = `${serverURL}/config/get`;

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
    todoSaveURL,
    todoGetURL,
    todoRunURL,
    todoStopURL,
    saveConfigURL,
    getConfigURL,

    getFightTeamListURL,
    createFightTeamListURL,
    deleteFightTeamListURL,
    runFightTeamFromSavedTextURL,
    runFightTeamFromMemoryRL,
    updateFightTeamListURL,
    stopFightTeamListURL,
    getFightTeamContentURL,
    setDefaultFightTeamURL,

};
