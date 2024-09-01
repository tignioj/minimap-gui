import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';
export const SOCKET_EVENT_PLAYBACK_START = 'socket_event_playback_start'
export const SOCKET_EVENT_PLAYBACK_UPDATE = 'socket_event_playback_update'
export const SOCKET_EVENT_PLAYBACK_END = 'socket_event_playback_end'
export const SOCKET_EVENT_PLAYBACK_EXCEPTION = 'socket_event_playback_exception'
export const SOCKET_EVENT_KEY_EVENT = 'key_event'

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

    onMounted(() => {
        connectSocket();
    });

    onBeforeUnmount(() => {
        if (socket.value) {
            try {
                socket.value.disconnect(true);
            } catch (e) {
                debugger
            }
        }
    });

    return {
        socket,
        isConnected,
    };
}
