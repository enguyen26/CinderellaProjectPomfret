import { useState, useRef } from "react";

const DRESSES = [
  { id: 1, name: "Rosette Ball Gown", size: "4", color: "Blush Pink", style: "Ball Gown", available: true, img: "/social/dress-1.jpg", desc: "Strapless tulle ball gown with delicate rosette bodice detailing. Perfect for prom." },
  { id: 2, name: "Midnight A-Line", size: "8", color: "Navy Blue", style: "A-Line", available: true, img: "/social/dress-2.jpg", desc: "Elegant navy chiffon with sweetheart neckline and flowing skirt. Classic and timeless." },
  { id: 3, name: "Champagne Mermaid", size: "6", color: "Champagne", style: "Mermaid", available: false, img: "/social/dress-3.jpg", desc: "Fitted mermaid silhouette in champagne satin with lace overlay. Glamorous and sophisticated." },
  { id: 4, name: "Ruby Cocktail", size: "10", color: "Red", style: "Cocktail", available: true, img: "/social/dress-4.jpg", desc: "Short cocktail dress in rich ruby red with cap sleeves and full skirt." },
  { id: 5, name: "Sage Garden Gown", size: "12", color: "Sage Green", style: "A-Line", available: true, img: "/social/dress-5.jpg", desc: "Dreamy sage green with floral embroidery at the waist. Light and ethereal." },
  { id: 6, name: "Lavender Lace", size: "2", color: "Lavender", style: "Column", available: true, img: "/social/dress-6.jpg", desc: "Sleek column silhouette in soft lavender lace with spaghetti straps." },
  { id: 7, name: "Ivory Princess", size: "14", color: "Ivory", style: "Ball Gown", available: false, img: "/social/dress-7.jpg", desc: "Classic ivory ball gown with tiered tulle skirt and beaded waistband." },
  { id: 8, name: "Coral Wrap Dress", size: "16", color: "Coral", style: "Wrap", available: true, img: "/social/dress-8.jpg", desc: "Flowing coral wrap dress with V-neckline. Flattering and versatile." },
];

// These should be photos exported from your social media and saved in
// `frontend/public/social/` with the matching filenames.
const GALLERY = [
  { img: "/social/gallery-1.jpg", caption: "Boutique Day" },
  { img: "/social/gallery-2.jpg", caption: "Prom Night" },
  { img: "/social/gallery-3.jpg", caption: "Volunteers" },
  { img: "/social/gallery-4.jpg", caption: "Dress Drive" },
  { img: "/social/gallery-5.jpg", caption: "Before the Event" },
  { img: "/social/gallery-6.jpg", caption: "Happy Recipients" },
];

const FACULTY_LEADERS = [
  {
    id: 1,
    name: "Martha Horst",
    role: "Mathematics Teacher",
    school: "Pomfret School",
    description:
      "High school math teacher and lifelong boarding school educator who believes in girl and woman power, connection, and the importance of relationships.",
    initials: "MH",
  },
  {
    id: 2,
    name: "Brian Rice",
    role: "Faculty Leader",
    school: "Pomfret School",
    description:
      "Faculty leader supporting The Cinderella Project at Pomfret School and championing opportunities for students to shine at milestone events.",
    initials: "BR",
  },
  {
    id: 3,
    name: "Charlotte McMahon",
    role: "Faculty Leader",
    school: "Pomfret School",
    description:
      "Faculty leader partnering with students and volunteers to ensure every detail of The Cinderella Project experience feels welcoming and joyful.",
    initials: "CM",
  },
];

const STUDENT_SLOTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
}));

const SIZES = ["All", "2", "4", "6", "8", "10", "12", "14", "16"];
const STYLES = ["All", "Ball Gown", "A-Line", "Mermaid", "Cocktail", "Column", "Wrap"];

