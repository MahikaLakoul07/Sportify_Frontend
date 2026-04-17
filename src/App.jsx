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
import Players from "./pages/Players/Players";

import OwnerRoute from "./components/OwnerRoute";
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard.jsx";
import OwnerMyGrounds from "./pages/Owner/OwnerMyGrounds/OwnerMyGrounds.jsx";
import OwnerGroundBookings from "./pages/Owner/OwnerBookings/OwnerBookings.jsx";
import OwnerEditGround from "./pages/Owner/OwnerEditGrounds/OwnerEditGrounds.jsx";
import OpenGames from "./pages/OpenGames/OpenGames.jsx";
import OwnerGroundAvailability from "./pages/Owner/OwnerGroundAvailability/OwnerGroundAvailability.jsx";
import ViewPlayerProfile from "./pages/Profile/ViewPlayerProfile.jsx";

import PlayerDashboard from "./pages/Dashboard/PlayerDashboard.jsx";

import "./App.css";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
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
        <Route path="/chat/group/:id" element={<Chat />} />
        <Route path="/chat/friend/:id" element={<Chat />} />
        <Route path="/playerprofile" element={<PlayerProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:playerId" element={<ViewPlayerProfile />} />

        <Route
          path="/owner/grounds/:id/availability"
          element={
            <OwnerRoute>
              <OwnerGroundAvailability />
            </OwnerRoute>
          }
        />

        <Route path="/player" element={<PlayerDashboard />} />

        <Route
          path="/owner"
          element={
            <OwnerRoute>
              <OwnerDashboard />
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/bookings"
          element={
            <OwnerRoute>
              <OwnerGroundBookings />
            </OwnerRoute>
          }
        />

        <Route
          path="/createground"
          element={
            <OwnerRoute>
              <CreateGround />
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/grounds"
          element={
            <OwnerRoute>
              <OwnerMyGrounds />
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/grounds/:id/bookings"
          element={
            <OwnerRoute>
              <OwnerGroundBookings />
            </OwnerRoute>
          }
        />

        <Route
          path="/owner/grounds/:id/edit"
          element={
            <OwnerRoute>
              <OwnerEditGround />
            </OwnerRoute>
          }
        />

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