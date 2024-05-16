import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import Cookies from "js-cookie";
import axios from "axios";


const Sender: React.FC<{message: string}> = ({message}) =>{
    return (
        <div className="flex justify-end">
            <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs my-1 mx-2">
               {message}
            </div>
        </div>
    );
}

const Receiver: React.FC<{message: string}> = ({message}) =>{
    return (
        <div className="flex justify-start">
            <div className="bg-gray-300 p-2 rounded-lg max-w-xs my-1 mx-2">
                {message}
            </div>
        </div>
    );
}


export const Chat = () =>{
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>('hello');
    const [authToken, setAuthToken] = useState<string>('');
    const [roomIdToken, setRoomIdToken] = useState<string>('');
    const [element, setElement] =  useState<React.ReactNode[]>([]);
    
    const navigate = useNavigate();
    const {roomId} = useParams();

    useEffect(()=>{
        const authToken = Cookies.get('authToken');
        const roomIdToken = Cookies.get('roomIdToken');
        if(!authToken){
            alert('You are not login');
            navigate('/sigin');
        }
        else if(!roomIdToken){
            alert('This is room exist');
            navigate('/');
        }

        // @ts-ignore
        setAuthToken(authToken), setRoomIdToken(roomIdToken);

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
            const response:{email:string, message: string} | string[] = JSON.parse(event.data);
            if(Array.isArray(response)){
                response.forEach((element:string) => {
                    const data: {email: string, message: string} = JSON.parse(element);
                    console.log(data);
                    <Receiver key={Math.random()} message={data.message} />                    
                });
            }
            else{
                setElement(prevElement => [
                    ...prevElement, 
                    // @ts-ignore
                    <Receiver key={Math.random()} message={response.message} />
                ]);
            }
        }

        const recoverPreviousMessage = async() =>{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/chat/fetch`,{
                authToken,
                roomIdToken
            });
            response.data.forEach((element:string) => {
                const data: {email: string, message: string} = JSON.parse(element);
                console.log(data);
                setElement(prevElement => [
                    ...prevElement, <Receiver key={Math.random()} message={data.message} />
                ]);
            });
        }
        
        recoverPreviousMessage();
        
        return () =>{
            if (socket?.readyState === WebSocket.OPEN) {
                // WebSocket connection is open, send data
                socket.send(JSON.stringify({
                    type: 'remove',
                    roomIdToken
                }));
                socket.close();
            } else {
                // WebSocket connection is not yet open
                console.error('WebSocket connection is not yet open.');
            }
        }
    },[]);
    
    const sendMessage = () =>{
        if(message === '') return;
        setElement(prevElement => [
            ...prevElement, 
            <Sender key={Math.random()} message={message}/>
        ]);
        socket?.send(JSON.stringify({
            type: 'message',
            authToken,
            roomIdToken,
            message
        }));
        setMessage('');
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) =>{
        if(event.key === 'Enter'){
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <div>
            <div className="w-screen text-center text-3xl font-bold italic fixed top-0 bg-white">
                Room Id: {roomId}
            </div>
            <div className="flex flex-col h-screen mt-20 overflow-y-auto" style={{height: '75vh'}}>
                {element}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100">
                <input 
                    type="text"
                    placeholder="Type your message..." 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300" 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2" 
                    onClick={sendMessage}
                >Send</button>
            </div>
        </div>
    );
}