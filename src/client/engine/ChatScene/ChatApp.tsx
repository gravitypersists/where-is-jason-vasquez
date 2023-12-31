import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import styled from "styled-components";
import { take, sortBy } from "lodash";
import { useGameState } from "../../State";
import Button from "../../ui/Button";
import { ChatSceneConfig } from "../../scenes";

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
  position: fixed;
  bottom: 0px;
  right: 0px;
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

const MessageLoading = () => {
  const [msg, setMsg] = useState<string>(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setMsg((prev) => {
        if (prev.length === 3) return ".";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <MessageItem key="loading" isOwn={false}>
      <MessageBubble isOwn={false}>{msg}</MessageBubble>
    </MessageItem>
  );
};

const ChatApp = () => {
  const { scene: sc, state, setState } = useGameState();
  const scene = sc as ChatSceneConfig;
  const botName = scene.config.bot;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const botState = state.botStates[botName] || [];

  useEffect(() => {
    if (botName === "none") return;
    const enforceMode = scene.config.enforceMode || [];
    const modes = [...botState, ...enforceMode];
    const socket = io("http://localhost:3030", {
      query: {
        botName,
        preload: scene.config.preload.map((x) => x.text),
        botState: JSON.stringify(modes),
      },
    });
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        `emit:${botName}:message`,
        ({ message, ts }: { message: string; ts: number }) => {
          setAwaitingResponse(false);
          setMessages(messageMerger(message, ts, false));
          const stringMatchActions = scene.config.stringMatches || [];
          stringMatchActions.map(({ match, do: doit }) => {
            if (message.includes(match)) {
              setState(doit);
            }
          });
        }
      );
      socket.on(
        `emit:${botName}:action`,
        ({ action }: { action: string[] }) => {
          console.log("got actions", action);
          const on = scene.config.on;
          if (!on) return;
          const timeout = action.some((a) => a === "delay") ? 4000 : 0;
          setTimeout(() => {
            action.forEach((a) => {
              if (on[a]) {
                setState(on[a]);
              }
            });
          }, timeout);
        }
      );
    }
  }, [socket, setAwaitingResponse, setMessages]);

  useEffect(() => {
    if (scene.config.waitMode && messages.length === 0) {
      setMessages([
        { text: scene.config.waitMode, isOwn: false, ts: Date.now() },
      ]);
      setAwaitingResponse(true);
      setTimeout(() => {
        setMessages(scene.config.preload);
        if (scene.config.nobodyHome) {
          setMessages([
            { text: "Nobody Answered", isOwn: false, ts: Date.now() },
          ]);
          setTimeout(() => {
            if (scene.config.on?.end) setState(scene.config.on.end);
          }, 4000);
        } else {
          setAwaitingResponse(false);
        }
      }, 2000);
    } else if (messages.length === 0) {
      setMessages(scene.config.preload);
    }
  }, [scene]);

  const handleSendMessage = () => {
    if (message === "") return;
    if (socket) {
      const ts = Date.now();
      const enforceMode = scene.config.enforceMode || [];
      const botModes = [...botState, ...enforceMode];

      console.log("sending message: ", { message, botModes });
      socket.emit(`send:${botName}:message`, {
        message,
        botModes,
      });
      setMessages(messageMerger(message, ts, true));
      setAwaitingResponse(true);
      setMessage("");
    }
  };

  const handleReset = () => {
    socket?.emit(`reset:${botName}`);
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
        {awaitingResponse && <MessageLoading />}
        {[...messages].reverse().map((msg, index) => (
          <MessageItem key={msg.ts} isOwn={msg.isOwn}>
            <MessageBubble isOwn={msg.isOwn}>{msg.text}</MessageBubble>
          </MessageItem>
        ))}
      </MessageList>
      {!awaitingResponse && (
        <ActionsContainer>
          <InputContainer>
            <InputField
              autoFocus
              type="text"
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(take(e.target.value, 60).join(""))}
              onKeyDown={handleKeyDown}
              disabled={awaitingResponse}
            />
            <SendButton
              onClick={handleSendMessage}
              disabled={message.length === 0}
            >
              ↵
            </SendButton>
          </InputContainer>
        </ActionsContainer>
      )}
      <ResetButton onClick={handleReset}>x</ResetButton>
    </Container>
  );
};

export default ChatApp;
