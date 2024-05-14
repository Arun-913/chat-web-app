
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Landing } from './components/Landing'
import { SignIn } from './components/Signin'
import { SignUp } from './components/Signup'
import { Chat } from './components/Chat'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/chat/:roomId' element={<Chat/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
