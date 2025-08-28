import { useState, useMemo } from "react";
import { motion } from "framer-motion";

/* -----------------------------
   PRODUCTS & PRICING
------------------------------ */
const ALBUMS = {
  signature: {
    label: "Signature Layflat",
    sizes: [
      { key: "10x10", label: "10×10", price: 1000 },
      { key: "12x12", label: "12×12", price: 1200 },
      { key: "8x12",  label: "8×12 (horizontal)", price: 1000 },
      { key: "10x15", label: "10×15 (horizontal)", price: 1200 },
    ],
    intro:
      "This is our Premier wedding album. It’s handmade and has the smallest seam in the industry. It’s meant to be a family heirloom.",
    spreads: "Each album starts with 30 pages / 15 spreads.",
  },
  artisan: {
    label: "Artisan Flush",
    sizes: [
      { key: "10x10", label: "10×10", price: 700 },
      { key: "12x12", label: "12×12", price: 850 },
      { key: "8x11",  label: "8×11 (horizontal)", price: 700 },
      { key: "11x14", label: "11×14 (horizontal)", price: 900 },
    ],
    intro:
      "This is our Budget friendly album that is machine pressed and a little more delicate.",
    spreads: "Each album starts with 30 pages / 15 spreads.",
  },
};

/* Parent Album pricing */
const PARENT_ALBUMS = {
  small: { label: "8×8 or 6×9", each: 325, twoFor: 600 },
  large: { label: "10×10 or 8×11", each: 400, twoFor: 750 },
};

/* Cover categories & swatch names (tiles for now; swap to images later) */
const COVER_CATEGORIES = [
  {
    key: "standard",
    label: "Standard Leather",
    options: [
      "Ash","Black Olive","Blush","Buttercream","Cardinal","Flamingo","Lavender",
      "Maroon","Mist","Monsoon","Mystique","Nightfall","Northern Lights","Peppercorn",
      "Pink Coral","Pink Quartz","Polar","Powder Blue","Saddle","Seafoam","Soft Gray","Walnut",
    ],
  },
  {
    key: "distressed",
    label: "Distressed Leather",
    options: ["Cream","Ore","Pebble","Sierra"],
  },
  {
    key: "vegan",
    label: "Vegan Leather",
    options: ["Coyote","Shadow","Spritz","Storm","Sunset","Wave"],
  },
  {
    key: "linen",
    label: "Linen",
    options: ["Ebony","Fog (Shimmer)","Oyster (shimmer)","Plum","Sage","Sand","Silver","Sky","Tundra","Tusk"],
  },
];

/* Photo cover substrates (+$75 flat) */
const PHOTO_SUBSTRATES = ["Canvas","Glossy","Metallic","Matte Metallic","Satin"];
const PHOTO_COVER_PRICE = 75;

/* Metal/Acrylic (+$200 flat) */
const METAL_ACRYLIC_PRICE = 200;
const METAL_ACRYLIC_TYPES = [
  { key: "metal", label: "Metal", finishes: ["Vivid Metal (high-gloss)", "Matte Metal (glare-reducing)", "Brushed Metal (textured)"] },
  { key: "acrylic", label: "Acrylic", finishes: ["Gloss Acrylic (high-gloss)", "Matte Acrylic (glare-reducing)"] },
];
const BINDING_BACK = ["Leather", "Linen"]; // for Metal/Acrylic only

/* Helpers */
function priceParentAlbums(typeKey, qty) {
  if (!qty || qty <= 0) return 0;
  const tier = PARENT_ALBUMS[typeKey];
  const pairs = Math.floor(qty / 2);
  const remainder = qty % 2;
  return pairs * tier.twoFor + remainder * tier.each;
}

