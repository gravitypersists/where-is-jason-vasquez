import { Server, Socket } from "socket.io";
import LoadableNpc from "../npcs/base/LoadableNpc";
import path from "path";

const io = new Server({
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log(`User ${socket.id} connected`);
  const { id } = socket;
  const bartender = new LoadableNpc(path.join(__dirname, "../npcs/Mother"));

  socket.on(
    "send:bartender:message",
    ({ message, ts }: { message: string; ts: number }) => {
      console.log(`Received message: ${message}`);
      if (!message || message === "") throw new Error("Bad message");
      bartender.respond(message).then((response) => {
        console.log("emitting bot message: ", response);
        io.emit("emit:bartender:message", {
          message: response,
          ts: Date.now(),
        });
      });
    }
  );

  socket.on("reset:bartender", () => {
    bartender.reset();
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

io.listen(3030);
