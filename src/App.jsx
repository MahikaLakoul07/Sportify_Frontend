import { memo } from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/Footer/Footer";

import Grounds from "./pages/Grounds/Grounds";
import CreateGround from "./pages/Grounds/CreateGround";
import GroundDetails from "./pages/Grounds/GroundDetails";
import BookGround from "./pages/Bookings/BookGround";
import MyBookings from "./pages/Bookings/MyBookings";
import MyBookingDetails from "./pages/Bookings/MyBookingDetails";

import BrowseArena from "./pages/BrowseArena/BrowseArena";
import Checkout from "./pages/Checkout/Checkout";
import UserRequest from "./pages/UserRequest/UserRequest";
import Inbox from "./pages/Inbox/Inbox";
import Chat from "./pages/Chat/Chat";
import PlayerProfile from "./pages/Profile/PlayerProfile";
import Notifications from "./pages/Notifications/Notifications";

import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFailure from "./pages/PaymentFailure.jsx";

import OwnerRoute from "./components/OwnerRoute";
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard.jsx";

import PlayerDashboard from "./pages/Dashboard/PlayerDashboard.jsx";

import "./App.css";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browsearena" element={<BrowseArena />} />
        <Route path="/grounds" element={<Grounds />} />
        <Route path="/grounds/:id" element={<GroundDetails />} />
        <Route path="/grounds/:id/book" element={<BookGround />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/userrequest" element={<UserRequest />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/playerprofile" element={<PlayerProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />

        {/* PLAYER DASHBOARD */}
        <Route path="/player" element={<PlayerDashboard />} />

        {/* OWNER DASHBOARD (PROTECTED) */}
        <Route
          path="/owner"
          element={
            <OwnerRoute>
              <OwnerDashboard />
            </OwnerRoute>
          }
        />

        {/* CREATE GROUND (OWNER ONLY) */}
        <Route
          path="/createground"
          element={
            <OwnerRoute>
              <CreateGround />
            </OwnerRoute>
          }
        />

        {/* PLAYER BOOKINGS */}
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/mybookings/:bookingId" element={<MyBookingDetails />} />
      </Routes>

      <Footer />
    </>
  );
};

export default memo(App);