export default function AlbumDemo() {
  /* core selections */
  const [albumType, setAlbumType] = useState("signature");
  const [albumSizeKey, setAlbumSizeKey] = useState(ALBUMS.signature.sizes[0].key);

  /* unified cover mode:
     - one of: 'standard' | 'distressed' | 'vegan' | 'linen' | 'photo' | 'metalacrylic'
     - ensures clients can only pick ONE cover type
  */
  const [coverMode, setCoverMode] = useState("standard");

  /* base material swatch (used when mode is standard/distressed/vegan/linen) */
  const [coverSwatch, setCoverSwatch] = useState(null);

  /* photo cover fields (used when mode === 'photo') */
  const [photoSubstrate, setPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [photoImageNums, setPhotoImageNums] = useState(["", "", "", ""]); // up to 4
  const enteredPhotoNums = photoImageNums.map(s => s.trim()).filter(Boolean);

  /* metal/acrylic fields (used when mode === 'metalacrylic') */
  const [maType, setMaType] = useState("metal");
  const [maFinish, setMaFinish] = useState(METAL_ACRYLIC_TYPES[0].finishes[0]);
  const [maBinding, setMaBinding] = useState(BINDING_BACK[0]);

  /* parent albums */
  const [parentType, setParentType] = useState("small");
  const [parentQty, setParentQty] = useState(0);

  /* coupon demo */
  const [couponCode, setCouponCode] = useState("");

  /* pricing */
  const baseAlbumPrice = useMemo(() => {
    const album = ALBUMS[albumType];
    const size = album.sizes.find(s => s.key === albumSizeKey);
    return size ? size.price : 0;
  }, [albumType, albumSizeKey]);

  const parentAlbumsPrice = useMemo(
    () => priceParentAlbums(parentType, Number(parentQty) || 0),
    [parentType, parentQty]
  );

  const coverUpgradePrice =
    coverMode === "photo" ? PHOTO_COVER_PRICE :
    coverMode === "metalacrylic" ? METAL_ACRYLIC_PRICE :
    0;

  const subtotal = baseAlbumPrice + parentAlbumsPrice + coverUpgradePrice;
  const discount = couponCode.trim().toUpperCase() === "PREPAID400" ? Math.min(400, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const albumSizes = ALBUMS[albumType].sizes;

  /* current base category (for swatches) if using a base material mode */
  const baseCategory = COVER_CATEGORIES.find(c => c.key === coverMode);

  /* when switching cover mode, clear incompatible fields */
  function switchCoverMode(nextMode) {
    setCoverMode(nextMode);
    // reset selections so only one cover path is active
    setCoverSwatch(null);
    if (nextMode !== "photo") {
      setPhotoSubstrate(PHOTO_SUBSTRATES[0]);
      setPhotoImageNums(["", "", "", ""]);
    }
    if (nextMode !== "metalacrylic") {
      setMaType("metal");
      setMaFinish(METAL_ACRYLIC_TYPES[0].finishes[0]);
      setMaBinding(BINDING_BACK[0]);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Album Configurator Demo</h1>

      {/* Album intro box */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fafafa" }}>
          <strong>{ALBUMS[albumType].label}</strong>
          <div style={{ marginTop: 6 }}>{ALBUMS[albumType].intro}</div>
          <div style={{ marginTop: 6, color: "#555" }}>{ALBUMS[albumType].spreads}</div>
        </div>
      </div>

      {/* 1) Album Type */}
      <Section title="1) Choose Album Type">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(ALBUMS).map(([key, album]) => (
            <OptionButton
              key={key}
              selected={albumType === key}
              onClick={() => { setAlbumType(key); setAlbumSizeKey(ALBUMS[key].sizes[0].key); }}
              label={album.label}
            />
          ))}
        </div>
      </Section>

      {/* 2) Album Size */}
      <Section title="2) Choose Size">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {albumSizes.map(size => (
            <Card key={size.key} selected={albumSizeKey === size.key} onClick={() => setAlbumSizeKey(size.key)}>
              <div style={{ fontWeight: 600 }}>{size.label}</div>
              <div>${size.price}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 3) Pick Cover Material (unified choices) */}
      <Section title="3) Pick Cover Material">
        {/* tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {/* Base materials */}
          {COVER_CATEGORIES.map(cat => (
            <Tab key={cat.key} active={coverMode === cat.key} onClick={() => switchCoverMode(cat.key)}>
              {cat.label}
            </Tab>
          ))}
          {/* Upgraded materials presented inline */}
          <Tab active={coverMode === "photo"} onClick={() => switchCoverMode("photo")}>
            Photo {coverMode === "photo" ? "(+$75)" : ""}
          </Tab>
          <Tab active={coverMode === "metalacrylic"} onClick={() => switchCoverMode("metalacrylic")}>
            Metal/Acrylic {coverMode === "metalacrylic" ? "(+$200)" : ""}
          </Tab>
        </div>

        {/* Content area switches by coverMode */}
        {/* A) Base material: show swatch grid */}
        {baseCategory && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {baseCategory.options.map(name => (
                <div
                  key={name}
                  onClick={() => setCoverSwatch(name)}
                  style={{
                    cursor: "pointer",
                    border: coverSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  {/* neutral tile; swap with real swatch <img> later */}
                  <div style={{ height: 70, background: "#f3f4f6" }} />
                  <div style={{ padding: 10, textAlign: "center", fontSize: 14 }}>{name}</div>
                </div>
              ))}
            </div>

            {coverSwatch && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}>
                <small>Selected: <strong>{baseCategory.label} — {coverSwatch}</strong></small>
              </motion.div>
            )}
          </>
        )}

        {/* B) Photo Cover */}
        {coverMode === "photo" && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Photo substrate:</label>
              <select value={photoSubstrate} onChange={e => setPhotoSubstrate(e.target.value)}>
                {PHOTO_SUBSTRATES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span style={{ marginLeft: 10, color: "#444" }}>+${PHOTO_COVER_PRICE}</span>
            </div>

            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {photoImageNums.map((val, idx) => (
                <div key={idx} style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                  <input
                    value={val}
                    onChange={e => {
                      const next = [...photoImageNums];
                      next[idx] = e.target.value;
                      setPhotoImageNums(next);
                    }}
                    placeholder="e.g., IMG_1234"
                    style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>
              ))}
            </div>

            <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
              Select up to 4 images. We’ll choose what works best within the margins, but you’ll get approval before sending to print.
            </p>
          </div>
        )}

        {/* C) Metal / Acrylic */}
        {coverMode === "metalacrylic" && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Type:</label>
              <select
                value={maType}
                onChange={e => {
                  const nextType = e.target.value;
                  setMaType(nextType);
                  const defFinish = METAL_ACRYLIC_TYPES.find(t => t.key === nextType)?.finishes[0] || "";
                  setMaFinish(defFinish);
                }}
              >
                {METAL_ACRYLIC_TYPES.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              <span style={{ marginLeft: 10, color: "#444" }}>+${METAL_ACRYLIC_PRICE}</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Finish:</label>
              <select value={maFinish} onChange={e => setMaFinish(e.target.value)}>
                {METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.finishes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, marginRight: 8 }}>Binding & back material:</label>
              <select value={maBinding} onChange={e => setMaBinding(e.target.value)}>
                {BINDING_BACK.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                (Metal/Acrylic cover pairs with your choice of Leather or Linen for the spine & back.)
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* 4) Parent Albums */}
      <Section title="4) Parent Albums (optional)">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            Type:&nbsp;
            <select value={parentType} onChange={e => setParentType(e.target.value)}>
              {Object.entries(PARENT_ALBUMS).map(([key, tier]) => (
                <option key={key} value={key}>{tier.label} — ${tier.each} ea or 2 for ${tier.twoFor}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity:&nbsp;
            <input type="number" min={0} step={1} value={parentQty} onChange={e => setParentQty(e.target.value)} style={{ width: 80 }} />
          </label>
          <span style={{ opacity: 0.8 }}>= ${parentAlbumsPrice}</span>
        </div>
      </Section>

      {/* 5) Coupon (demo) */}
      <Section title="5) Coupon (demo)">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Enter coupon code (try PREPAID400)"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", minWidth: 280 }}
          />
          {discount > 0 && <Badge>−${discount} applied</Badge>}
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <div style={{ display: "grid", gap: 6, maxWidth: 560 }}>
          <Row label={`${ALBUMS[albumType].label} — ${albumSizes.find(s => s.key === albumSizeKey)?.label}`} value={`$${baseAlbumPrice}`} />

          {/* Cover summary rows */}
          {baseCategory && (
            <Row label={`Cover: ${baseCategory.label}${coverSwatch ? ` — ${coverSwatch}` : ""}`} value={"$0"} />
          )}
          {coverMode === "photo" && (
            <>
              <Row label="Cover: Photo" value={`+$${PHOTO_COVER_PRICE}`} />
              <div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>
                Substrate: {photoSubstrate}
                {enteredPhotoNums.length > 0 && <> — Images: {enteredPhotoNums.join(", ")}</>}
              </div>
            </>
          )}
          {coverMode === "metalacrylic" && (
            <>
              <Row label="Cover: Metal/Acrylic" value={`+$${METAL_ACRYLIC_PRICE}`} />
              <div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>
                {METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.label} — {maFinish} — Binding/Back: {maBinding}
              </div>
            </>
          )}

          <Row label={`Parent Albums (${PARENT_ALBUMS[parentType].label} × ${Number(parentQty) || 0})`} value={`$${parentAlbumsPrice}`} />
          <Row label="Subtotal" value={`$${subtotal}`} strong />
          <Row label="Discount" value={`−$${discount}`} />
          <Row label="Total" value={`$${total}`} strong big />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={primaryBtn}
            onClick={() => alert("Next: we’ll connect Stripe Checkout and email notifications.")}
          >
            Continue to Checkout (coming next)
          </button>
          <button
            style={ghostBtn}
            onClick={() => {
              const payload = {
                albumType,
                albumSizeKey,
                cover: baseCategory
                  ? { mode: coverMode, category: baseCategory.label, swatch: coverSwatch }
                  : coverMode === "photo"
                  ? { mode: "photo", price: PHOTO_COVER_PRICE, substrate: photoSubstrate, images: enteredPhotoNums }
                  : { mode: "metalacrylic", price: METAL_ACRYLIC_PRICE, type: maType, finish: maFinish, binding: maBinding },
                parentType,
                parentQty: Number(parentQty) || 0,
                subtotal,
                discount,
                total,
              };
              navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
              alert("Selections copied to clipboard (we’ll send these to you automatically once checkout is connected).");
            }}
          >
            Copy selections (for testing)
          </button>
        </div>
      </Section>
    </div>
  );
}

/* UI components */
function Section({ title, children }) {
  return (
    <section style={{ margin: "20px 0" }}>
      <h2 style={{ margin: "0 0 8px" }}>{title}</h2>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>{children}</div>
    </section>
  );
}
function Card({ children, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      cursor: "pointer", border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
      borderRadius: 12, padding: 12, background: selected ? "#f0f7ff" : "white",
    }}>
      {children}
    </div>
  );
}
function OptionButton({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 12px", borderRadius: 9999, border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
      background: selected ? "#f0f7ff" : "white", cursor: "pointer",
    }}>
      {label}
    </button>
  );
}
function Row({ label, value, strong, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: strong ? 700 : 400, fontSize: big ? 20 : 16 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
function Badge({ children }) {
  return (
    <span style={{ border: "1px solid #d1d5db", borderRadius: 9999, padding: "4px 8px", fontSize: 12 }}>
      {children}
    </span>
  );
}
function Tab({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 10px", borderRadius: 9999,
      border: active ? "2px solid #2563eb" : "1px solid #d1d5db",
      background: active ? "#f0f7ff" : "white", cursor: "pointer"
    }}>
      {children}
    </button>
  );
}

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};
const ghostBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "black",
  cursor: "pointer",
};
