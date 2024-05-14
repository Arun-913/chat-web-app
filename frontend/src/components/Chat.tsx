import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Cookies from "js-cookie";

export const Chat = () =>{
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>('hello');
    const {roomId} = useParams();
    console.log("roomId : ", roomId);

    useEffect(()=>{
        const authToken = Cookies.get('authToken');
        const roomIdToken = Cookies.get('roomIdToken');
        console.log(roomIdToken);
        if(!authToken){
            alert('You are not login');
            navigate('/sigin');
        }
        else if(!roomIdToken){
            alert('This is room exist');
            navigate('/');
        }

        const socket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URL}`);
        setSocket(socket);
        socket.onopen = () =>{
            socket.send(JSON.stringify({
                type: 'authenticate',
                authToken,
                roomIdToken
            }));
        }
        
        socket.onmessage = (event)=>{
            const response = JSON.parse(event.data);
            console.log(response);
        }
        
        return () =>{
            socket.close();
        }
    },[]);
    
    const sendMessage = ()=>{
        socket?.send(JSON.stringify({
            type: 'message',
            message
        }));
    }

    return <>
        Room Id is {roomId}<br/>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)}/> <br/>
        <button onClick={sendMessage}>sendMessage</button>
    </>
}