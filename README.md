# Chess Game

A full-stack real-time multiplayer chess application built with the MERN stack and Socket.IO.

## Features

### Authentication
- Sign up and log in with email and password
- Passwords hashed with bcrypt
- JWT-based auth using httpOnly cookies — access token (15 min) + refresh token (7 days)
- Automatic token refresh to keep sessions alive
- Protected routes on both frontend and backend

### Game Modes
- **Play Online** — get matched with a random opponent instantly
- **Play With Friends** — create a private room and share the room code for your friend to join

### Gameplay
- Full chess move validation powered by chess.js
- Live board updates via Socket.IO in real time
- 10-minute countdown timer per side, synced from the backend
- Resign at any point during the game
- Offer, accept, or reject a draw mid-game
- Game ends on checkmate, timeout, resign, or draw
- In-game real-time chat between the two players
- Reconnection support — rejoining a room with the same code restores your session

### User Profiles
- Profile page with avatar (uploaded to Cloudinary)
- Stats: rating, wins, losses, draws, games played, current winning streak, max winning streak
- Full match history with opponent names and game outcomes

### Rating System
- ELO-style rating starting at 1200
- Rating changes based on opponent's relative rating (+12/-12 if opponent is stronger, +8/-8 if weaker)

### Leaderboard
- Global leaderboard ranking all players by rating

### Friends System
- Search for users by name
- Send, accept, or reject friend requests
- View your friends list with real-time online status and activity (Idle, In Room, In Game)
- Friends sorted by availability — online and idle users appear first
- Invite an online friend directly to a game via a socket notification

---

## Tech Stack

### Frontend
| Library | Version |
|---|---|
| React | 19 |
| React Router DOM | 7 |
| Redux Toolkit | 2 |
| Socket.IO Client | 4 |
| Axios | 1 |
| Tailwind CSS | 4 |
| react-chessboard | 4 |
| React Toastify | 11 |

### Backend
| Library | Version |
|---|---|
| Node.js + Express | 5 |
| Socket.IO | 4 |
| Mongoose | 9 |
| MongoDB | — |
| jsonwebtoken | 9 |
| bcrypt | 6 |
| Cloudinary + Multer | — |
| async-mutex | 0.5 |
| chess.js | 1 |

---

## Project Structure

```
Chess-Game/
├── chess-backend/
│   ├── controllers/        # auth, user, leaderboard controllers
│   ├── middlewares/        # JWT verification middleware
│   ├── models/             # User, Game, Room Mongoose models
│   ├── routes/             # Express routers
│   ├── utilities/          # Cloudinary upload config
│   └── index.js            # Express + Socket.IO server entry point
│
└── chess-frontend/
    └── src/
        ├── api/            # Axios client
        ├── components/     # Layout, Profile, ProtectedRoute, LoadingPage
        ├── pages/          # Home, Login, Signup, Lobby, Game, Room,
        │                   # PlayOnline, Play_With_Friends, Friends, Leaderboard
        ├── slices/         # Redux slices (auth, friendInvite)
        ├── socket.js       # Socket.IO client setup
        └── store.js        # Redux store
```

---

## Getting Started

### Prerequisites
- Node.js
- MongoDB instance (local or Atlas)
- Cloudinary account (for avatar uploads)

### Backend Setup

```bash
cd chess-backend
npm install
```

Create a `.env` file in `chess-backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd chess-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Socket.IO Events

### Client → Server
| Event | Description |
|---|---|
| `user:online` | Mark user as online and register socket ID |
| `play:online` | Join the matchmaking queue |
| `leave:online` | Leave the matchmaking queue |
| `room:create` | Create a new private room |
| `room:join` | Join a room by room code |
| `room:leave` | Leave a room |
| `start:game` | Start the game in a private room |
| `game:state` | Fetch the current board state and clock |
| `game:move` | Make a move on the board |
| `player:resign` | Resign the game |
| `request:draw` | Offer a draw to the opponent |
| `accept:draw` | Accept the opponent's draw offer |
| `reject:draw` | Reject the opponent's draw offer |
| `invite:friend` | Send a game invite to a friend |
| `accept:invite` | Accept a friend's game invite |
| `reject:invite` | Reject a friend's game invite |
| `send:message` | Send a chat message in-game |
| `chat:history` | Fetch chat history for a room |

### Server → Client
| Event | Description |
|---|---|
| `room:presence` | Room state update (players joined/left) |
| `game:started` | Game has started |
| `game:update` | Board FEN and turn updated after a move |
| `game:over` | Game ended with result and reason |
| `clock:update` | Timer sync for both players |
| `time:out` | A player's clock ran out |
| `offered:draw` | Opponent offered a draw |
| `rejected:draw` | Opponent rejected your draw offer |
| `new:message` | New chat message received |
| `start:game` | Matchmaking complete, game room assigned |
| `invite` | Incoming game invite from a friend |
