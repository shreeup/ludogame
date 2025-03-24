import { useEffect, useState } from 'react';

const useWebSocket = (serverUrl: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(serverUrl);
    setSocket(ws);

    ws.onopen = () => console.log('Connected to WebSocket server');
    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        setGameState(data);
        setLastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message', error);
      }
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = error => console.error('WebSocket error', error);

    return () => {
      ws.close();
    };
  }, [serverUrl]);

  const sendMessage = (message: object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { socket, gameState, sendMessage, lastMessage };
};

export default useWebSocket;
