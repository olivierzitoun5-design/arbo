import { useState, useEffect, useRef, useCallback } from "react";

// ─── Sample Data ───────────────────────────────────────────────────────────────
const SAMPLE_TREES = [
  { id: 1, species: "Quercus alba", common: "White Oak", dbh: 36, height: 72, age: 120, health: "healthy", lat: 40.6892, lng: -73.9857, carbon: 1240, stormwater: 3200, energy: 890, wildlife: "High", zone: "Front Lawn", lastInspection: "2024-11-15", nextPrune: "2025-04-01", notes: "Excellent structure. Minor deadwood removal recommended.", riskScore: 1, photo: null, history: [{ date: "2024-11-15", action: "Annual Inspection", note: "Crown healthy, no significant defects" }, { date: "2024-03-20", action: "Deadwood Pruning", note: "Removed 3 dead limbs >2in diameter" }, { date: "2023-11-10", action: "Annual Inspection", note: "Slight crown dieback NE quadrant" }] },
  { id: 2, species: "Acer saccharum", common: "Sugar Maple", dbh: 24, height: 55, age: 65, health: "monitoring", lat: 40.6895, lng: -73.9850, carbon: 680, stormwater: 1800, energy: 620, wildlife: "Medium", zone: "Side Yard", lastInspection: "2024-10-22", nextPrune: "2025-06-15", notes: "Monitoring for early signs of tar spot. Soil compaction noted.", riskScore: 2, photo: null, history: [{ date: "2024-10-22", action: "Health Assessment", note: "Tar spot present on 15% of foliage" }, { date: "2024-05-10", action: "Soil Aeration", note: "Root zone decompaction completed" }, { date: "2023-09-15", action: "Mulch Application", note: "3in organic mulch ring applied" }] },
  { id: 3, species: "Tilia americana", common: "American Linden", dbh: 18, height: 42, age: 30, health: "action", lat: 40.6888, lng: -73.9862, carbon: 420, stormwater: 1100, energy: 380, wildlife: "Medium", zone: "Parking Strip", lastInspection: "2024-12-01", nextPrune: "2025-02-15", notes: "Co-dominant stems with included bark. Cabling recommended.", riskScore: 3, photo: null, history: [{ date: "2024-12-01", action: "Risk Assessment", note: "Structural defect identified — co-dominant stems" }, { date: "2024-06-20", action: "Crown Cleaning", note: "Removed crossing branches" }, { date: "2023-12-05", action: "Annual Inspection", note: "Growth rate normal, early structural concern noted" }] },
  { id: 4, species: "Prunus serotina", common: "Black Cherry", dbh: 14, height: 38, age: 25, health: "critical", lat: 40.6890, lng: -73.9845, carbon: 280, stormwater: 720, energy: 240, wildlife: "High", zone: "Rear Property", lastInspection: "2024-12-10", nextPrune: "2025-01-20", notes: "Extensive trunk decay. Cavity at 4ft. Monitor closely or consider staged reduction.", riskScore: 4, photo: null, history: [{ date: "2024-12-10", action: "Emergency Assessment", note: "Trunk cavity expanding, fungal fruiting bodies present" }, { date: "2024-08-15", action: "Resistograph Testing", note: "30% cross-section loss at 4ft height" }, { date: "2024-03-01", action: "Pruning", note: "Weight reduction on compromised side" }] },
  { id: 5, species: "Betula nigra", common: "River Birch", dbh: 12, height: 35, age: 15, health: "healthy", lat: 40.6893, lng: -73.9855, carbon: 190, stormwater: 520, energy: 180, wildlife: "Medium", zone: "Rain Garden", lastInspection: "2024-09-20", nextPrune: "2025-09-01", notes: "Thriving in rain garden. Multi-stem form, good structure.", riskScore: 1, photo: null, history: [{ date: "2024-09-20", action: "Annual Inspection", note: "Excellent vigor, no concerns" }, { date: "2024-04-10", action: "Mulch Refresh", note: "Added 2in mulch to rain garden" }] },
  { id: 6, species: "Platanus × acerifolia", common: "London Plane", dbh: 42, height: 80, age: 90, health: "healthy", lat: 40.6886, lng: -73.9848, carbon: 1580, stormwater: 4100, energy: 1120, wildlife: "High", zone: "Main Avenue", lastInspection: "2024-11-28", nextPrune: "2025-03-15", notes: "Magnificent specimen. Anthracnose history but recovering well.", riskScore: 1, photo: null, history: [{ date: "2024-11-28", action: "Annual Inspection", note: "Strong recovery from anthracnose" }, { date: "2024-02-15", action: "Structural Pruning", note: "Crown raised to 18ft clearance" }] },
  { id: 7, species: "Gleditsia triacanthos", common: "Honey Locust", dbh: 20, height: 48, age: 35, health: "monitoring", lat: 40.6891, lng: -73.9840, carbon: 510, stormwater: 1350, energy: 480, wildlife: "Low", zone: "East Border", lastInspection: "2024-10-05", nextPrune: "2025-07-01", notes: "Webworm activity noted. Monitor pest levels in spring.", riskScore: 2, photo: null, history: [{ date: "2024-10-05", action: "Pest Inspection", note: "Mimosa webworm damage on 20% canopy" }, { date: "2024-04-25", action: "Fertilization", note: "Organic slow-release applied" }] },
  { id: 8, species: "Picea abies", common: "Norway Spruce", dbh: 28, height: 60, age: 50, health: "action", lat: 40.6897, lng: -73.9860, carbon: 820, stormwater: 2100, energy: 950, wildlife: "High", zone: "North Screen", lastInspection: "2024-11-10", nextPrune: "2025-05-01", notes: "Lower branch dieback from shade. Needle cast developing.", riskScore: 3, photo: null, history: [{ date: "2024-11-10", action: "Disease Assessment", note: "Rhizosphaera needle cast confirmed" }, { date: "2024-06-01", action: "Fungicide Application", note: "Chlorothalonil treatment applied" }] },
];

