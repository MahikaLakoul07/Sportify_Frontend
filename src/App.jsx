import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Navbar from './components/navbar/navbar';
import Footer from './components/Footer/Footer';
import Register from './pages/Register/Register';
import Grounds from './pages/Grounds/Grounds';
import "./App.css";

const App = () => {
  return (
    <>
    <Navbar />
     <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/grounds' element={<Grounds/>} />
     </Routes>
    <Footer />

    </>
  );
};

export default memo(App);