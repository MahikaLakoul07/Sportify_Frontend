import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GroundDetails.css";

export default function GroundDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  // --- MOCK GROUNDS (replace later with API fetch)
  const mockGrounds = [
    {
      id: 1,
      name: "Islington Futsal",
      location: "Kamal Pokhari, Kathmandu",
      about: "Best futsal in kamal pokhari",
      hours: "6 AM - 9 PM",
      hero:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=70",
      courts: [
        { id: "5A", label: "5A-Side", courtName: "Main Court", price: 1500 },
        { id: "7A", label: "7A-Side", courtName: "Main Court", price: 2000 },
      ],
    },
    {
      id: 2,
      name: "Lalitpur Sports Hub",
      location: "Lalitpur",
      about: "Popular turf with clean facilities and flexible booking.",
      hours: "7 AM - 10 PM",
      hero:
        "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=70",
      courts: [{ id: "5A", label: "5A-Side", courtName: "Court A", price: 1200 }],
    },
  ];

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [activeCourtId, setActiveCourtId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // { dayLabel, timeLabel }
  const [promo, setPromo] = useState("");

  // date nav (simple)
  const [baseDate, setBaseDate] = useState(() => new Date());

  useEffect(() => {
    setLoading(true);
    setErr("");

    const found = mockGrounds.find((g) => String(g.id) === String(id));
    if (!found) {
      setErr("Ground not found.");
      setGround(null);
      setLoading(false);
      return;
    }

    setGround(found);
    setActiveCourtId(found.courts?.[0]?.id || null);
    setSelectedSlot(null);
    setLoading(false);
  }, [id]);

  const activeCourt = useMemo(() => {
    if (!ground) return null;
    return ground.courts.find((c) => c.id === activeCourtId) || ground.courts[0];
  }, [ground, activeCourtId]);

  // --- schedule mock
  const timeRows = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
  ];

  const days = useMemo(() => {
    // show 7 days starting from baseDate (Mon..Sun style not needed, just simple)
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [baseDate]);

  const formatDay = (d) =>
    d.toLocaleDateString(undefined, { weekday: "short" });
  const formatDateNum = (d) => d.getDate();
  const formatMonthTitle = (d) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  // random booking logic (simple deterministic-ish)
  const getCellStatus = (dayIndex, timeIndex) => {
    // Past: if day is before today (only date compare)
    const today = new Date();
    const day = days[dayIndex];
    const isPast =
      new Date(day.getFullYear(), day.getMonth(), day.getDate()) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (isPast) return "PAST";

    // Booked: a few slots blocked
    const seed = (dayIndex + 1) * 17 + (timeIndex + 1) * 11 + (activeCourtId === "7A" ? 9 : 0);
    if (seed % 9 === 0) return "BOOKED";

    return "AVAILABLE";
  };

  const onPickSlot = (dayIndex, timeIndex) => {
    const status = getCellStatus(dayIndex, timeIndex);
    if (status !== "AVAILABLE") return;

    const day = days[dayIndex];
    setSelectedSlot({
      dayLabel: `${formatDay(day)}, ${day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      timeLabel: timeRows[timeIndex],
      dateISO: day.toISOString(),
    });
  };

  const price = activeCourt?.price || 0;
  const payNow = selectedSlot ? Math.round(price * 0.2) : 0;
  const total = selectedSlot ? price : 0;

  if (loading) return <div className="gd-page">Loading...</div>;
  if (err) return <div className="gd-page"><div className="gd-error">{err}</div></div>;
  if (!ground) return null;

  return (
    <div className="gd-page">
      {/* HERO */}
      <div
        className="gd-hero"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.15)), url(${ground.hero})`,
        }}
      >
        <div className="gd-heroInner">
          <h1 className="gd-title">{ground.name}</h1>
          <div className="gd-sub">📍 {ground.location}</div>
        </div>
      </div>

      {/* BODY */}
      <div className="gd-wrap">
        <div className="gd-grid">
          {/* LEFT */}
          <div className="gd-left">
            <div className="gd-card">
              <div className="gd-cardTop">
                <div>
                  <h2>About</h2>
                  <p className="muted">{ground.about}</p>
                </div>
              </div>

              <div className="gd-miniRow">
                <div className="gd-mini">
                  <div className="miniLabel">Hours</div>
                  <div className="miniValue">{ground.hours}</div>
                </div>
                <div className="gd-mini">
                  <div className="miniLabel">Location</div>
                  <div className="miniValue">{ground.location}</div>
                </div>
              </div>

              <div className="gd-divider" />

              <div className="gd-flexBetween">
                <div className="gd-sectionTitle">Pricing</div>
                <div className="muted">
                  {activeCourt?.label} • NPR {price}/hr
                </div>
              </div>
            </div>

            <div className="gd-selectCourt">
              <div className="gd-sectionTitle">Select a Court</div>
              <div className="gd-tabs">
                {ground.courts.map((c) => (
                  <button
                    key={c.id}
                    className={`gd-tab ${activeCourtId === c.id ? "active" : ""}`}
                    onClick={() => setActiveCourtId(c.id)}
                  >
                    {c.label} <span className="pill">{c.courtName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SCHEDULE */}
            <div className="gd-schedule">
              <div className="gd-scheduleHead">
                <button
                  className="navBtn"
                  onClick={() => {
                    const d = new Date(baseDate);
                    d.setDate(d.getDate() - 7);
                    setBaseDate(d);
                  }}
                >
                  ‹
                </button>

                <div className="headCenter">
                  <div className="muted">Select Date</div>
                  <div className="headDate">{formatMonthTitle(baseDate)}</div>
                  <div className="legend">
                    <span><i className="dot booked" /> Booked</span>
                    <span><i className="dot available" /> Available</span>
                    <span><i className="dot selected" /> Selected</span>
                  </div>
                </div>

                <button
                  className="navBtn"
                  onClick={() => {
                    const d = new Date(baseDate);
                    d.setDate(d.getDate() + 7);
                    setBaseDate(d);
                  }}
                >
                  ›
                </button>
              </div>

              <div className="gd-table">
                {/* header row */}
                <div className="gd-row gd-header">
                  <div className="gd-timeCell" />
                  {days.map((d, idx) => (
                    <div key={idx} className="gd-dayCell">
                      <div className="dayTop">{formatDay(d)}</div>
                      <div className="dayNum">{formatDateNum(d)}</div>
                    </div>
                  ))}
                </div>

                {/* time rows */}
                {timeRows.map((t, timeIndex) => (
                  <div key={t} className="gd-row">
                    <div className="gd-timeCell">{t}</div>
                    {days.map((d, dayIndex) => {
                      const status = getCellStatus(dayIndex, timeIndex);
                      const isSelected =
                        selectedSlot &&
                        selectedSlot.timeLabel === t &&
                        new Date(selectedSlot.dateISO).toDateString() === d.toDateString();

                      const cls =
                        status === "PAST"
                          ? "cell past"
                          : status === "BOOKED"
                          ? "cell booked"
                          : isSelected
                          ? "cell selected"
                          : "cell available";

                      const label =
                        status === "PAST"
                          ? "Past"
                          : status === "BOOKED"
                          ? "Booked"
                          : isSelected
                          ? "Selected"
                          : "Available";

                      return (
                        <button
                          key={dayIndex}
                          className={cls}
                          onClick={() => onPickSlot(dayIndex, timeIndex)}
                          disabled={status !== "AVAILABLE" && !isSelected}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="gd-bottomBar">
                <button className="backBtn" onClick={() => nav(-1)}>
                  ← Back
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="gd-right">
            <div className="gd-sideCard">
              <div className="sideTitle">YOUR SELECTION</div>

              <div className="sidePick">
                <div className="bar" />
                <div className="pickText">
                  <div className="pickTop">
                    <strong>{selectedSlot ? selectedSlot.timeLabel : "—"}</strong>
                    <span className="pillSmall">{activeCourt?.label}</span>
                    <span className="pillSmall">{activeCourt?.courtName}</span>
                  </div>
                  <div className="muted">
                    {selectedSlot ? selectedSlot.dayLabel : "Select a slot from the table"}
                  </div>
                </div>

                {selectedSlot && (
                  <button className="xBtn" onClick={() => setSelectedSlot(null)}>
                    ×
                  </button>
                )}
              </div>

              <div className="amountBox">
                <div>
                  <div className="amountLabel">Total Amount</div>
                  <div className="muted">Pay at Venue</div>
                </div>
                <div className="amountRight">
                  <div className="amountMain">NPR {total.toFixed(2)}</div>
                  <div className="muted">NPR {total.toFixed(2)} + Water</div>
                </div>
              </div>

              <div className="payRow">
                <div>
                  <div className="payTitle">Pay Now (20%)</div>
                </div>
                <div className="payNow">NPR {payNow.toFixed(2)}</div>
              </div>

              <div className="promoRow">
                <input
                  className="promoInput"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Enter promo code"
                />
                <button className="applyBtn" onClick={() => alert("Promo logic later")}>
                  Apply
                </button>
              </div>

              <button
                className="checkoutBtn"
                disabled={!selectedSlot}
                onClick={() => {
                  if (selectedSlot) {
                    nav("/checkout", {
                      state: {
                        groundName: ground.name,
                        location: ground.location,
                        courtLabel: activeCourt?.label,
                        courtName: activeCourt?.courtName,
                        dateLabel: selectedSlot.dayLabel,
                        timeLabel: selectedSlot.timeLabel,
                        dateISO: selectedSlot.dateISO,
                        price: price,
                        groundId: ground.id,
                        courtId: activeCourt?.id,
                      },
                    });
                  }
                }}
              >
                Continue to Checkout
              </button>

              <div className="finePrint">
                Only 20% payment required to confirm booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}