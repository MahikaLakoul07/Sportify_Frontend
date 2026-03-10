// src/pages/GroundDetails/GroundDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./GroundDetails.css";

// Fixed system slots (same for every ground)
const FIXED_SLOTS = [
  { start: "06:00", end: "07:00", label: "6:00 AM" },
  { start: "07:00", end: "08:00", label: "7:00 AM" },
  { start: "08:00", end: "09:00", label: "8:00 AM" },
  { start: "09:00", end: "10:00", label: "9:00 AM" },
  { start: "10:00", end: "11:00", label: "10:00 AM" },
  { start: "11:00", end: "12:00", label: "11:00 AM" },
  { start: "12:00", end: "13:00", label: "12:00 PM" },
  { start: "13:00", end: "14:00", label: "1:00 PM" },
  { start: "14:00", end: "15:00", label: "2:00 PM" },
  { start: "15:00", end: "16:00", label: "3:00 PM" },
  { start: "16:00", end: "17:00", label: "4:00 PM" },
  { start: "17:00", end: "18:00", label: "5:00 PM" },
  { start: "18:00", end: "19:00", label: "6:00 PM" },
];

const PLAYER_POSITIONS = [
  { value: "GOALKEEPER", label: "Goalkeeper" },
  { value: "DEFENDER", label: "Defender" },
  { value: "MIDFIELDER", label: "Midfielder" },
  { value: "FORWARD", label: "Forward" },
];

const REQUIRED_PLAYER_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

const slotKey = (start, end) => `${start}-${end}`;

