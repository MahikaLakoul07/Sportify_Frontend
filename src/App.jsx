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

import OwnerRoute from "./components/OwnerRoute";
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard.jsx";
import OwnerMyGrounds from "./pages/Owner/OwnerMyGrounds/OwnerMyGrounds.jsx";
import OwnerGroundBookings from "./pages/Owner/OwnerBookings/OwnerBookings.jsx";
import OwnerReports from "./pages/Owner/OwnerReports/OwnerReports.jsx";
import OwnerEditGround from "./pages/Owner/OwnerEditGrounds/OwnerEditGrounds.jsx";
import OpenGames from "./pages/OpenGames/OpenGames.jsx";
import OwnerGroundAvailability from "./pages/Owner/OwnerGroundAvailability/OwnerGroundAvailability.jsx";

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
        <Route path="/owner/grounds/:id/availability" element={<OwnerGroundAvailability />} />

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

        {/* OWNER'S GROUNDS */}
        <Route
          path="/owner/grounds"
          element={
            <OwnerRoute>
              <OwnerMyGrounds />
            </OwnerRoute>
          }
        />

        {/* OWNER'S GROUND BOOKINGS */}
        <Route
          path="/owner/grounds/:id/bookings"
          element={
            <OwnerRoute>
              <OwnerGroundBookings />
            </OwnerRoute>
          }
        />

        {/* OWNER'S GROUND EDITING */}
        <Route
          path="/owner/grounds/:id/edit"
          element={
            <OwnerRoute>
              <OwnerEditGround />
            </OwnerRoute>
          }
        />

        {/* OWNER'S REPORTS */}
        <Route
          path="/owner/reports"
          element={
            <OwnerRoute>
              <OwnerReports />
            </OwnerRoute>
          }
        />

        {/* PLAYER BOOKINGS */}
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/mybookings/:bookingId" element={<MyBookingDetails />} />
        <Route path="/open-games" element={<OpenGames />} />
        <Route path="/open-games/:id" element={<OpenGames />} />
      </Routes>

      <Footer />
    </>
  );
};

export default memo(App);