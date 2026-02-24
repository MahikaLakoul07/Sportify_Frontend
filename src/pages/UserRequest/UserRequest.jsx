import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./UserRequest.css";

export default function JoinOpenGame() {
  const { id } = useParams();
  const nav = useNavigate();

  // MOCK open game (later fetch by id)
  const game = useMemo(() => {
    return {
      id,
      ground: "Islington Futsal",
      area: "Kamal Pokhari, Kathmandu",
      date: "Feb 26, 2026",
      time: "12:00 PM",
      court: "5A-Side • Main Court",
      neededRoles: ["Goalkeeper", "Defender"],
      bookerPhone: "9841XXXXXX",
    };
  }, [id]);

  // FORM STATE
  const [form, setForm] = useState({
    role: game.neededRoles?.[0] || "Defender",
    skill: "Intermediate",
    age: "",
    foot: "Right",
    note: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    // Simple validations
    if (!form.phone.trim()) return setErr("Phone number is required.");
    if (!form.age.trim()) return setErr("Age is required.");

    setLoading(true);

    try {
      // Later: POST /open-games/:id/join-request
      // For now mock:
      await new Promise((r) => setTimeout(r, 400));
      alert("Join request sent successfully (mock).");
      nav(`/open-games/${id}`);
    } catch (error) {
      setErr("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="joj-page">
      <div className="joj-wrap">
        <div className="joj-top">
          <button className="joj-back" onClick={() => nav(-1)}>
            ← Back
          </button>
          <div>
            <h1 className="joj-title">Request to Join</h1>
            <p className="joj-sub">
              Fill your details to request joining this open game.
            </p>
          </div>
        </div>

        <div className="joj-grid">
          {/* LEFT: Form */}
          <form className="joj-card" onSubmit={submit}>
            <div className="joj-cardTitle">Your Info</div>

            {err && <div className="joj-error">{err}</div>}

            <div className="joj-row">
              <div className="joj-field">
                <label>Preferred Role</label>
                <select name="role" value={form.role} onChange={onChange}>
                  {game.neededRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>

              <div className="joj-field">
                <label>Skill Level</label>
                <select name="skill" value={form.skill} onChange={onChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="joj-row">
              <div className="joj-field">
                <label>Age</label>
                <input
                  name="age"
                  value={form.age}
                  onChange={onChange}
                  placeholder="e.g. 22"
                />
              </div>

              <div className="joj-field">
                <label>Foot</label>
                <select name="foot" value={form.foot} onChange={onChange}>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="joj-field">
              <label>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="98XXXXXXXX"
              />
              <div className="joj-hint">
                (This can be hidden from public later — backend will control privacy.)
              </div>
            </div>

            <div className="joj-field">
              <label>Message to Booker (Optional)</label>
              <textarea
                name="note"
                value={form.note}
                onChange={onChange}
                rows={4}
                placeholder="Example: I can play full 1 hour, I usually defend..."
              />
            </div>

            <button className="joj-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Join Request"}
            </button>
          </form>

          {/* RIGHT: Game summary */}
          <div className="joj-side">
            <div className="sideTitle">GAME SUMMARY</div>

            <div className="sideBox">
              <div className="sideBig">{game.ground}</div>
              <div className="sideMuted">📍 {game.area}</div>
            </div>

            <div className="sideMeta">
              <div className="pill">{game.date}</div>
              <div className="pill">{game.time}</div>
              <div className="pill">{game.court}</div>
            </div>

            <div className="sideDivider" />

            <div className="sideLine">
              <span>Needed</span>
              <strong>{game.neededRoles.join(", ")}</strong>
            </div>

            <div className="sideLine">
              <span>Booker Phone</span>
              <strong>{game.bookerPhone}</strong>
            </div>

            <div className="sideDivider" />

            <Link className="joj-outline" to={`/open-games/${id}`}>
              Back to Open Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}