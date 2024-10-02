import {ref, onMounted, onBeforeUnmount, onDeactivated, onActivated} from 'vue';
import { io } from 'socket.io-client';

export const SOCKET_EVENT_PLAYBACK_START = 'socket_event_playback_start'
export const SOCKET_EVENT_PLAYBACK_UPDATE = 'socket_event_playback_update'
export const SOCKET_EVENT_PLAYBACK_END = 'socket_event_playback_end'
export const SOCKET_EVENT_PLAYBACK_EXCEPTION = 'socket_event_playback_exception'
export const SOCKET_EVENT_KEY_EVENT = 'key_event'


export const SOCKET_EVENT_DAILY_MISSION_START = 'socket_event_daily_mission_start'
export const SOCKET_EVENT_DAILY_MISSION_UPDATE = 'socket_event_daily_mission_update'
export const SOCKET_EVENT_DAILY_MISSION_END = 'socket_event_daily_mission_end'
export const SOCKET_EVENT_DAILY_MISSION_EXCEPTION = 'socket_event_daily_mission_exception'

// 地脉
export const SOCKET_EVENT_LEYLINE_OUTCROP_START = 'socket_event_leyline_mission_start'
export const SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE = 'socket_event_leyline_outcrop_update'
export const SOCKET_EVENT_LEYLINE_OUTCROP_END = 'socket_event_leyline_outcrop_end'
export const SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION = 'socket_event_leyline_outcrop_exception'

// 一条龙
export const SOCKET_EVENT_ONE_DRAGON_START = 'socket_event_one_dragon_start'
export const SOCKET_EVENT_ONE_DRAGON_UPDATE = 'socket_event_one_dragon_update'
export const SOCKET_EVENT_ONE_DRAGON_END = 'socket_event_one_dragon_end'
export const SOCKET_EVENT_ONE_DRAGON_EXCEPTION = 'socket_event_one_dragon_exception'


export function useWebSocket(socketURL, {
    onKeyEvent = null,
}) {
    const socket = ref(null);
    const isConnected = ref(false);
    // 监听事件

    const connectSocket = () => {
        socket.value = io(socketURL);
        socket.value.on('connect', () => {
            isConnected.value = true;
            console.log('WebSocket connection established');
        });

        socket.value.on('disconnect', () => {
            isConnected.value = false;
            console.log('WebSocket connection closed');
        });
        socket.value.on(SOCKET_EVENT_KEY_EVENT, (data) => {
            if(onKeyEvent) onKeyEvent(data);
        });

    };

    const disconnectSocket = () => {
        if (socket.value) {
            try {
                socket.value.disconnect(true);
            } catch (e) {
                debugger
            }
        }
    }
    onMounted(() => {
        connectSocket();
    });

    onBeforeUnmount(() => {
        disconnectSocket()
    });

    return {
        socket,
        isConnected,
        connectSocket,
        disconnectSocket
    };
}
