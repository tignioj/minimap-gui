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

// 监听事件
const key_event = 'key_event';  // 监听服务器的快捷键
const playback_event = 'playback_event';  // 监听回放事件

export {
    serverURL,
    positionURL,
    imgURL,
    pathListEditURL,
    pathListListURL,
    pathListFileURL,
    pathListSaveURL,
    socketURL,
    playBackURL,
    playBackStopURL,
    todoSaveURL,
    todoGetURL,
    todoRunURL,
    todoStopURL,
    saveConfigURL,
    getConfigURL,
    key_event,
    playback_event
};
