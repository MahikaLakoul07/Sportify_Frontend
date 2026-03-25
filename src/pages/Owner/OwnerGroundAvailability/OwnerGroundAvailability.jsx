import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";
import "./OwnerGroundAvailability.css";

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
  { start: "19:00", end: "20:00", label: "7:00 PM" },
];

const slotKey = (start, end) => `${start}-${end}`;

const ymdLocal = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function OwnerGroundAvailability() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ground, setGround] = useState(null);
  const [slotMap, setSlotMap] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingReason, setBookingReason] = useState("");
  const [baseDate, setBaseDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => {
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
    d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getNormalizedUserId = () => {
    if (!user) return null;
    const candidate =
      user.id || user.user_id || user.owner_id || user.pk || user.userid;
    const parsed = Number(candidate);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const loadAvailability = async () => {
    const nextSlotMap = {};

    await Promise.all(
      days.map(async (d) => {
        const date = ymdLocal(d);
        const data = await apiFetch(`/api/grounds/${id}/slots/?date=${date}`);

        const oneDayMap = {};
        for (const s of data?.slots || []) {
          oneDayMap[slotKey(s.start_time, s.end_time)] = {
            available: !!s.available,
            booked: !!s.booked,
          };
        }

        nextSlotMap[date] = oneDayMap;
      })
    );

    setSlotMap(nextSlotMap);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErr("");

        const groundData = await apiFetch(`/api/grounds/${id}/`);
        setGround(groundData);

        const ownerId = Number(
          groundData.owner_id || groundData.owner || groundData.user_id
        );
        const userId = getNormalizedUserId();

        if (!userId || ownerId !== userId) {
          setErr("You can only manage availability for your own grounds.");
          return;
        }

        await loadAvailability();
      } catch (error) {
        console.error(error);
        setErr(error.message || "Failed to load availability.");
      } finally {
        setLoading(false);
      }
    }

    if (id && user) {
      loadData();
    }
  }, [id, user, baseDate]);

  const getCellStatus = (dayIndex, timeIndex) => {
    const today = new Date();
    const day = days[dayIndex];

    const dayOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (dayOnly < todayOnly) return "PAST";

    const slot = FIXED_SLOTS[timeIndex];
    const dateKey = ymdLocal(day);

    if (dayOnly.getTime() === todayOnly.getTime()) {
      const [hour, minute] = slot.start.split(":").map(Number);
      const slotStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hour,
        minute
      );
      if (slotStart <= today) return "PAST";
    }

    const info = slotMap[dateKey]?.[slotKey(slot.start, slot.end)];
    if (!info) return "LOADING";
    if (info.booked) return "BOOKED";
    if (info.available) return "AVAILABLE";
    return "CLOSED";
  };

  const isSelected = (dateYMD, slotIndex) =>
    selectedSlots.some(
      (x) => x.dateYMD === dateYMD && x.slotIndex === slotIndex
    );

  const toggleSlotSelection = (dayIndex, timeIndex) => {
    const day = days[dayIndex];
    const dateYMD = ymdLocal(day);
    const slot = FIXED_SLOTS[timeIndex];

    setSelectedSlots((prev) => {
      const exists = prev.some(
        (x) => x.dateYMD === dateYMD && x.slotIndex === timeIndex
      );

      if (exists) {
        return prev.filter(
          (x) => !(x.dateYMD === dateYMD && x.slotIndex === timeIndex)
        );
      }

      return [
        ...prev,
        {
          dateYMD,
          slotIndex: timeIndex,
          start_time: slot.start,
          end_time: slot.end,
          timeLabel: slot.label,
          dayLabel: day.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        },
      ];
    });
  };

  const selectedSummary = useMemo(() => {
    if (!selectedSlots.length) return null;

    const first = selectedSlots[0];
    const totalHours = selectedSlots.length;

    return {
      dateLabel: first.dayLabel,
      timeLabel:
        totalHours === 1
          ? first.timeLabel
          : `${first.timeLabel} + ${totalHours - 1} more`,
      totalHours,
    };
  }, [selectedSlots]);

  const handleBookSlots = async () => {
    if (!selectedSlots.length) {
      alert("Please select at least one slot.");
      return;
    }

    if (!bookingReason.trim()) {
      alert("Please enter booking reason.");
      return;
    }

    try {
      setSaving(true);

      for (const slot of selectedSlots) {
        await apiFetch("/api/bookings/owner-direct-booking/", {
          method: "POST",
          body: {
            ground: Number(id),
            date: slot.dateYMD,
            start_time: slot.start_time,
            end_time: slot.end_time,
            notes: bookingReason.trim(),
          },
        });
      }

      alert("Owner booking saved successfully.");
      setSelectedSlots([]);
      setBookingReason("");
      await loadAvailability();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="oa-state">Loading availability...</div>;
  if (err) return <div className="oa-state">{err}</div>;
  if (!ground) return <div className="oa-state">Ground not found.</div>;

  return (
    <div className="oa-page">
      <div className="oa-wrap">
        <div className="oa-grid">
          <div className="oa-left">
            <div className="oa-card">
              <div className="oa-head">
                <button
                  className="navBtn"
                  onClick={() => {
                    const d = new Date(baseDate);
                    d.setDate(d.getDate() - 7);
                    setBaseDate(d);
                    setSelectedSlots([]);
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
                    setSelectedSlots([]);
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

                {FIXED_SLOTS.map((slot, timeIndex) => (
                  <div key={slot.label} className="gd-row">
                    <div className="gd-timeCell">{slot.label}</div>

                    {days.map((d, dayIndex) => {
                      const status = getCellStatus(dayIndex, timeIndex);
                      const selected = isSelected(ymdLocal(d), timeIndex);

                      const cls =
                        status === "PAST"
                          ? "cell past"
                          : status === "BOOKED"
                          ? "cell booked"
                          : status === "CLOSED"
                          ? "cell past"
                          : status === "LOADING"
                          ? "cell past"
                          : selected
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
                          : selected
                          ? "Selected"
                          : "Available";

                      const disabled = status !== "AVAILABLE" && !selected;

                      return (
                        <button
                          key={`${ymdLocal(d)}-${slot.start}`}
                          className={cls}
                          disabled={disabled}
                          onClick={() => toggleSlotSelection(dayIndex, timeIndex)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="gd-bottomBar">
                <button
                  className="backBtn"
                  onClick={() => navigate("/owner/grounds")}
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>

          <div className="oa-right">
            <div className="oa-sideCard">
              <div className="sideTitle">OWNER BOOKING</div>

              <div className="sidePick">
                <div className="bar" />
                <div className="pickText">
                  <div className="pickTop">
                    <strong>
                      {selectedSummary ? selectedSummary.timeLabel : "—"}
                    </strong>
                    <span className="pillSmall">
                      {ground.ground_size === "SEVEN" ? "7A-Side" : "5A-Side"}
                    </span>
                    <span className="pillSmall">Main Court</span>
                  </div>
                  <div className="muted">
                    {selectedSummary
                      ? selectedSummary.dateLabel
                      : "Select slot(s) from the table"}
                  </div>
                </div>

                {selectedSlots.length > 0 && (
                  <button
                    className="xBtn"
                    onClick={() => setSelectedSlots([])}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="amountBox">
                <div>
                  <div className="amountLabel">Booking Type</div>
                  <div className="muted">Private / Offline Booking</div>
                </div>
                <div className="amountRight">
                  <div className="amountMain">{selectedSlots.length} Slot(s)</div>
                  <div className="muted">No online payment</div>
                </div>
              </div>

              <textarea
                className="reasonField"
                rows={3}
                placeholder="Add note for this direct booking"
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
              />

              <button
                className="checkoutBtn"
                disabled={!selectedSlots.length || saving}
                onClick={handleBookSlots}
              >
                {saving ? "Saving..." : "Confirm Booking"}
              </button>

              <div className="finePrint">
                Direct ground booking will immediately block the same slot for online players.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}