import axios, { AxiosError } from "axios";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export const SignUp = () =>{
    const [name, setName] = useState<string>('');
    const [email, setEmail] =  useState<string>('');
    const [password, setPassword] =  useState<string>('');
    const [error, setError] = useState<string>('');
    const [verified, setVerified] = useState<boolean>(false);
    const navigate = useNavigate();

    const handelOnClick = async(event: React.FormEvent) =>{
        event?.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/v1/user/signup`,{
                name,
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

    // @ts-ignore
    async function onChange(recaptchaResponse) {;
        const response = await axios.get(`/api/recaptcha/api/siteverify?secret=${import.meta.env.VITE_GOOGLE_SECRET_KEY}&response=${recaptchaResponse}`);
        console.log(response);
        if(response.data.success === true){
            setVerified(true);
        }
        else{
            setError('You are not a legismate user');
        }
    }

    return (
        <>
            <form className="h-screen flex justify-center items-center" onSubmit={handelOnClick}>
                <div>
                    <div>
                        <label>Name: &nbsp;&nbsp;&nbsp;&nbsp;</label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="rounded border-2 border-black m-2 p-1"
                            type="text" placeholder="Enter name" />
                    </div>
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

                    <ReCAPTCHA
                        className="m-2"
                        sitekey={import.meta.env.VITE_GOOGLE_SITE_KEY}
                        onChange={onChange}
                    />
                    <div className="flex justify-center items-center">
                        <button className="h-14 text-lg rounded-lg border-2 m-6 w-20 bg-indigo-500" style={{color:"white"}} type="submit" disabled={!verified}>Signup</button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </form>
        </>
    );
}