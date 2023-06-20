# Where is Jason Vasquez?

This is a prototype game where you are tasked to find the missing person, Jason. You can navigate to individuals and interact with them via a chat menu, using your investigative powers, savvy, or even deception, to work your way through the mystery.

This works via the "OP Stack" - OpenAI + Pinecone vector database. Fundamentally, each character will be prompted with contextual information and the player can influence and unlock states within the characters to access further information.

It is a project that worked as a vehicle for me to learn about vector databases and how to think about LLM-based chatbots. The code is not perfect, not production/enterprise-grade, so please don't judge my code quality standards from this project.

If you'd like to play, you need to run it locally, currently. And there's only so far you can go (hint: try to get into Jason's apartment, that is as far as the content goes for now). See instructions down below

## NPCs (the fun stuff)

I found that reducing NPC configurations to JSON quite useful as it allows NPCs to be made simply.

- _Reproducible responses_: A big challenge is in making sure NPCs respond reliably, as ChatGPT will often invent facts I don't want it to, ones that serve as distractions for a mystery game. To battle this, I try to give the NPC a way of accessing the complete set of knowledge about the system. This current system solves this problem but needs significant improvement still.
- _Masking inforation_: Another challenge was in not letting NPCs know the whole entire solution as the player could just ask "What are you not telling me?" compelling ChatGPT to give up the goods. To battle this, I simply don't give ChatGPT the information unless the player prompts it, this is where a Vector DB helps as I can pass player inputs through that to map into context for the bot.

- NPC configuation in /npcs
  - `baseSystem` is an always present context applied to every API interaction
  - `modes` gives NPCs states, I prototyped several ways to manage state transitions for these NPCs. For instance, if you inform the administrator at the police station that you're a PI, she will enter a less rude to you and connect you with the appropriate detective.
  - `contexts` are predictions of how the player will interact with the NPC. I use vector DB to compare their inputs to these sentences, and if they match, I populate the chat context with facts. For example, if you begin to question the Bartender about a break-in, his ChatGPT context will gain new information about. Contexts can also prompt
  - `facts` if the user prompts a matching context which lists these facts, this information is preloaded into ChatGPT's system so that it can respond with the relevant knowledge. Facts can respect the mode of the npc as well, an NPC which likes you will have more information granted to them to inform you.
  - `permanentFacts` are facts that once learned, always persist in the prompt. These were important things that NPCs presumably would not forget about - forgetting, being a necessary cost-optimization for ChatGPT
  - `actions` are sentences which act as keys to tell the game to switch modes on the NPCs. I first went down the path of matching contexts and thought about sentiment analysis, but I found the best way to handle state switching is to just tell ChatGPT "if you are annoyed by me, tell me 'This conversation is starting to annoy me'". As well, it's a way to progress the story, as the NPC can say "Sure, here's the code to the front gate" which can be used to unlock more locations, and thus, NPCs in the game

## Code organization:

- Frontend code is in src/client and is an ad hoc React based layout

  - Every screen is a "Scene" and the props for the scenes are encoded in scenes.ts
  - Different types of scenes have different rendering engines behind them, within client/engine
  - In retrospect, I probably should have just used a game engine out of the box :/

- Backend code is within src/server, and is currently a thin socket layer with no scalability or cost thoughts in mind. Ideally, we ask the user for an OpenAPI key but I still need to obscure a Pinecone API key so a backend, is, unfortunately, necessary.

  - npc behavior is captured in /npcs/base, which is mostly their backend behavior. This code is fundamentally a mess because it's where most of the prototyping to this prototype actually happened.

- Populating the vector DB with new `contexts` is all done via the `scripts` directory. A local copy of embeddings is kept to keep OpenAI costs minimal - if the sentence is not discovered in embeddings.json it will be passed to OpenAI to be created via `yarn embed`.

## Running this project

Add a Pinecone key and OpenAI key to `.env`

Pull down the repo, and with node and yarn installed (`npm i -g yarn`), run `yarn` to install deps and then:

- `yarn serve` to run the backend
- `yarn dev` to run the frontend (via vite), open the link that this step reveals
- `yarn populate` to populate a pinecone db (hardcoded as "npcs" index).

(the game uses localStorage to save game state, so to reset your client state, do a `localStorage.clear()` in the js console).
