import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import styled from "styled-components";
import { take, sortBy } from "lodash";
import Button from "../../ui/Button";

const Container = styled.div`
  padding: 20px;
  font-family: "VT323", monospace;
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
  color: ${({ isOwn }) => (isOwn ? "#e9e9e9;" : "#fcffc4")};
  text-align: ${({ isOwn }) => (isOwn ? "right" : "left")};
  box-shadow: rgba(0, 0, 0, 0.5) -2px 2px 2px 0px;
  background-color: ${({ isOwn }) =>
    isOwn ? "rgb(14 50 63 / 93%)" : "rgb(34 22 20 / 93%)"}; ;
`;

const ActionsContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  position: relative;
  flex: 1;
`;

const InputField = styled.input`
  font-family: "VT323", monospace;
  padding: 10px;
  padding-right: 40px;
  font-size: 16px;
  border: none;
  outline: none;
  background-color: rgb(0 0 0 / 80%);
  color: #e9e9e9;
  width: 100%;
  box-sizing: border-box;
`;

const SendButton = styled(Button)`
  position: absolute;
  right: 0;
`;

const ResetButton = styled(Button)`
  background-color: rgb(51 45 45);
  color: #f66f6f;
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

const defaultMsgs = [
  { text: "My son is missing. Please help me find him.", isOwn: false, ts: 0 },
  //   { text: "Hi!", isOwn: true, ts: 2 },
  //   { text: "How are you?", isOwn: false, ts: 3 },
  //   { text: "I'm working here.", isOwn: true, ts: 4 },
  //   {
  //     text: "I can see that. Can I request your services.",
  //     isOwn: false,
  //     ts: 5,
  //   },
];

const ChatApp = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(defaultMsgs);

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
          <MessageItem key={msg.ts} isOwn={msg.isOwn}>
            <MessageBubble isOwn={msg.isOwn}>{msg.text}</MessageBubble>
          </MessageItem>
        ))}
      </MessageList>
      <ActionsContainer>
        <InputContainer>
          <InputField
            autoFocus
            type="text"
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(take(e.target.value, 60).join(""))}
            onKeyDown={handleKeyDown}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={message.length === 0}
          >
            ↵
          </SendButton>
        </InputContainer>
        <ResetButton onClick={handleReset}>x</ResetButton>
      </ActionsContainer>
    </Container>
  );
};

export default ChatApp;
