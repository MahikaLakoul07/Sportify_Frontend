import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyBookings.css";

export default function MyBookings() {
  const nav = useNavigate();

  const demoBookings = useMemo(function () {
    return [
      {
        booking_id: 101,
        ground_id: 1,
        ground_name: "Dhuku Futsal Hub",
        date: "2026-02-20",
        slot: "18:00 - 19:00",
        booking_type: "PUBLIC",
        payment_method: "FIELD",
        status: "PENDING",
      },
      {
        booking_id: 102,
        ground_id: 3,
        ground_name: "Field Futsal",
        date: "2026-02-10",
        slot: "19:00 - 20:00",
        booking_type: "PRIVATE",
        payment_method: "ONLINE",
        status: "CONFIRMED",
      },
      {
        booking_id: 88,
        ground_id: 2,
        ground_name: "Khelkunj Arena",
        date: "2026-01-22",
        slot: "17:00 - 18:00",
        booking_type: "PUBLIC",
        payment_method: "FIELD",
        status: "COMPLETED",
      },
      {
        booking_id: 77,
        ground_id: 1,
        ground_name: "Dhuku Futsal Hub",
        date: "2026-01-10",
        slot: "16:00 - 17:00",
        booking_type: "PRIVATE",
        payment_method: "FIELD",
        status: "CANCELLED",
      },
    ];
  }, []);

  const [tab, setTab] = useState("UPCOMING");

  const [filters, setFilters] = useState({
    q: "",
    booking_type: "ALL",
    payment_method: "ALL",
    status: "ALL",
  });

  const isPast = function (b) {
    return b.status === "COMPLETED" || b.status === "CANCELLED";
  };

  const upcoming = useMemo(
    function () {
      return demoBookings.filter(function (b) {
        return !isPast(b);
      });
    },
    [demoBookings]
  );

  const past = useMemo(
    function () {
      return demoBookings.filter(function (b) {
        return isPast(b);
      });
    },
    [demoBookings]
  );

  const list = useMemo(
    function () {
      const base = tab === "UPCOMING" ? upcoming : past;
      const q = (filters.q || "").toLowerCase().trim();

      return base.filter(function (b) {
        const hay =
          String(b.ground_name || "") +
          " " +
          String(b.ground_id || "") +
          " " +
          String(b.slot || "") +
          " " +
          String(b.date || "");

        const matchesQ = q ? hay.toLowerCase().includes(q) : true;

        const matchesType =
          filters.booking_type === "ALL"
            ? true
            : b.booking_type === filters.booking_type;

        const matchesPayment =
          filters.payment_method === "ALL"
            ? true
            : b.payment_method === filters.payment_method;

        const matchesStatus =
          filters.status === "ALL" ? true : b.status === filters.status;

        return matchesQ && matchesType && matchesPayment && matchesStatus;
      });
    },
    [tab, upcoming, past, filters]
  );

  const onChange = function (e) {
    const name = e.target.name;
    const value = e.target.value;
    setFilters(function (prev) {
      return { ...prev, [name]: value };
    });
  };

  const onCancel = function (bookingId) {
    alert("Cancel booking " + bookingId + " (connect backend later)");
  };

  return (
    <div className="page-bg">
      <div className="container">
        <div className="mybookings-header">
          <div>
            <div className="badge">Player</div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              My <span>Bookings</span>
            </h1>
            <p className="p">View your bookings, status, and manage matches.</p>
          </div>

          <div className="mybookings-headerActions">
            <button className="btn outline" onClick={() => nav(-1)}>
              Back
            </button>
            <Link to="/grounds" className="btn primary">
              Book New
            </Link>
          </div>
        </div>

        <div className="card mybookings-tabs">
          <button
            type="button"
            className={tab === "UPCOMING" ? "tab-btn tab-active" : "tab-btn"}
            onClick={() => setTab("UPCOMING")}
          >
            Upcoming
          </button>

          <button
            type="button"
            className={tab === "PAST" ? "tab-btn tab-active" : "tab-btn"}
            onClick={() => setTab("PAST")}
          >
            Past
          </button>
        </div>

        <div className="card mybookings-filters">
          <input
            className="input"
            name="q"
            placeholder="Search (ground, date, slot...)"
            value={filters.q}
            onChange={onChange}
          />

          <select
            className="input"
            name="booking_type"
            value={filters.booking_type}
            onChange={onChange}
          >
            <option value="ALL">All Types</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>

          <select
            className="input"
            name="payment_method"
            value={filters.payment_method}
            onChange={onChange}
          >
            <option value="ALL">All Payments</option>
            <option value="FIELD">Pay on Field</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            className="input"
            name="status"
            value={filters.status}
            onChange={onChange}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {list.length === 0 ? (
          <div className="card mybookings-empty">
            <div className="empty-title">No bookings found</div>
            <div className="empty-sub">Try changing filters.</div>
            <div className="empty-actions">
              <Link to="/grounds" className="btn outline">
                Browse Grounds
              </Link>
            </div>
          </div>
        ) : (
          <div className="mybookings-grid">
            {list.map(function (b) {
              const title = b.ground_name
                ? b.ground_name
                : "Ground #" + b.ground_id;

              const statusClass =
                b.status === "PENDING"
                  ? "status-pill pending"
                  : b.status === "CONFIRMED"
                  ? "status-pill confirmed"
                  : b.status === "COMPLETED"
                  ? "status-pill completed"
                  : "status-pill cancelled";

              return (
                <div className="card booking-card2" key={b.booking_id}>
                  <div className="booking-topRow">
                    <div className="booking-title">{title}</div>
                    <div className={statusClass}>{b.status}</div>
                  </div>

                  <div className="booking-metaRow">
                    <span>📅 {b.date}</span>
                    <span>⏱ {b.slot}</span>
                  </div>

                  <div className="booking-badges">
                    <span className="pill">{b.booking_type}</span>
                    <span className="pill">{b.payment_method}</span>
                  </div>

                  <div className="booking-actions2">
                    <Link to={"/grounds/" + b.ground_id} className="btn outline">
                      View Ground
                    </Link>

                    {/* ✅ FIXED DETAILS LINK */}
                    <Link
                      to={"/mybookings/" + b.booking_id}
                      className="btn outline"
                    >
                      Details
                    </Link>

                    {b.status === "PENDING" ? (
                      <button
                        className="btn primary"
                        onClick={() => onCancel(b.booking_id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button className="btn primary" disabled>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