// safer YYYY-MM-DD for local date (avoids toISOString() UTC shifting)
const ymdLocal = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function prettifyPosition(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

export default function GroundDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [activeCourtId, setActiveCourtId] = useState(null);

  // { dayLabel, timeLabel, dateISO, dateYMD, start_time, end_time }
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [promo, setPromo] = useState("");

  const [bookingMode, setBookingMode] = useState("PRIVATE");
  const [neededPositions, setNeededPositions] = useState([]);
  const [requiredPlayers, setRequiredPlayers] = useState(1);
  const [openGameNote, setOpenGameNote] = useState("");
  const [bookingErr, setBookingErr] = useState("");

  const [baseDate, setBaseDate] = useState(() => new Date());

  // slotMap["YYYY-MM-DD"]["06:00-07:00"] = { available: true, booked: false }
  const [slotMap, setSlotMap] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const data = await apiFetch(`/api/grounds/${id}/`, { method: "GET" });

        const mapped = {
          id: data.id,
          name: data.name,
          location: data.location,
          about: data.description || "No description provided.",
          hours: "See schedule below",
          hero:
            data.image_url ||
            "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=70",
          courts: [
            {
              id: data.ground_size === "SEVEN" ? "7A" : "5A",
              label: data.ground_size === "SEVEN" ? "7A-Side" : "5A-Side",
              courtName: "Main Court",
              price: data.price_per_hour,
            },
          ],
        };

        setGround(mapped);
        setActiveCourtId(mapped.courts?.[0]?.id || null);
        setSelectedSlot(null);
      } catch (ex) {
        setErr(ex?.message || "Failed to load ground details.");
        setGround(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const activeCourt = useMemo(() => {
    if (!ground) return null;
    return ground.courts.find((c) => c.id === activeCourtId) || ground.courts[0];
  }, [ground, activeCourtId]);

  const timeRows = useMemo(() => FIXED_SLOTS.map((s) => s.label), []);

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [baseDate]);

  const prettyNeededPositions = useMemo(() => {
    return neededPositions.map(prettifyPosition);
  }, [neededPositions]);

  const formatDay = (d) => d.toLocaleDateString(undefined, { weekday: "short" });
  const formatDateNum = (d) => d.getDate();
  const formatMonthTitle = (d) =>
    d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadSlots = async () => {
      try {
        const results = await Promise.all(
          days.map(async (d) => {
            const date = ymdLocal(d);
            const url = `/api/grounds/${id}/slots/?date=${date}`;
            const data = await apiFetch(url, {
              method: "GET",
              signal: controller.signal,
            });
            return { date, data };
          })
        );

        setSlotMap((prev) => {
          const next = { ...prev };
          for (const { date, data } of results) {
            const m = {};
            for (const s of data?.slots || []) {
              m[slotKey(s.start_time, s.end_time)] = {
                available: !!s.available,
                booked: !!s.booked,
              };
            }
            next[date] = m;
          }
          return next;
        });
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error(e);
      }
    };

    loadSlots();
    return () => controller.abort();
  }, [id, days]);

  const getCellStatus = (dayIndex, timeIndex) => {
    const today = new Date();
    const day = days[dayIndex];

    const isPast =
      new Date(day.getFullYear(), day.getMonth(), day.getDate()) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (isPast) return "PAST";

    const slot = FIXED_SLOTS[timeIndex];
    const date = ymdLocal(day);

    const info = slotMap?.[date]?.[slotKey(slot.start, slot.end)];

    if (!info) return "LOADING";
    if (info.booked) return "BOOKED";
    if (info.available) return "AVAILABLE";
    return "CLOSED";
  };

  const onPickSlot = (dayIndex, timeIndex) => {
    const status = getCellStatus(dayIndex, timeIndex);
    if (status !== "AVAILABLE") return;

    const day = days[dayIndex];
    const slot = FIXED_SLOTS[timeIndex];

    setSelectedSlot({
      dayLabel: `${formatDay(day)}, ${day.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`,
      timeLabel: slot.label,
      dateISO: day.toISOString(),
      dateYMD: ymdLocal(day),
      start_time: slot.start,
      end_time: slot.end,
    });

    setBookingErr("");
  };

  const toggleNeededPosition = (posValue) => {
    setNeededPositions((prev) => {
      if (prev.includes(posValue)) {
        return prev.filter((x) => x !== posValue);
      }
      return [...prev, posValue];
    });
    setBookingErr("");
  };

  const onChangeBookingMode = (mode) => {
    setBookingMode(mode);
    setBookingErr("");

    if (mode === "PRIVATE") {
      setNeededPositions([]);
      setRequiredPlayers(1);
      setOpenGameNote("");
    }
  };

  const price = Number(activeCourt?.price || 0);
  const payNow = selectedSlot ? Math.round(price * 0.2) : 0;
  const total = selectedSlot ? price : 0;

  const continueToCheckout = () => {
    setBookingErr("");

    if (!selectedSlot) {
      setBookingErr("Please select an available slot first.");
      return;
    }

    if (bookingMode === "PUBLIC" && neededPositions.length === 0) {
      setBookingErr("Please select at least one required position for the open game.");
      return;
    }

    console.log("Checkout state data:", {
      bookingType: bookingMode === "PUBLIC" ? "OPEN" : "CLOSED",
      neededPositions,
      requiredPlayers,
      openGameNote,
    });

    nav("/checkout", {
      state: {
        groundName: ground.name,
        location: ground.location,
        courtLabel: activeCourt?.label,
        courtName: activeCourt?.courtName,
        dateLabel: selectedSlot.dayLabel,
        timeLabel: selectedSlot.timeLabel,
        dateISO: selectedSlot.dateISO,
        dateYMD: selectedSlot.dateYMD,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        price,
        groundId: ground.id,
        courtId: activeCourt?.id,

        bookingType: bookingMode === "PUBLIC" ? "OPEN" : "CLOSED",
        neededPositions: bookingMode === "PUBLIC" ? neededPositions : [],
        requiredPlayers: bookingMode === "PUBLIC" ? requiredPlayers : 1,
        openGameNote: bookingMode === "PUBLIC" ? openGameNote.trim() : "",
      },
    });
  };

  if (loading) return <div className="gd-page">Loading...</div>;

  if (err) {
    return (
      <div className="gd-page">
        <div className="gd-error">{err}</div>
      </div>
    );
  }

  if (!ground) return null;

  return (
    <div className="gd-page">
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

      <div className="gd-wrap">
        <div className="gd-grid">
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

            <div className="gd-card">
              <div className="gd-sectionTitle" style={{ marginBottom: 12 }}>
                Team Formation
              </div>

              <div className="bookingModeRow">
                <button
                  type="button"
                  className={
                    bookingMode === "PRIVATE"
                      ? "bookingModeBtn active"
                      : "bookingModeBtn"
                  }
                  onClick={() => onChangeBookingMode("PRIVATE")}
                >
                  <div className="bookingModeTitle">Private Booking</div>
                  <div className="bookingModeText">
                    Reserve the ground for your complete team only.
                  </div>
                </button>

                <button
                  type="button"
                  className={
                    bookingMode === "PUBLIC"
                      ? "bookingModeBtn active"
                      : "bookingModeBtn"
                  }
                  onClick={() => onChangeBookingMode("PUBLIC")}
                >
                  <div className="bookingModeTitle">Open Game</div>
                  <div className="bookingModeText">
                    Let other players request to join your team.
                  </div>
                </button>
              </div>

              {bookingMode === "PUBLIC" && (
                <div className="openGameBox">
                  <div className="openGameLabel">Needed Positions</div>

                  <div className="positionGrid">
                    {PLAYER_POSITIONS.map((pos) => {
                      const selected = neededPositions.includes(pos.value);
                      return (
                        <button
                          key={pos.value}
                          type="button"
                          className={selected ? "positionBtn active" : "positionBtn"}
                          onClick={() => toggleNeededPosition(pos.value)}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="openGameHint">
                    Choose the positions you need for this open game.
                  </div>

                  <div className="requiredPlayersWrap">
                    <div className="requiredPlayersLabel">Required Players</div>
                    <select
                      className="requiredPlayersSelect"
                      value={requiredPlayers}
                      onChange={(e) => setRequiredPlayers(Number(e.target.value))}
                    >
                      {REQUIRED_PLAYER_OPTIONS.map((num) => (
                        <option key={num} value={num}>
                          {num} Player{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    className="openGameTextarea"
                    placeholder="Optional note for players (e.g. Need one solid defender and one goalkeeper)"
                    value={openGameNote}
                    onChange={(e) => setOpenGameNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="gd-schedule">
              <div className="gd-scheduleHead">
                <button
                  className="navBtn"
                  onClick={() => {
                    const d = new Date(baseDate);
                    d.setDate(d.getDate() - 7);
                    setBaseDate(d);
                    setSelectedSlot(null);
                  }}
                >
                  ‹
                </button>

                <div className="headCenter">
                  <div className="muted">Select Date</div>
                  <div className="headDate">{formatMonthTitle(baseDate)}</div>
                  <div className="legend">
                    <span>
                      <i className="dot booked" /> Booked
                    </span>
                    <span>
                      <i className="dot available" /> Available
                    </span>
                    <span>
                      <i className="dot selected" /> Selected
                    </span>
                  </div>
                </div>

                <button
                  className="navBtn"
                  onClick={() => {
                    const d = new Date(baseDate);
                    d.setDate(d.getDate() + 7);
                    setBaseDate(d);
                    setSelectedSlot(null);
                  }}
                >
                  ›
                </button>
              </div>

              <div className="gd-table">
                <div className="gd-row gd-header">
                  <div className="gd-timeCell" />
                  {days.map((d, idx) => (
                    <div key={idx} className="gd-dayCell">
                      <div className="dayTop">{formatDay(d)}</div>
                      <div className="dayNum">{formatDateNum(d)}</div>
                    </div>
                  ))}
                </div>

                {timeRows.map((t, timeIndex) => (
                  <div key={t} className="gd-row">
                    <div className="gd-timeCell">{t}</div>

                    {days.map((d, dayIndex) => {
                      const status = getCellStatus(dayIndex, timeIndex);

                      const isSelected =
                        selectedSlot &&
                        selectedSlot.timeLabel === t &&
                        selectedSlot.dateYMD === ymdLocal(d);

                      const cls =
                        status === "PAST"
                          ? "cell past"
                          : status === "BOOKED"
                          ? "cell booked"
                          : status === "CLOSED"
                          ? "cell past"
                          : status === "LOADING"
                          ? "cell past"
                          : isSelected
                          ? "cell selected"
                          : "cell available";

                      const label =
                        status === "PAST"
                          ? "Past"
                          : status === "BOOKED"
                          ? "Booked"
                          : status === "CLOSED"
                          ? "Closed"
                          : status === "LOADING"
                          ? "..."
                          : isSelected
                          ? "Selected"
                          : "Available";

                      const disabled = status !== "AVAILABLE" && !isSelected;

                      return (
                        <button
                          key={dayIndex}
                          className={cls}
                          onClick={() => onPickSlot(dayIndex, timeIndex)}
                          disabled={disabled}
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
                    {selectedSlot
                      ? selectedSlot.dayLabel
                      : "Select a slot from the table"}
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
                  <div className="amountLabel">Booking Type</div>
                  <div className="muted">
                    {bookingMode === "PRIVATE" ? "Private Booking" : "Open Game"}
                  </div>
                </div>
                <div className="amountRight">
                  <div className="amountMain">NPR {total.toFixed(2)}</div>
                  <div className="muted">Pay at Venue / Online</div>
                </div>
              </div>

              {bookingMode === "PUBLIC" && (
                <>
                  <div className="openGameSummary">
                    <div className="summaryLabel">Needed Positions</div>
                    <div className="summaryValue">
                      {prettyNeededPositions.length > 0
                        ? prettyNeededPositions.join(", ")
                        : "No position selected"}
                    </div>
                  </div>

                  <div className="openGameSummary">
                    <div className="summaryLabel">Required Players</div>
                    <div className="summaryValue">
                      {requiredPlayers} Player{requiredPlayers > 1 ? "s" : ""}
                    </div>
                  </div>
                </>
              )}

              <div className="payRow">
                <div>
                  <div className="payTitle">Pay Now (20%)</div>
                </div>
                <div className="payNow">NPR {payNow.toFixed(2)}</div>
              </div>

              {bookingErr ? <div className="gd-inlineError">{bookingErr}</div> : null}

              <button
                className="checkoutBtn"
                disabled={!selectedSlot}
                onClick={continueToCheckout}
              >
                Continue to Checkout
              </button>

              <div className="finePrint">
                {bookingMode === "PRIVATE"
                  ? "Private booking is reserved only for your team."
                  : "Open game allows other players to request to join your team."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}