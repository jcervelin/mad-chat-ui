import React, { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';


const MessageInput = ({ onSendMessage, newMessage, setNewMessage, isDisabled }) => (
  <div>
    <input
      type="text"
      placeholder="Enter your message"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
    />
    <button onClick={onSendMessage} disabled={isDisabled}>
      Send
    </button>
  </div>
);
const NameInput = ({ username, setUsername }) => (
  <div class="user-container">
    <input
      type="text"
      placeholder="Enter your username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>
)

const MessageList = ({ messageHistory }) => (
  <div className="messages message-container">
    {messageHistory.map((msg, index) => (
      <div key={index}>
        <strong>{msg.user}:</strong> {msg.content}
      </div>
    ))}
  </div>
);


const Chat = () => {
  const WS_URL = 'ws://localhost:8080/messages';

  const [username, setUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log("Connected to WebSocket"),
    shouldReconnect: (_) => true, // Auto-reconnect on disconnect
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastJsonMessage));
    }
  }, [lastJsonMessage]);

  const handleClickSendMessage = () => {
    console.log("Called callback")
    sendJsonMessage({
      user: username,
      content: newMessage
    })
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div id="chat">
      <h1>Chat</h1>
      <div>Status: {connectionStatus}</div>
      <NameInput username={username} setUsername={setUsername} />
      <MessageList messageHistory={messageHistory} />
      <MessageInput
        onSendMessage={handleClickSendMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isDisabled={readyState !== ReadyState.OPEN}
      />
    </div>
  );
};

export default Chat;
