import { useState, useRef } from "react";

const DRESSES = [
  { id: 1, name: "Rosette Ball Gown", size: "4", color: "Blush Pink", style: "Ball Gown", available: true, img: "https://images.unsplash.com/photo-1566479179817-ba7e7e4b0ab1?w=400&q=80", desc: "Strapless tulle ball gown with delicate rosette bodice detailing. Perfect for prom." },
  { id: 2, name: "Midnight A-Line", size: "8", color: "Navy Blue", style: "A-Line", available: true, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", desc: "Elegant navy chiffon with sweetheart neckline and flowing skirt. Classic and timeless." },
  { id: 3, name: "Champagne Mermaid", size: "6", color: "Champagne", style: "Mermaid", available: false, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", desc: "Fitted mermaid silhouette in champagne satin with lace overlay. Glamorous and sophisticated." },
  { id: 4, name: "Ruby Cocktail", size: "10", color: "Red", style: "Cocktail", available: true, img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80", desc: "Short cocktail dress in rich ruby red with cap sleeves and full skirt." },
  { id: 5, name: "Sage Garden Gown", size: "12", color: "Sage Green", style: "A-Line", available: true, img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80", desc: "Dreamy sage green with floral embroidery at the waist. Light and ethereal." },
  { id: 6, name: "Lavender Lace", size: "2", color: "Lavender", style: "Column", available: true, img: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&q=80", desc: "Sleek column silhouette in soft lavender lace with spaghetti straps." },
  { id: 7, name: "Ivory Princess", size: "14", color: "Ivory", style: "Ball Gown", available: false, img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", desc: "Classic ivory ball gown with tiered tulle skirt and beaded waistband." },
  { id: 8, name: "Coral Wrap Dress", size: "16", color: "Coral", style: "Wrap", available: true, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80", desc: "Flowing coral wrap dress with V-neckline. Flattering and versatile." },
];

const GALLERY = [
  { img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", caption: "Spring Gala 2024" },
  { img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80", caption: "Prom Night Success" },
  { img: "https://images.unsplash.com/photo-1529635767094-e9a5b2f64ec7?w=600&q=80", caption: "Our Volunteers" },
  { img: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80", caption: "Dress Drive 2024" },
  { img: "https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a?w=600&q=80", caption: "Community Partners" },
  { img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80", caption: "Happy Recipients" },
];

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
      const prompt = `You are a professional fashion stylist for a charity called The Cinderella Project, which gives formal dresses to students who cannot afford them. 

A user has uploaded a photo of themselves and selected this dress from our catalog:
- Name: ${dress.name}
- Color: ${dress.color}
- Style: ${dress.style}
- Description: ${dress.desc}

Please:
1. Acknowledge their photo warmly and personally (describe something specific about their appearance to show you see them)
2. Vividly describe how this specific dress would look on them — consider their features, coloring, and body type
3. Give 2-3 personalized styling tips (hair, accessories, shoes) to complete the look
4. End with an encouraging, empowering message about how they'll shine at their event

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
            {[["home","Home"],["gallery","Gallery"],["catalog","Dress Catalog"],["tryon","✦ Try On"]].map(([tab, label]) => (
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
                <p style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.35em", fontSize: 11, textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>Empowering Dreams Since 2018</p>
                <h1 style={{ fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28, fontStyle: "italic" }}>
                  Every girl deserves her<br />
                  <span style={{ color: "var(--rose)" }}>fairy tale moment.</span>
                </h1>
                <div className="divider" style={{ margin: "0 0 28px" }} />
                <p style={{ fontSize: 18, lineHeight: 1.9, fontWeight: 300, color: "#5a3a2a", maxWidth: 460 }}>
                  The Cinderella Project collects and redistributes formal gowns to students who cannot afford to purchase their own, ensuring that every young woman can attend prom, homecoming, and other milestone events with confidence and joy.
                </p>
                <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
                  <button className="btn-primary" onClick={() => setActiveTab("catalog")}>Browse Dresses</button>
                  <button className="btn-outline" onClick={() => setActiveTab("gallery")}>Our Impact</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative" }}>
                <img src="https://images.unsplash.com/photo-1566479179817-ba7e7e4b0ab1?w=300&q=80" alt="" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 2, marginTop: 32 }} />
                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80" alt="" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 2 }} />
                <img src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&q=80" alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 2 }} />
                <img src="https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=300&q=80" alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 2, marginTop: -32 }} />
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
                We believe that financial hardship should never prevent a student from experiencing the magic of their formal events. By accepting donated gowns and accessories and matching them with students in need, we create moments of joy, confidence, and belonging that last a lifetime.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginTop: 56, textAlign: "left" }}>
                {[
                  ["♡", "Donate a Dress", "Have a formal gown collecting dust? Donate it and give another student her perfect night."],
                  ["✦", "Request a Dress", "Students in need can browse our catalog and request their dream gown completely free."],
                  ["◈", "Volunteer", "Join our team of dedicated volunteers who make the magic happen behind the scenes."]
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ padding: "28px 24px", background: "white", borderRadius: 2 }}>
                    <div style={{ fontSize: 24, color: "var(--rose)", marginBottom: 12 }}>{icon}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>{title}</h3>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, lineHeight: 1.7, color: "#6a4a3a", fontWeight: 300 }}>{desc}</p>
                  </div>
                ))}
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
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.1em" }}>Every girl deserves her moment.</p>
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
