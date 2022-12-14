import { useState, useEffect } from "react";
import "./App.css";
import Card from "./components/card/Card";
import Navbar from "./components/navbar/Navbar";
import {posts} from "./data";
import {io} from "socket.io-client"

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState("");
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    setSocket(io("http://localhost:5000"))

  }, [])

  useEffect(() => {
    socket?.emit("add-user", user)
  }, [socket, user])

  return (
    <div className="App">
      {user ? (
        <div className="main-page">
          <Navbar socket={socket} user={user}/>
          {
            posts.map(post => (
              post.username !== user &&
              <Card key={post.id} post={post} socket={socket} user={user} />
            ))
          }
        </div>
      ) : (
        <div className="login">
          <input
            type="text"
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => setUser(username)}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
