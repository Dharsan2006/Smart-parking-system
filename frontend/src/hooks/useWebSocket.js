import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const getWsUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '/ws');
  }
  return 'http://localhost:8081/ws';
};

const useWebSocket = (topic, onMessage) => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  // Keep a stable ref to the latest callback to avoid reconnecting on every render
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessageRef.current(data);
          } catch (e) {
            console.error('WebSocket message parse error:', e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [topic]); // Only reconnect when the topic changes

  return { connected };
};

export default useWebSocket;
