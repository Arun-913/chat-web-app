import axios, { AxiosError } from "axios";
import Cookies from "js-cookie"
import { useState } from "react"
import { useNavigate } from "react-router-dom";

export const Landing = () =>{
    const [roomId, setRoomId] = useState<string>('');
    const [roomPassword, setRoomPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [displayScreen, setDisplayScreen] = useState<string>('new');
    const [activeButton, setActiveButton] = useState<string>('new');
    const navigate = useNavigate();

    const handleButtonClick = (type:string) => {
        setActiveButton(type);
        setDisplayScreen(type);
        setRoomId('');
    };
    
    const handleCreateChatRoom = async() =>{
        const authToken = Cookies.get('authToken');
        if(!authToken){
            alert('You are not login');
            navigate('/signin');
            return;
        }
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/chat/create/room`, {
                roomPassword,
                authToken
            });

            // `${import.meta.env.VITE_BACKEND_URL}/v1/chat/create/room`, 
            //     { roomPassword},
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${authToken}`
            //         }
            //     }
            Cookies.set('roomIdToken', response.data.roomIdToken);
            setRoomId((response.data.roomId).toString());
            setTimeout(() =>{
                navigate(`/chat/${response.data.roomId}`);
            }, 2000);
        } catch (error) {
            if(axios.isAxiosError(error)){
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.status === 400) {
                    // @ts-ignore
                    if(axiosError.response.data.message){
                        // @ts-ignore
                        setError(axiosError.response.data.message);
                    }
                    else{
                        // @ts-ignore
                        setError(axiosError.response.data.issues[0].message);
                    }
                } else {
                    setError('An error occurred while processing your request. Please try again later.');
                }
            }else{
                setError('An unexpected error occurred. Please try again later.');
            }
            console.log(error);     
        }
    }

    const handleExistingChatRoom = async() =>{
        const authToken = Cookies.get('authToken');
        if(!authToken){
            alert('You are not login');
            navigate('/signin');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/chat/join/room`, {
                roomId,
                roomPassword,
                authToken
            });
            Cookies.set('roomIdToken', response.data.roomIdToken);
            setTimeout(() =>{
                navigate(`/chat/${roomId}`);
            }, 2000);
        } catch (error) {
            if(axios.isAxiosError(error)){
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.status === 400) {
                    // @ts-ignore
                    if(axiosError.response.data.message){
                        // @ts-ignore
                        setError(axiosError.response.data.message);
                    }
                    else{
                        // @ts-ignore
                        setError(axiosError.response.data.issues[0].message);
                    }
                } else {
                    setError('An error occurred while processing your request. Please try again later.');
                }
            }else{
                setError('An unexpected error occurred. Please try again later.');
            }
            console.log(error);
        }
    }

    return <>
        <div className="p-1 flex justify-center items-center">
            <button
                className={`p-2 text-lg m-2 w-30 cursor-pointer rounded-lg border-2 border-black  ${activeButton === 'new' ? 'active' : ''}`}
                onClick={() => handleButtonClick('new')}
            >Create Room</button>
            <button
                className={`p-2 text-lg m-2 w-30 cursor-pointer rounded-lg border-2 border-black ${activeButton === 'old' ? 'active' : ''}`}
                onClick={() => handleButtonClick('old')}
            >Join Room</button>
        </div>

        {displayScreen === 'new' ? <div className="flex flex-col justify-center items-center">
            {error != '' ? <div className="id">{error}</div> : <></>}
            <div className="h-1 text-lg m-6 w-30 cursor-pointer italic">Room Id will be automatically generate</div>
            <div className="text-lg p-2 font-bold">Room Id: {roomId}</div>
            <input 
                className="h-auto text-lg rounded-lg border-2 m-2 w-30 p-2 cursor-pointer font-bold border-black" 
                type="password" 
                placeholder="Enter Password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
            /><br />
            <button className="h-14 text-lg rounded-lg border-2 m-6 w-40 cursor-pointer bg-indigo-500" onClick={handleCreateChatRoom}>Create Room</button>
        </div> : <></>}

        {displayScreen === 'old' ? <div className="flex flex-col justify-center items-center">
            {error != '' ? <div className="id">{error}</div> : <></>}
            <input 
                className="h-10 border-2 rounded-lg p-2 text-lg mt-6 w-30 cursor-pointer font-bold border-black" 
                type="text" 
                placeholder="Enter Room Id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            /><br />
            <input 
                className="h-10 border-2 rounded-lg p-2 text-lg m-2 w-30 cursor-pointer font-bold border-black" 
                type="password" 
                placeholder="Enter Password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
            /><br />
            <button className="h-14 text-lg rounded-lg border-2 m-6 w-20 cursor-pointer bg-indigo-500 "onClick={handleExistingChatRoom}>Join</button>
        </div> : <></>}
    </>
}