import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import styled from "styled-components";
import { take, sortBy } from "lodash";

const Container = styled.div`
  width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

const MessageList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
`;

const MessageItem = styled.li<{ isOwn: boolean }>`
  display: flex;
  margin-bottom: 10px;
  justify-content: ${({ isOwn }) => (isOwn ? "flex-end" : "flex-start")}; ;
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  padding: 10px;
  border-radius: 10px;
  background-color: ${({ isOwn }) => (isOwn ? "#C9F1FF" : "#F0F0F0")}; ;
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  outline: none;
`;

const Button = styled.button`
  background-color: #007aff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  margin-left: 10px;
  border: none;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: #0060d6;
  }
`;

const ResetButton = styled(Button)`
  background-color: #e91e63;
  &:hover {
    background-color: #b3003c;
  }
`;

type Message = { text: string; isOwn: boolean; ts: number };

const messageMerger =
  (message: string, ts: number, isOwn: boolean) =>
  (prevMessages: Message[]) => {
    const newList = [...prevMessages, { text: message, isOwn, ts }];
    return sortBy(newList, "ts");
  };

const ChatApp = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:3030");
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        "emit:bartender:message",
        ({ message, ts }: { message: string; ts: number }) => {
          console.log("received message: ", message);
          setMessages(messageMerger(message, ts, false));
        }
      );
    }
  }, [socket]);

  const handleSendMessage = () => {
    if (message === "") return;
    if (socket) {
      const ts = Date.now();
      console.log("sending message: ", { message, ts });
      socket.emit("send:bartender:message", { message, ts });
      setMessages(messageMerger(message, ts, true));
      setMessage("");
    }
  };

  const handleReset = () => {
    socket?.emit("reset:bartender");
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Container>
      <MessageList>
        {[...messages].reverse().map((msg, index) => (
          <MessageItem key={msg.text} isOwn={msg.isOwn}>
            <MessageBubble isOwn={msg.isOwn}>{msg.text}</MessageBubble>
          </MessageItem>
        ))}
      </MessageList>
      <InputContainer>
        <InputField
          autoFocus
          type="text"
          placeholder="Type your message here"
          value={message}
          onChange={(e) => setMessage(take(e.target.value, 60).join(""))}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSendMessage}>Send</Button>
        <ResetButton onClick={handleReset}>Reset</ResetButton>
      </InputContainer>
    </Container>
  );
};

export default ChatApp;