const HEALTH_COLORS = { healthy: "#2D6A4F", monitoring: "#E9C46A", action: "#E76F51", critical: "#D62828" };
const HEALTH_LABELS = { healthy: "Healthy", monitoring: "Monitoring", action: "Action Required", critical: "Critical" };
const HEALTH_BG = { healthy: "#D8F3DC", monitoring: "#FFF3CD", action: "#FDDCC7", critical: "#FFD6D6" };

// ─── Utility Components ────────────────────────────────────────────────────────
const StatusBadge = ({ health }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Source Sans 3'", letterSpacing: "0.5px", textTransform: "uppercase", background: HEALTH_BG[health], color: HEALTH_COLORS[health], border: `1px solid ${HEALTH_COLORS[health]}30` }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: HEALTH_COLORS[health] }} />
    {HEALTH_LABELS[health]}
  </span>
);

const StatCard = ({ icon, label, value, unit, color = "#2D6A4F" }) => (
  <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 12, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 4, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ fontFamily: "'Source Sans 3'", fontSize: 12, fontWeight: 500, color: "#8B7D6B", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, color: "#2C3E2D" }}>{value}</span>
      {unit && <span style={{ fontFamily: "'Source Sans 3'", fontSize: 13, color: "#8B7D6B" }}>{unit}</span>}
    </div>
  </div>
);

const TreeIcon = ({ health, size = 32 }) => {
  const c = HEALTH_COLORS[health];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="14" y="22" width="4" height="8" rx="1" fill="#8B6914" />
      <ellipse cx="16" cy="14" rx="10" ry="12" fill={c} opacity="0.85" />
      <ellipse cx="16" cy="12" rx="7" ry="9" fill={c} opacity="0.55" />
    </svg>
  );
};