export default function CinderellaProject() {
  const [activeTab, setActiveTab] = useState("home");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [availFilter, setAvailFilter] = useState(false);
  const [selectedDress, setSelectedDress] = useState(null);
  const [trySrc, setTrySrc] = useState(null);
  const [tryDress, setTryDress] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [modalDress, setModalDress] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [zipError, setZipError] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const fileRef = useRef();

  const filtered = DRESSES.filter(d => {
    if (sizeFilter !== "All" && d.size !== sizeFilter) return false;
    if (styleFilter !== "All" && d.style !== styleFilter) return false;
    if (availFilter && !d.available) return false;
    return true;
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTrySrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!trySrc || !tryDress) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const base64 = trySrc.split(",")[1];
      const mediaType = trySrc.split(";")[0].split(":")[1];
      const dress = DRESSES.find(d => d.id === tryDress);
      const prompt = `You are a professional fashion stylist for a community-powered program called The Cinderella Project, which upcycles beautiful formalwear so students can celebrate milestone events with confidence, joy, and a strong sense of belonging.

A user has uploaded a photo of themselves and selected this dress from our catalog:
- Name: ${dress.name}
- Color: ${dress.color}
- Style: ${dress.style}
- Description: ${dress.desc}

Please:
1. Acknowledge their photo warmly and personally (describe something specific about their appearance to show you see them)
2. Vividly describe how this specific dress would look on them — celebrate their unique features, coloring, and body type in a body-positive, inclusive way
3. Give 2-3 personalized styling tips (hair, accessories, shoes) to complete the look
4. End with an encouraging, empowering message that centers their inner confidence and the connections they'll make at their event

Be warm, specific, and celebratory. This is a meaningful moment for them.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Unable to generate response.";
      setAiResponse(text);
    } catch (err) {
      setAiResponse("Something went wrong. Please try again.");
    }
    setAiLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#faf7f4", minHeight: "100vh", color: "#2c1a10" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --rose: #c8847a;
          --blush: #e8c4bb;
          --champagne: #f0e6d0;
          --cream: #faf7f4;
          --deep: #2c1a10;
          --gold: #b89060;
        }
        .nav-link {
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          letter-spacing: 0.2em;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 6px 0;
          border-bottom: 1px solid transparent;
          transition: all 0.3s;
          color: var(--deep);
          text-decoration: none;
          background: none;
          border: none;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--rose);
          border-bottom-color: var(--rose);
        }
        .dress-card {
          background: white;
          border-radius: 2px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .dress-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(44,26,16,0.12); }
        .badge {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .badge-avail { background: #e8f4e8; color: #3a7a3a; }
        .badge-taken { background: #f4e8e8; color: #7a3a3a; }
        .filter-btn {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          padding: 5px 12px;
          border: 1px solid var(--blush);
          background: transparent;
          cursor: pointer;
          border-radius: 20px;
          transition: all 0.2s;
          color: var(--deep);
        }
        .filter-btn:hover, .filter-btn.active { background: var(--rose); color: white; border-color: var(--rose); }
        .btn-primary {
          font-family: 'Jost', sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 12px;
          background: var(--rose);
          color: white;
          border: none;
          padding: 12px 32px;
          cursor: pointer;
          transition: background 0.2s;
          border-radius: 1px;
        }
        .btn-primary:hover { background: #b5736a; }
        .btn-outline {
          font-family: 'Jost', sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 12px;
          background: transparent;
          color: var(--rose);
          border: 1px solid var(--rose);
          padding: 10px 28px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--rose); color: white; }
        .gallery-img { transition: transform 0.4s; }
        .gallery-img:hover { transform: scale(1.03); }
        .divider { width: 60px; height: 1px; background: var(--gold); margin: 16px auto; }
        .stat-num { font-size: 48px; font-weight: 300; color: var(--rose); line-height: 1; }
        .volunteer-card {
          background: white;
          border-radius: 4px;
          padding: 24px 22px;
          border: 1px solid #f0e2d8;
          display: flex;
          gap: 18px;
          align-items: flex-start;
        }
        .volunteer-avatar {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: radial-gradient(circle at 0 0, var(--blush), var(--rose));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Jost', sans-serif;
          font-size: 18px;
          letter-spacing: 0.08em;
        }
        .volunteer-role {
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 4px;
        }
        .volunteer-tag {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f7ebe4;
          color: #7a4a3a;
          display: inline-block;
          margin-top: 10px;
        }
        .student-slot {
          border: 1px dashed var(--blush);
          border-radius: 4px;
          padding: 20px 18px;
          background: rgba(250,247,244,0.8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 120px;
        }
        .student-slot-label {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 6px;
        }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(44,26,16,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
        }
        .ai-response {
          background: #fffaf7;
          border-left: 3px solid var(--rose);
          padding: 20px 24px;
          border-radius: 0 4px 4px 0;
          line-height: 1.8;
          font-size: 16px;
          white-space: pre-wrap;
        }
        .upload-area {
          border: 2px dashed var(--blush);
          border-radius: 4px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
          background: white;
        }
        .upload-area:hover { border-color: var(--rose); }
        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(200,132,122,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(184,144,96,0.06) 0%, transparent 40%);
        }
        select {
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          padding: 8px 12px;
          border: 1px solid var(--blush);
          background: white;
          color: var(--deep);
          outline: none;
          cursor: pointer;
        }
        select:focus { border-color: var(--rose); }
      `}</style>

      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #f0e6d0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 22, color: "var(--rose)" }}>✦</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: "0.15em", fontStyle: "italic" }}>The Cinderella Project</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 36 }}>
            {[["home","Home"],["gallery","Gallery"],["catalog","Dress Catalog"],["volunteers","Volunteers"],["dropboxes","Donation Drop Boxes"],["mission","Mission Statement"],["tryon","✦ Try On"]].map(([tab, label]) => (
              <button key={tab} className={`nav-link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{label}</button>
            ))}
          </nav>
        </div>
      </header>

      {/* HOME */}
      {activeTab === "home" && (
        <div>
          {/* Hero */}
          <div style={{ position: "relative", background: "linear-gradient(135deg, #fdf0eb 0%, #f5e6d8 50%, #ede0d0 100%)", minHeight: "88vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div className="hero-pattern" />
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.35em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>Celebrating Every Body Since 2018</p>
                <h1 style={{ fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28, fontStyle: "italic" }}>
                  Everyone deserves their<br />
                  <span style={{ color: "var(--rose)" }}>fairy tale moment.</span>
                </h1>
                <div className="divider" style={{ margin: "0 0 28px" }} />
                <p style={{ fontSize: 18, lineHeight: 1.9, fontWeight: 300, color: "#5a3a2a", maxWidth: 460 }}>
                  The Cinderella Project brings pre-loved formalwear back to life and matches it with students for their milestone events, celebrating body positivity, sustainability, and a deep sense of belonging.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative" }}>
                <img src="/social/hero-1.jpg" alt="" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 2, marginTop: 32 }} />
                <img src="/social/hero-2.jpg" alt="" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 2 }} />
                <img src="/social/hero-3.jpg" alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 2 }} />
                <img src="/social/hero-4.jpg" alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 2, marginTop: -32 }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: "white", padding: "64px 32px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, textAlign: "center" }}>
              {[["1,200+","Dresses Donated"],["840+","Students Served"],["6","Years of Impact"]].map(([num, label]) => (
                <div key={label}>
                  <div className="stat-num">{num}</div>
                  <div className="divider" />
                  <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", fontSize: 12, textTransform: "uppercase", color: "#8a6a5a" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div style={{ background: "var(--champagne)", padding: "80px 32px", textAlign: "center" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Our Mission</p>
              <h2 style={{ fontSize: 36, fontWeight: 300, fontStyle: "italic", marginBottom: 24 }}>Transforming lives, one gown at a time</h2>
              <div className="divider" />
              <p style={{ fontSize: 17, lineHeight: 2, fontWeight: 300, color: "#5a3a2a", marginTop: 24 }}>
                We believe every student deserves to feel radiant, included, and completely themselves at their formal events. By upcycling donated gowns and accessories and pairing them with students in an affirming, welcoming space, we create moments of joy, confidence, and connection that last a lifetime.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 32, marginTop: 56, textAlign: "left" }}>
                {[
                  ["♡", "Donate a Dress", "Have a formal gown collecting dust? Share it so another student can feel amazing in it."],
                  ["✦", "Request a Dress", "Students can browse our catalog and request the gown that makes them feel most like themselves — at no cost."],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ padding: "28px 24px", background: "white", borderRadius: 2 }}>
                    <div style={{ fontSize: 24, color: "var(--rose)", marginBottom: 12 }}>{icon}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>{title}</h3>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6a4a3a", fontWeight: 300 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, padding: "20px 24px", background: "rgba(255,255,255,0.85)", borderRadius: 4, border: "1px solid #f0e2d8", textAlign: "left" }}>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, lineHeight: 1.8, color: "#6a4a3a" }}>
                  In addition to gowns, we also offer a rotating selection of donated heels, dress flats, and occasional costume jewelry and accessories. Availability changes each season based on what our community shares, and students are welcome to explore these extras during their visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY */}
      {activeTab === "gallery" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Moments & Memories</p>
            <h2 style={{ fontSize: 42, fontWeight: 300, fontStyle: "italic" }}>Our Gallery</h2>
            <div className="divider" />
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 15, color: "#7a5a4a", marginTop: 20, maxWidth: 500, margin: "20px auto 0" }}>A glimpse into the moments we've helped create — from dress fittings to prom night magic.</p>
          </div>
          <div style={{ columns: "3 300px", gap: 20 }}>
            {GALLERY.map((item, i) => (
              <div key={i} style={{ breakInside: "avoid", marginBottom: 20, overflow: "hidden", borderRadius: 2, position: "relative", cursor: "pointer" }}>
                <img className="gallery-img" src={item.img} alt={item.caption} style={{ width: "100%", display: "block", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(44,26,16,0.7))", padding: "32px 16px 12px" }}>
                  <p style={{ fontFamily: "'Jost', sans-serif", color: "white", fontSize: 12, letterSpacing: "0.1em" }}>{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MISSION STATEMENT (intentionally blank for now) */}
      {activeTab === "mission" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }} />
      )}

      {/* VOLUNTEERS */}
      {activeTab === "volunteers" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Our Pomfret Team</p>
            <h2 style={{ fontSize: 42, fontWeight: 300, fontStyle: "italic" }}>Volunteers & Faculty Leaders</h2>
            <div className="divider" />
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 15, color: "#7a5a4a", marginTop: 20, maxWidth: 560, margin: "20px auto 0" }}>
              The Cinderella Project at Pomfret School is made possible by dedicated faculty leaders and student volunteers who give their time, care, and creativity so every student can feel seen and celebrated.
            </p>
          </div>

          <section style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 400 }}>Faculty Leaders</h3>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a6a5a" }}>Pomfret School</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {FACULTY_LEADERS.map(leader => (
                <article key={leader.id} className="volunteer-card">
                  <div className="volunteer-avatar">
                    <span>{leader.initials}</span>
                  </div>
                  <div>
                    <div className="volunteer-role">Faculty Leader</div>
                    <h4 style={{ fontSize: 18, fontWeight: 400, marginBottom: 4 }}>{leader.name}</h4>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#7a5a4a", marginBottom: 4 }}>{leader.role}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aa8a7a" }}>{leader.school}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#6a4a3a", marginTop: 10, lineHeight: 1.7, fontWeight: 300 }}>
                      {leader.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <h3 style={{ fontSize: 22, fontWeight: 400 }}>Student Volunteers</h3>
              <span className="volunteer-tag">12 Volunteer Spots</span>
            </div>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#7a5a4a", marginBottom: 22, maxWidth: 620 }}>
              These spots are reserved for Pomfret School student volunteers who help with dress organization, fittings, outreach, and event support. Names, photos, and roles can be added here as your team grows.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {STUDENT_SLOTS.map(slot => (
                <div key={slot.id} className="student-slot">
                  <div>
                    <div className="student-slot-label">Student Volunteer</div>
                    <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 6 }}>Spot {slot.id}</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#aa8a7a", lineHeight: 1.6 }}>
                      Details to be added — name, class year, and volunteer role.
                    </p>
                  </div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#b08a78", marginTop: 10 }}>
                    You can edit this section in the site code to personalize each volunteer profile when you are ready.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* CATALOG */}
      {activeTab === "catalog" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Find Your Gown</p>
            <h2 style={{ fontSize: 42, fontWeight: 300, fontStyle: "italic" }}>Dress Catalog</h2>
            <div className="divider" />
          </div>

          {/* Filters */}
          <div style={{ background: "white", padding: "24px 28px", borderRadius: 2, marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Size</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SIZES.map(s => <button key={s} className={`filter-btn ${sizeFilter === s ? "active" : ""}`} onClick={() => setSizeFilter(s)}>{s}</button>)}
              </div>
            </div>
            <div style={{ width: 1, height: 50, background: "var(--blush)" }} />
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Style</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STYLES.map(s => <button key={s} className={`filter-btn ${styleFilter === s ? "active" : ""}`} onClick={() => setStyleFilter(s)}>{s}</button>)}
              </div>
            </div>
            <div style={{ width: 1, height: 50, background: "var(--blush)" }} />
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Availability</p>
              <button className={`filter-btn ${availFilter ? "active" : ""}`} onClick={() => setAvailFilter(v => !v)}>Available Only</button>
            </div>
          </div>

          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#8a6a5a", marginBottom: 24 }}>{filtered.length} gown{filtered.length !== 1 ? "s" : ""} found</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
            {filtered.map(dress => (
              <div key={dress.id} className="dress-card" onClick={() => setModalDress(dress)}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <img src={dress.img} alt={dress.name} style={{ width: "100%", height: 300, objectFit: "cover", display: "block", transition: "transform 0.4s" }} />
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <span className={`badge ${dress.available ? "badge-avail" : "badge-taken"}`}>{dress.available ? "Available" : "Reserved"}</span>
                  </div>
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 4 }}>{dress.name}</h3>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#8a6a5a", letterSpacing: "0.05em" }}>Size {dress.size} · {dress.color} · {dress.style}</p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#6a4a3a", marginTop: 10, lineHeight: 1.6, fontWeight: 300 }}>{dress.desc}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    {dress.available && (
                      <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setTryDress(dress.id); setActiveTab("tryon"); }}>Try On →</button>
                    )}
                    <button className="btn-outline" style={{ padding: "8px 18px", fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setModalDress(dress); }}>Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONATION DROP BOXES */}
      {activeTab === "dropboxes" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              Share the Magic
            </p>
            <h2 style={{ fontSize: 42, fontWeight: 300, fontStyle: "italic" }}>Find a Donation Drop Box</h2>
            <div className="divider" />
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: 15,
                color: "#7a5a4a",
                marginTop: 20,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.8,
              }}
            >
              Enter your ZIP code to see nearby donation drop boxes where you can share dresses, shoes, and accessories with The Cinderella Project community.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 2,
              padding: "24px 24px 28px",
              border: "1px solid #f0e2d8",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
                marginBottom: zipError ? 8 : 0,
              }}
            >
              <div style={{ flex: "0 0 120px" }}>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: 6,
                  }}
                >
                  ZIP Code
                </p>
                <input
                  type="text"
                  maxLength={10}
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    if (zipError) setZipError("");
                  }}
                  placeholder="e.g. 06259"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    padding: "8px 10px",
                    borderRadius: 2,
                    border: "1px solid var(--blush)",
                    outline: "none",
                    width: "100%",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const trimmed = zipCode.trim();
                      if (!/^\d{5}(-\d{4})?$/.test(trimmed)) {
                        setZipError("Please enter a valid US ZIP code.");
                        return;
                      }
                      const url = `https://www.google.com/maps?q=${encodeURIComponent(
                        `${trimmed} donation drop box`
                      )}&output=embed`;
                      setMapUrl(url);
                    }
                  }}
                />
              </div>
              <button
                className="btn-primary"
                style={{ padding: "10px 28px", fontSize: 11 }}
                onClick={() => {
                  const trimmed = zipCode.trim();
                  if (!/^\d{5}(-\d{4})?$/.test(trimmed)) {
                    setZipError("Please enter a valid US ZIP code.");
                    return;
                  }
                  const url = `https://www.google.com/maps?q=${encodeURIComponent(
                    `${trimmed} donation drop box`
                  )}&output=embed`;
                  setMapUrl(url);
                }}
              >
                Find Drop Boxes →
              </button>
            </div>
            {zipError && (
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  color: "#b85c5c",
                }}
              >
                {zipError}
              </p>
            )}
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11,
                color: "#aa8a7a",
                marginTop: 10,
              }}
            >
              Map results are powered by Google Maps and will show public locations that match your search.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 2,
              border: "1px solid #f0e2d8",
              overflow: "hidden",
              minHeight: 360,
            }}
          >
            {mapUrl ? (
              <iframe
                title="Donation drop box locations"
                src={mapUrl}
                style={{ width: "100%", height: 420, border: "none" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div
                style={{
                  height: 360,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 32,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, color: "var(--blush)", marginBottom: 14 }}>✦</div>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 14,
                    color: "#7a5a4a",
                    maxWidth: 420,
                    lineHeight: 1.8,
                  }}
                >
                  Type in your ZIP code above and we’ll show you a simple map of nearby locations where you can drop off donations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRY ON */}
      {activeTab === "tryon" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>AI Styling Studio</p>
            <h2 style={{ fontSize: 42, fontWeight: 300, fontStyle: "italic" }}>Virtual Try-On</h2>
            <div className="divider" />
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 15, color: "#7a5a4a", marginTop: 20, maxWidth: 520, margin: "20px auto 0" }}>
              Upload a photo of yourself, select a dress from our catalog, and our AI stylist will show you how you'd look — plus personalized styling tips just for you.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {/* Left: Upload + Select */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 20 }}>1. Upload your photo</h3>
              <div className="upload-area" onClick={() => fileRef.current?.click()}>
                {trySrc ? (
                  <img src={trySrc} alt="Your photo" style={{ maxHeight: 280, maxWidth: "100%", objectFit: "contain", borderRadius: 2 }} />
                ) : (
                  <div>
                    <div style={{ fontSize: 36, color: "var(--blush)", marginBottom: 12 }}>✦</div>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: "#8a6a5a" }}>Click to upload your photo</p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aa8a7a", marginTop: 4 }}>JPG, PNG supported</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              {trySrc && (
                <button className="btn-outline" style={{ marginTop: 12, fontSize: 11, padding: "8px 20px" }} onClick={() => { setTrySrc(null); setAiResponse(""); }}>Change Photo</button>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 400, marginTop: 36, marginBottom: 16 }}>2. Choose a dress</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 320, overflowY: "auto", padding: 4 }}>
                {DRESSES.filter(d => d.available).map(d => (
                  <div key={d.id} onClick={() => setTryDress(d.id)} style={{
                    border: `2px solid ${tryDress === d.id ? "var(--rose)" : "var(--blush)"}`,
                    borderRadius: 2, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s",
                    background: tryDress === d.id ? "#fff5f3" : "white"
                  }}>
                    <img src={d.img} alt={d.name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                    <div style={{ padding: "8px 10px" }}>
                      <p style={{ fontSize: 13, fontWeight: 400 }}>{d.name}</p>
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#8a6a5a" }}>Sz {d.size} · {d.color}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", marginTop: 28, padding: "14px", opacity: (!trySrc || !tryDress) ? 0.5 : 1 }}
                onClick={handleTryOn}
                disabled={!trySrc || !tryDress || aiLoading}
              >
                {aiLoading ? "Styling you up..." : "✦ Get My Styling Preview"}
              </button>
            </div>

            {/* Right: AI Response */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 20 }}>3. Your personal style preview</h3>
              {!aiResponse && !aiLoading && (
                <div style={{ background: "white", border: "1px solid var(--blush)", borderRadius: 2, padding: 40, textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 48, color: "var(--blush)", marginBottom: 16 }}>✦</div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: "#aa8a7a", lineHeight: 1.7 }}>
                    Upload your photo and select a dress to receive your personalized styling preview from our AI fashion consultant.
                  </p>
                </div>
              )}
              {aiLoading && (
                <div style={{ background: "white", border: "1px solid var(--blush)", borderRadius: 2, padding: 40, textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 32, color: "var(--rose)", marginBottom: 20, animation: "pulse 1.5s ease-in-out infinite" }}>✦</div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: "#8a6a5a" }}>Our AI stylist is crafting your preview...</p>
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                </div>
              )}
              {aiResponse && (
                <div>
                  {tryDress && <img src={DRESSES.find(d=>d.id===tryDress)?.img} alt="" style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 2, marginBottom: 20 }} />}
                  <div className="ai-response">{aiResponse}</div>
                  <button className="btn-primary" style={{ marginTop: 20, width: "100%", padding: 14 }} onClick={() => setActiveTab("catalog")}>Request This Dress →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalDress && (
        <div className="modal-overlay" onClick={() => setModalDress(null)}>
          <div style={{ background: "white", borderRadius: 2, maxWidth: 700, width: "100%", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }} onClick={e => e.stopPropagation()}>
            <img src={modalDress.img} alt={modalDress.name} style={{ width: "100%", height: "100%", minHeight: 400, objectFit: "cover" }} />
            <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column" }}>
              <span className={`badge ${modalDress.available ? "badge-avail" : "badge-taken"}`} style={{ alignSelf: "flex-start", marginBottom: 20 }}>{modalDress.available ? "Available" : "Reserved"}</span>
              <h2 style={{ fontSize: 28, fontWeight: 300, fontStyle: "italic", marginBottom: 8 }}>{modalDress.name}</h2>
              <div className="divider" style={{ margin: "12px 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[["Size", modalDress.size],["Color", modalDress.color],["Style", modalDress.style]].map(([k,v]) => (
                  <div key={k}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{k}</p>
                    <p style={{ fontSize: 16 }}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, lineHeight: 1.8, color: "#6a4a3a", fontWeight: 300, flex: 1 }}>{modalDress.desc}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                {modalDress.available && (
                  <button className="btn-primary" onClick={() => { setTryDress(modalDress.id); setModalDress(null); setActiveTab("tryon"); }}>Try On →</button>
                )}
                <button className="btn-outline" onClick={() => setModalDress(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "var(--deep)", color: "#c8a89a", padding: "48px 32px", marginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 300, fontStyle: "italic", color: "white", marginBottom: 4 }}>The Cinderella Project</p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.1em" }}>Everyone deserves their moment.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12 }}>contact@cinderellaproject.org</p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, marginTop: 4, opacity: 0.6 }}>© 2024 The Cinderella Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

