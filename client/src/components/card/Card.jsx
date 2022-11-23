import { useState } from "react"
import "./card.css"

const Card = ({post, socket, user}) => {
    const [liked, setLiked] = useState(false)

    const handleNotification = (type) => {
        setLiked(true)

        socket.emit("notification", {
            sender: user,
            receiver: post.username,
            type
        })
    }

    return (
        <div className="card">
            <div className="info">
                <img src={post.userImg} alt="profile" className="user-img" />
                <span>{post.fullname}</span>
            </div>
            <img src={post.postImg} alt="post" className="post-img" />
            <div className="interaction">
                {
                    liked ?
                    <i className="fa fa-heart red" onClick={() => setLiked(!liked)}></i>
                    :
                    <i className="fa fa-heart-o" onClick={() => handleNotification(1)}></i>
                }
                <i className="fa fa-comment" onClick={() => handleNotification(2)}></i>
                <i className="fa fa-share"></i>
            </div>
        </div>
    )
}

export default Card