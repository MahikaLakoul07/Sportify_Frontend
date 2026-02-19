import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Navbar from './components/navbar/navbar';
import Footer from './components/Footer/Footer';
import Register from './pages/Register/Register';
import Grounds from './pages/Grounds/Grounds';
import CreateGround from './pages/Grounds/CreateGround';
import OwnerRoute from './components/OwnerRoute'; 
import GroundDetails from './pages/Grounds/GroundDetails';
import BookGround from './pages/Bookings/BookGround'; 
import MyBookings from './pages/Bookings/MyBookings';
import MyBookingDetails from './pages/Bookings/MyBookingDetails';
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
      <Route path='/createground' element={
        <OwnerRoute>
          <CreateGround />
        </OwnerRoute>
      } />
      <Route path='/grounds/:id' element={<GroundDetails />} />
      <Route path='/grounds/:id/book' element={<BookGround />} />
      <Route path='/mybookings' element={<MyBookings />} />
      <Route path='/mybookings/:bookingId' element={<MyBookingDetails />} />
     </Routes>
    <Footer />

    </>
  );
};

export default memo(App);