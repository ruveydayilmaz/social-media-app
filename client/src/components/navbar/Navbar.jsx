import { useEffect, useState } from "react"
import "./navbar.css"

const Navbar = ({socket}) => {
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        socket.on("get-notification", (data) => {
            setNotifications(prev => [...prev, data])
        })
    }, [socket])

    return (
        <div className="navbar">
            <span className="logo">Notify</span>
            <div className="icons">
                <i className="fa fa-search"></i>
                <div className="icon" onClick={() => setOpen(!open)}>
                    <i className="fa fa-bell"></i>        
                    {
                        notifications.length > 0 &&
                        <div className="counter">{notifications.length}</div> 
                    }    
                </div>

                <i className="fa fa-user"></i>
            </div>
            <div className="notifications">
                {
                    open &&
                    notifications.map(notification => (
                        <div className="notification">
                            <div className="message">
                                <span className="name">{notification.sender}</span>
                                <span className="text">
                                    {
                                        notification.type === 1 ? " liked your post" : " commented on your post"
                                    }
                                </span>
                            </div>
                        </div>
                    ))                  
                }

                {
                    open && notifications.length > 0 && <button className="mark" onClick={() => {setNotifications([]); setOpen(false)}}>Mark as read</button>
                }
                
            </div>
        </div>
    )
}

export default Navbar