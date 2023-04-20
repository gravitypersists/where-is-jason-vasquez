import { Server, Socket } from "socket.io";
import LoadableNpc from "../npcs/base/LoadableNpc";
import path from "path";

const io = new Server({
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  },
});

const botPaths = {
  mother: "../npcs/Mother",
  bartender: "../npcs/Bartender",
  policedesk: "../npcs/PoliceDesk",
  detective: "../npcs/Detective",
  receptionist: "../npcs/Receptionist",
  landlord: "../npcs/Landlord",
  neighbor1: "../npcs/Neighbor1",
};

io.on("connection", (socket: Socket) => {
  const botName = socket.handshake.query.botName as keyof typeof botPaths;
  if (botPaths[botName] === undefined) {
    console.error("Bad bot name: ", botName);
    return;
  }
  const preload = socket.handshake.query.preload as string;
  const botState = JSON.parse(
    socket.handshake.query.botState as string
  ) as string[];
  console.log(`User ${socket.id} connected to ${botName}`);
  const { id } = socket;
  const bot = new LoadableNpc({
    dir: path.join(__dirname, botPaths[botName]),
    preload,
    onAction: (action) => {
      console.log("emitting bot action: ", action);
      io.emit(`emit:${botName}:action`, {
        action,
      });
    },
  });
  bot.setModes(botState);

  socket.on(
    `send:${botName}:message`,
    ({ message, ts }: { message: string; ts: number }) => {
      console.log(`Received message: ${message}`);
      if (!message || message === "") throw new Error("Bad message");
      bot.respond(message).then((response) => {
        console.log("emitting bot message: ", response);
        io.emit(`emit:${botName}:message`, {
          message: response,
          ts: Date.now(),
          botState: bot.getModes(),
        });
      });
    }
  );

  socket.on(`reset:${botName}`, () => {
    bot.reset();
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

io.listen(3030);
