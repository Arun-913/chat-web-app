import axios, { AxiosError } from "axios";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

export const SignIn = () =>{
    const [email, setEmail] =  useState<string>('');
    const [password, setPassword] =  useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();


    const handelOnClick = async(event: React.FormEvent) =>{
        event?.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/user/signin`,{
                email,
                password
            });
            Cookies.set('authToken', response.data.authToken, {expires: 2});
            setError('');
            navigate('/');
        } catch (error) {
            if (axios.isAxiosError(error)) {
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
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
            console.error(error);
        }
    }

    return (
        <>
            <form className="h-screen flex justify-center items-center" onSubmit={handelOnClick}>
                <div>
                    <div>
                        <label>Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="rounded border-2 border-black m-2 p-1"
                            type="email" placeholder="example@email.com" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="rounded border-2 border-black m-2 whitespace p-1"
                            type="password" placeholder="Enter password" />
                    </div>
                    <div className="flex justify-center items-center">
                        <button className="rounded border-2 border-black p-1" type="submit">Signin</button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </form>
        </>
    );
}