// --- inside the Metal/Acrylic section ---
<div style={{ marginBottom: 8 }}>
  <label style={{ fontSize: 13, marginRight: 8 }}>Finish:</label>
  <select value={maFinish} onChange={e => setMaFinish(e.target.value)}>
    {METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.finishes.map(f => (
      <option key={f} value={f}>{f}</option>
    ))}
  </select>
</div>

{/* Binding & Back selection */}
<div style={{ marginTop: 10 }}>
  <div style={{ fontSize: 13, marginBottom: 6 }}>
    Binding & back material — please pick a material and color
  </div>

  {/* If selected, show confirmation right here */}
  {maBindingSwatch ? (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
      <small>Selected: <strong>{COVER_CATEGORIES.find(c => c.key === maBindingCategory)?.label} — {maBindingSwatch}</strong></small>
    </motion.div>
  ) : (
    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
      Please select a binding & back swatch to continue.
    </div>
  )}

  {/* Category tabs */}
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
    {["standard","distressed","vegan","linen"].map(key => {
      const label = COVER_CATEGORIES.find(c => c.key === key)?.label || key;
      return (
        <Tab
          key={key}
          active={maBindingCategory === key}
          onClick={() => { setMaBindingCategory(key); setMaBindingSwatch(null); }}
        >
          {label}
        </Tab>
      );
    })}
  </div>

  {/* Swatch grid */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
    {bindingCategoryObj?.options.map(name => (
      <div
        key={name}
        onClick={() => setMaBindingSwatch(name)}
        style={{
          cursor: "pointer",
          border: maBindingSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db",
          borderRadius: 12,
          overflow: "hidden",
          background: "white",
        }}
      >
        <div style={{ height: 70, background: "#f3f4f6" }} />
        <div style={{ padding: 10, textAlign: "center", fontSize: 14 }}>{name}</div>
      </div>
    ))}
  </div>

  <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
    (Metal/Acrylic cover pairs with your chosen Leather or Linen for the spine & back.)
  </div>
</div>
