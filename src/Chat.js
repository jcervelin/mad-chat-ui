import React, { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';


const MessageInput = ({ onSendMessage, newMessage, setNewMessage, isDisabled }) => (
  <div className="message-input">
    <input
      type="text"
      placeholder="Enter your message"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
    />
    <button onClick={onSendMessage} disabled={isDisabled || !newMessage}>
      Send
    </button>
  </div>
);
const NameInput = ({ username, setUsername }) => (
  <div className="user-container">
    <input
      type="text"
      placeholder="Enter your username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>
)

const MessageList = ({ chatMessagesRef, messageHistory }) => (
  <div ref={chatMessagesRef} className="messages message-container">
    {messageHistory.map((msg, index) => (
      <div className="message" key={index}>
        <strong>{msg.user}:</strong> {msg.content}
      </div>
    ))}
  </div>
);


const Chat = () => {
  const WS_URL = 'ws://localhost:8080/messages';
  const chatMessagesRef = useRef(null);

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

  useEffect(() =>{
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
  }, [messageHistory])

  const handleClickSendMessage = () => {
    console.log("Called callback")
    sendJsonMessage({
      user: username,
      content: newMessage
    })
    setNewMessage("")
  };

  const {type, color} = {
    [ReadyState.CONNECTING]: {type: "Connecting", color: "blue"},
    [ReadyState.OPEN]: {type: "Connected",color: "green"},
    [ReadyState.CLOSING]: {type: "Closing",color: "gray"},
    [ReadyState.CLOSED]: {type: "Closed",color: "red"},
    [ReadyState.UNINSTANTIATED]: {type: "Uninstantiated",color: "purple"}
  }[readyState];

  return (
    <div id="chat">
      <h1>Websocket Chat</h1>
      <br />
      <div>Status: <span style={{color:color}}>{type}</span></div>
      <NameInput username={username} setUsername={setUsername} />
      <MessageList chatMessagesRef={chatMessagesRef} messageHistory={messageHistory} />
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