// ─── Map Component ─────────────────────────────────────────────────────────────
const PropertyMap = ({ trees, selectedTree, onSelectTree }) => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const W = 600, H = 400;

  const lats = trees.map(t => t.lat);
  const lngs = trees.map(t => t.lng);
  const pad = 60;
  const toX = lng => pad + ((lng - Math.min(...lngs)) / (Math.max(...lngs) - Math.min(...lngs) || 0.001)) * (W - 2 * pad);
  const toY = lat => H - pad - ((lat - Math.min(...lats)) / (Math.max(...lats) - Math.min(...lats) || 0.001)) * (H - 2 * pad);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    // Background terrain
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#E8F0E3");
    grad.addColorStop(0.5, "#F0F5EB");
    grad.addColorStop(1, "#E3EBDE");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 12);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = "#D4DCC8";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * H / 7); ctx.lineTo(W, i * H / 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i * W / 7, 0); ctx.lineTo(i * W / 7, H); ctx.stroke();
    }

    // Property boundary
    ctx.strokeStyle = "#A3B899";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.roundRect(30, 30, W - 60, H - 60, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zone labels
    ctx.fillStyle = "#A3B89980";
    ctx.font = "11px 'Source Sans 3', sans-serif";
    ctx.fillText("FRONT LAWN", 50, 355);
    ctx.fillText("REAR PROPERTY", 440, 80);
    ctx.fillText("MAIN AVENUE", 50, 50);

    // Draw trees
    trees.forEach(tree => {
      const x = toX(tree.lng);
      const y = toY(tree.lat);
      const isSelected = selectedTree?.id === tree.id;
      const isHov = hovered === tree.id;
      const r = Math.max(12, tree.dbh / 3);

      // Root zone circle
      ctx.beginPath();
      ctx.arc(x, y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = `${HEALTH_COLORS[tree.health]}10`;
      ctx.fill();
      ctx.strokeStyle = `${HEALTH_COLORS[tree.health]}30`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Canopy
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? HEALTH_COLORS[tree.health] : `${HEALTH_COLORS[tree.health]}CC`;
      ctx.fill();

      if (isSelected || isHov) {
        ctx.strokeStyle = "#2C3E2D";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = "#2C3E2D";
      ctx.font = `${isSelected ? "bold " : ""}11px 'Source Sans 3', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(tree.common.split(" ").pop(), x, y + r + 16);
      ctx.textAlign = "left";
    });

    // Scale bar
    ctx.fillStyle = "#8B7D6B";
    ctx.font = "10px 'Source Sans 3', sans-serif";
    ctx.fillText("Property View — Responsible Stewardship™", 12, H - 8);
  }, [trees, selectedTree, hovered]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const clicked = trees.find(t => {
      const dx = toX(t.lng) - mx, dy = toY(t.lat) - my;
      return Math.sqrt(dx * dx + dy * dy) < Math.max(14, t.dbh / 3) + 5;
    });
    if (clicked) onSelectTree(clicked);
  };

  const handleMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const h = trees.find(t => {
      const dx = toX(t.lng) - mx, dy = toY(t.lat) - my;
      return Math.sqrt(dx * dx + dy * dy) < Math.max(14, t.dbh / 3) + 5;
    });
    setHovered(h?.id || null);
    canvasRef.current.style.cursor = h ? "pointer" : "default";
  };

  return (
    <canvas ref={canvasRef} width={W} height={H} onClick={handleClick} onMouseMove={handleMove}
      style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid #D4DCC8" }} />
  );
};

// ─── Sidebar Tree List ─────────────────────────────────────────────────────────
const TreeListItem = ({ tree, isSelected, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    background: isSelected ? "#E8F0E3" : "transparent", borderRadius: 10, cursor: "pointer",
    border: isSelected ? "1px solid #A3B899" : "1px solid transparent",
    transition: "all 0.2s"
  }}>
    <TreeIcon health={tree.health} size={28} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "'Playfair Display'", fontSize: 14, fontWeight: 600, color: "#2C3E2D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tree.common}</div>
      <div style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#8B7D6B", fontStyle: "italic" }}>{tree.species}</div>
    </div>
    <StatusBadge health={tree.health} />
  </div>
);

// ─── Health Timeline ───────────────────────────────────────────────────────────
const HealthTimeline = ({ history }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", paddingLeft: 20 }}>
    <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "linear-gradient(to bottom, #2D6A4F, #E8E0D4)" }} />
    {history.map((h, i) => (
      <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", position: "relative" }}>
        <div style={{ position: "absolute", left: -16, top: 14, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "#2D6A4F" : "#D4DCC8", border: "2px solid #FEFCF9" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <span style={{ fontFamily: "'Source Sans 3'", fontSize: 13, fontWeight: 600, color: "#2C3E2D" }}>{h.action}</span>
            <span style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#8B7D6B" }}>{h.date}</span>
          </div>
          <span style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#6B7D5E", lineHeight: 1.4 }}>{h.note}</span>
        </div>
      </div>
    ))}
  </div>
);

// ─── Stewardship Plan ──────────────────────────────────────────────────────────
const StewardshipPlan = ({ tree }) => {
  const tasks = [
    { month: "Feb", task: "Winter structural assessment", status: tree.health === "critical" ? "urgent" : "scheduled" },
    { month: "Apr", task: "Spring pruning & deadwood removal", status: "scheduled" },
    { month: "May", task: "Soil aeration & mulch application", status: "scheduled" },
    { month: "Jun", task: "Pest & disease monitoring", status: tree.health === "monitoring" || tree.health === "action" ? "priority" : "scheduled" },
    { month: "Aug", task: "Mid-season health check", status: "scheduled" },
    { month: "Sep", task: "Organic fertilization", status: "scheduled" },
    { month: "Nov", task: "Annual comprehensive inspection", status: "scheduled" },
  ];

  const statusColors = { scheduled: "#2D6A4F", priority: "#E9C46A", urgent: "#D62828" };
  const statusBg = { scheduled: "#D8F3DC", priority: "#FFF3CD", urgent: "#FFD6D6" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 600, color: "#2C3E2D", marginBottom: 4 }}>
        2025 Stewardship Plan — {tree.common}
      </div>
      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#FEFCF9", borderRadius: 8, border: "1px solid #E8E0D4" }}>
          <span style={{ fontFamily: "'Source Sans 3'", fontSize: 12, fontWeight: 700, color: "#8B7D6B", width: 32 }}>{t.month}</span>
          <div style={{ flex: 1, height: 1, background: "#E8E0D4" }} />
          <span style={{ fontFamily: "'Source Sans 3'", fontSize: 13, color: "#2C3E2D", flex: 3 }}>{t.task}</span>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'Source Sans 3'", padding: "2px 10px", borderRadius: 12, background: statusBg[t.status], color: statusColors[t.status], textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.status}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Environmental Impact Panel ────────────────────────────────────────────────
const EnvironmentalImpact = ({ trees }) => {
  const totalCarbon = trees.reduce((s, t) => s + t.carbon, 0);
  const totalStormwater = trees.reduce((s, t) => s + t.stormwater, 0);
  const totalEnergy = trees.reduce((s, t) => s + t.energy, 0);
  const highWildlife = trees.filter(t => t.wildlife === "High").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, color: "#2C3E2D" }}>
        Property Environmental Impact
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard icon="🌿" label="Carbon Stored" value={`${(totalCarbon / 1000).toFixed(1)}t`} unit="CO₂ equivalent" color="#2D6A4F" />
        <StatCard icon="💧" label="Stormwater" value={`${(totalStormwater).toLocaleString()}`} unit="gal/yr intercepted" color="#2196F3" />
        <StatCard icon="⚡" label="Energy Saved" value={`$${totalEnergy.toLocaleString()}`} unit="per year" color="#E9C46A" />
        <StatCard icon="🦉" label="Wildlife Value" value={highWildlife} unit={`of ${trees.length} trees rated High`} color="#8B6914" />
      </div>

      {/* Mini bar chart */}
      <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: "'Source Sans 3'", fontSize: 12, fontWeight: 600, color: "#8B7D6B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Carbon Sequestration by Tree</div>
        {trees.sort((a, b) => b.carbon - a.carbon).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#2C3E2D", width: 100, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.common}</span>
            <div style={{ flex: 1, height: 16, background: "#E8E0D4", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: `${(t.carbon / 1600) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${HEALTH_COLORS[t.health]}, ${HEALTH_COLORS[t.health]}AA)`, borderRadius: 8, transition: "width 0.5s" }} />
            </div>
            <span style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#8B7D6B", width: 50 }}>{t.carbon} lbs</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function ResponsibleStewardship() {
  const [selectedTree, setSelectedTree] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  const filteredTrees = SAMPLE_TREES.filter(t => {
    if (filter !== "all" && t.health !== filter) return false;
    if (searchTerm && !t.common.toLowerCase().includes(searchTerm.toLowerCase()) && !t.species.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSelectTree = (tree) => {
    setSelectedTree(tree);
    setShowDetail(true);
    setDetailTab("overview");
  };

  const healthCounts = { healthy: 0, monitoring: 0, action: 0, critical: 0 };
  SAMPLE_TREES.forEach(t => healthCounts[t.health]++);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "map", label: "Property Map", icon: "◈" },
    { id: "inventory", label: "Tree Inventory", icon: "🌳" },
    { id: "impact", label: "Eco Impact", icon: "🌍" },
  ];

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: "#F5F1EB", minHeight: "100vh", color: "#2C3E2D" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #2C3E2D 0%, #1B4332 50%, #2D6A4F 100%)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" fill="none" stroke="#A3B899" strokeWidth="1.5" />
            <ellipse cx="18" cy="14" rx="8" ry="10" fill="#A3B899" opacity="0.7" />
            <ellipse cx="18" cy="12" rx="5" ry="7" fill="#D8F3DC" opacity="0.5" />
            <rect x="16.5" y="22" width="3" height="7" rx="1" fill="#8B6914" />
            <path d="M12 30 Q18 26 24 30" stroke="#A3B899" fill="none" strokeWidth="1" />
          </svg>
          <div>
            <div style={{ fontFamily: "'Playfair Display'", fontSize: 20, fontWeight: 700, color: "#FEFCF9", letterSpacing: "0.5px" }}>Responsible Stewardship<sup style={{ fontSize: 10, verticalAlign: "super" }}>™</sup></div>
            <div style={{ fontSize: 10, color: "#A3B899", letterSpacing: "2px", textTransform: "uppercase", marginTop: -2 }}>GIS-Driven Arborist Platform</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setShowDetail(false); }} style={{
              background: activeTab === item.id ? "rgba(163,184,153,0.25)" : "transparent",
              border: "none", color: activeTab === item.id ? "#D8F3DC" : "#A3B89990",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Source Sans 3'",
              fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 320, background: "#FEFCF9", borderRight: "1px solid #E8E0D4", padding: "20px 12px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search trees..." style={{
              width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D4DCC8",
              background: "#F5F1EB", fontFamily: "'Source Sans 3'", fontSize: 13, outline: "none",
              boxSizing: "border-box"
            }} />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {[{ key: "all", label: "All Trees" }, ...Object.entries(HEALTH_LABELS).map(([k, v]) => ({ key: k, label: v }))].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "4px 12px", borderRadius: 16, border: filter === f.key ? "2px solid #2D6A4F" : "1px solid #D4DCC8",
                background: filter === f.key ? "#D8F3DC" : "transparent", color: "#2C3E2D",
                fontFamily: "'Source Sans 3'", fontSize: 12, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4
              }}>
                {f.key !== "all" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: HEALTH_COLORS[f.key] }} />}
                {f.label}
                {f.key === "all" ? ` (${SAMPLE_TREES.length})` : ` (${healthCounts[f.key]})`}
              </button>
            ))}
          </div>

          {/* Tree list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredTrees.map(tree => (
              <TreeListItem key={tree.id} tree={tree} isSelected={selectedTree?.id === tree.id} onClick={() => handleSelectTree(tree)} />
            ))}
            {filteredTrees.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#8B7D6B", fontFamily: "'Source Sans 3'" }}>
                No trees match your filter.
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {/* ─── Dashboard View ─── */}
          {activeTab === "dashboard" && !showDetail && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 800, color: "#2C3E2D", margin: 0 }}>
                  Stewardship Dashboard
                </h1>
                <p style={{ fontFamily: "'Source Sans 3'", fontSize: 14, color: "#6B7D5E", margin: "4px 0 0" }}>
                  Proactive care overview — prioritizing tree health and longevity
                </p>
              </div>

              {/* Health overview cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
                <StatCard icon="🌿" label="Total Trees" value={SAMPLE_TREES.length} color="#2D6A4F" />
                <StatCard icon="✓" label="Healthy" value={healthCounts.healthy} color="#2D6A4F" />
                <StatCard icon="⚠" label="Needs Attention" value={healthCounts.action + healthCounts.monitoring} color="#E9C46A" />
                <StatCard icon="🔴" label="Critical" value={healthCounts.critical} color="#D62828" />
              </div>

              {/* Trees Needing Care (stewardship-first) */}
              <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, color: "#2C3E2D", margin: 0 }}>Trees Needing Care</h2>
                    <p style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#8B7D6B", margin: "2px 0 0" }}>Prioritized by stewardship opportunity, not just hazard</p>
                  </div>
                </div>
                {SAMPLE_TREES.filter(t => t.health !== "healthy").sort((a, b) => b.riskScore - a.riskScore).map(tree => (
                  <div key={tree.id} onClick={() => handleSelectTree(tree)} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", marginBottom: 8,
                    background: "#F5F1EB", borderRadius: 10, cursor: "pointer", border: "1px solid #E8E0D4",
                    transition: "transform 0.15s", position: "relative", overflow: "hidden"
                  }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: HEALTH_COLORS[tree.health] }} />
                    <TreeIcon health={tree.health} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 600, color: "#2C3E2D" }}>{tree.common}</div>
                      <div style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#6B7D5E" }}>{tree.notes}</div>
                    </div>
                    <StatusBadge health={tree.health} />
                  </div>
                ))}
              </div>

              {/* Quick Map */}
              <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, color: "#2C3E2D", margin: "0 0 16px" }}>Property Overview</h2>
                <PropertyMap trees={SAMPLE_TREES} selectedTree={selectedTree} onSelectTree={handleSelectTree} />
              </div>
            </div>
          )}

          {/* ─── Map View ─── */}
          {activeTab === "map" && !showDetail && (
            <div style={{ maxWidth: 900 }}>
              <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 800, color: "#2C3E2D", margin: "0 0 8px" }}>GIS Property Map</h1>
              <p style={{ fontFamily: "'Source Sans 3'", fontSize: 14, color: "#6B7D5E", margin: "0 0 20px" }}>Click any tree to view its stewardship profile</p>
              <PropertyMap trees={filteredTrees} selectedTree={selectedTree} onSelectTree={handleSelectTree} />
              <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
                {Object.entries(HEALTH_LABELS).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: HEALTH_COLORS[k] }} />
                    <span style={{ fontFamily: "'Source Sans 3'", fontSize: 12, color: "#6B7D5E" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Inventory View ─── */}
          {activeTab === "inventory" && !showDetail && (
            <div style={{ maxWidth: 960 }}>
              <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 800, color: "#2C3E2D", margin: "0 0 20px" }}>Tree Inventory</h1>
              <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 16, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Source Sans 3'" }}>
                  <thead>
                    <tr style={{ background: "#2C3E2D" }}>
                      {["Species", "Common Name", "DBH (in)", "Height (ft)", "Age", "Zone", "Condition"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#D8F3DC", letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrees.map((t, i) => (
                      <tr key={t.id} onClick={() => handleSelectTree(t)} style={{ cursor: "pointer", background: i % 2 === 0 ? "#FEFCF9" : "#F5F1EB", borderBottom: "1px solid #E8E0D4" }}>
                        <td style={{ padding: "10px 16px", fontSize: 13, fontStyle: "italic", color: "#6B7D5E" }}>{t.species}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#2C3E2D" }}>{t.common}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>{t.dbh}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>{t.height}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>{t.age} yr</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>{t.zone}</td>
                        <td style={{ padding: "10px 16px" }}><StatusBadge health={t.health} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Eco Impact View ─── */}
          {activeTab === "impact" && !showDetail && (
            <div style={{ maxWidth: 900 }}>
              <EnvironmentalImpact trees={SAMPLE_TREES} />
            </div>
          )}

          {/* ─── Tree Detail Panel ─── */}
          {showDetail && selectedTree && (
            <div style={{ maxWidth: 900 }}>
              <button onClick={() => setShowDetail(false)} style={{
                background: "none", border: "none", color: "#2D6A4F", fontFamily: "'Source Sans 3'",
                fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, display: "flex",
                alignItems: "center", gap: 4, padding: 0
              }}>
                ← Back to {activeTab === "map" ? "Map" : activeTab === "inventory" ? "Inventory" : "Dashboard"}
              </button>

              {/* Tree header */}
              <div style={{ background: "linear-gradient(135deg, #2C3E2D, #1B4332)", borderRadius: 16, padding: 28, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: `${HEALTH_COLORS[selectedTree.health]}20` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 32, fontWeight: 800, color: "#FEFCF9", margin: 0 }}>{selectedTree.common}</h1>
                    <p style={{ fontFamily: "'Source Sans 3'", fontSize: 16, color: "#A3B899", fontStyle: "italic", margin: "4px 0 12px" }}>{selectedTree.species}</p>
                    <StatusBadge health={selectedTree.health} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#A3B899", textTransform: "uppercase", letterSpacing: "1px" }}>Zone</div>
                    <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, color: "#FEFCF9", fontWeight: 600 }}>{selectedTree.zone}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
                  {[
                    { label: "DBH", value: `${selectedTree.dbh}"` },
                    { label: "Height", value: `${selectedTree.height} ft` },
                    { label: "Age", value: `~${selectedTree.age} yr` },
                    { label: "Risk Score", value: `${selectedTree.riskScore}/4` },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#A3B899", textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 22, fontWeight: 700, color: "#FEFCF9" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {[{ id: "overview", label: "Overview & Notes" }, { id: "timeline", label: "Tree Life Timeline" }, { id: "plan", label: "Stewardship Plan" }, { id: "eco", label: "Eco Value" }].map(tab => (
                  <button key={tab.id} onClick={() => setDetailTab(tab.id)} style={{
                    background: detailTab === tab.id ? "#2C3E2D" : "#FEFCF9",
                    color: detailTab === tab.id ? "#D8F3DC" : "#6B7D5E",
                    border: `1px solid ${detailTab === tab.id ? "#2C3E2D" : "#D4DCC8"}`,
                    padding: "8px 20px", borderRadius: 8, cursor: "pointer",
                    fontFamily: "'Source Sans 3'", fontSize: 13, fontWeight: 500
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ background: "#FEFCF9", border: "1px solid #E8E0D4", borderRadius: 16, padding: 24 }}>
                {detailTab === "overview" && (
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Arborist Notes</h3>
                    <p style={{ fontFamily: "'Source Sans 3'", fontSize: 14, lineHeight: 1.7, color: "#4A5D4A", background: "#F5F1EB", padding: 16, borderRadius: 10, borderLeft: `4px solid ${HEALTH_COLORS[selectedTree.health]}` }}>
                      {selectedTree.notes}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                      <div style={{ background: "#F5F1EB", borderRadius: 10, padding: 16 }}>
                        <div style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#8B7D6B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Last Inspection</div>
                        <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 600, color: "#2C3E2D" }}>{selectedTree.lastInspection}</div>
                      </div>
                      <div style={{ background: "#F5F1EB", borderRadius: 10, padding: 16 }}>
                        <div style={{ fontFamily: "'Source Sans 3'", fontSize: 11, color: "#8B7D6B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Next Scheduled Pruning</div>
                        <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 600, color: "#2C3E2D" }}>{selectedTree.nextPrune}</div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "timeline" && (
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Tree Life Timeline</h3>
                    <HealthTimeline history={selectedTree.history} />
                  </div>
                )}

                {detailTab === "plan" && <StewardshipPlan tree={selectedTree} />}

                {detailTab === "eco" && (
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display'", fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Ecological Value</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <StatCard icon="🌿" label="Carbon Stored" value={`${selectedTree.carbon}`} unit="lbs CO₂" color="#2D6A4F" />
                      <StatCard icon="💧" label="Stormwater Intercepted" value={`${selectedTree.stormwater.toLocaleString()}`} unit="gal/yr" color="#2196F3" />
                      <StatCard icon="⚡" label="Energy Savings" value={`$${selectedTree.energy}`} unit="per year" color="#E9C46A" />
                      <StatCard icon="🦉" label="Wildlife Habitat" value={selectedTree.wildlife} unit="value rating" color="#8B6914" />
                    </div>
                    <div style={{ marginTop: 20, background: "#D8F3DC", borderRadius: 12, padding: 20 }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 600, color: "#1B4332", marginBottom: 8 }}>
                        Why Preservation Matters
                      </div>
                      <p style={{ fontFamily: "'Source Sans 3'", fontSize: 13, lineHeight: 1.7, color: "#2D6A4F", margin: 0 }}>
                        This {selectedTree.common} stores {selectedTree.carbon} lbs of CO₂ and intercepts {selectedTree.stormwater.toLocaleString()} gallons of stormwater annually.
                        At approximately {selectedTree.age} years old, replacing it would take decades to match these environmental benefits.
                        Proactive stewardship preserves this ecological value for the community.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
