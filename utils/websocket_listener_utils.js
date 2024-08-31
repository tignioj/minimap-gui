import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';
export function useWebSocket(socketURL, {
    onKeyEvent = null,
    onPlaybackEvent = null,
}) {
    const socket = ref(null);
    const isConnected = ref(false);

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

        socket.value.on('key_event', (data) => {
            onKeyEvent(data);
        });

        socket.value.on('playback_event', (data) => {
            onPlaybackEvent(data)
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
