import { useState, useMemo } from "react";
import { motion } from "framer-motion";

/** -----------------------------
 *  YOUR PRODUCTS & PRICING
 *  ----------------------------- */
const ALBUMS = {
  signature: {
    label: "Signature Layflat",
    sizes: [
      { key: "10x10", label: "10×10", price: 1000 },
      { key: "12x12", label: "12×12", price: 1200 },
      { key: "8x12",  label: "8×12 (horizontal)", price: 1000 },
      { key: "10x15", label: "10×15 (horizontal)", price: 1200 },
    ],
    notes: "Premier album. Handmade. Smallest seam. 30 pages / 15 spreads included.",
  },
  artisan: {
    label: "Artisan Flush",
    sizes: [
      { key: "10x10", label: "10×10", price: 700 },
      { key: "12x12", label: "12×12", price: 850 },
      { key: "8x11",  label: "8×11 (horizontal)", price: 700 },
      { key: "11x14", label: "11×14 (horizontal)", price: 900 },
    ],
    notes: "Budget-friendly. Machine pressed. 30 pages / 15 spreads included.",
  },
};

/** Parent Album pricing:
 *  - Small set: 8×8 or 6×9 = $325 each or two for $600
 *  - Large set: 10×10 or 8×11 = $400 each or two for $750
 */
const PARENT_ALBUMS = {
  small: { label: "8×8 or 6×9", each: 325, twoFor: 600 },
  large: { label: "10×10 or 8×11", each: 400, twoFor: 750 },
};

/** Standard Leather swatches (no price change yet) */
const LEATHERS = [
  { name: "Ash", color: "#6a6a72" },
  { name: "Black Olive", color: "#3c3b2f" },
  { name: "Blush", color: "#e7cdd3" },
  { name: "Buttercream", color: "#ede7d4" },
  { name: "Cardinal", color: "#b13434" },
  { name: "Flamingo", color: "#d96b6d" },
  { name: "Lavender", color: "#d9d6e3" },
  { name: "Maroon", color: "#643838" },
  { name: "Mist", color: "#bcbec4" },
  { name: "Monsoon", color: "#2e3e5d" },
  { name: "Mystique", color: "#4a2f2f" },
  { name: "Nightfall", color: "#2a2a2a" },
  { name: "Northern Lights", color: "#2f5959" },
  { name: "Peppercorn", color: "#3e2e2a" },
  { name: "Pink Coral", color: "#e1504f" },
  { name: "Pink Quartz", color: "#e3c7c7" },
  { name: "Polar", color: "#f5f5f5" },
  { name: "Powder Blue", color: "#b9d6e5" },
  { name: "Saddle", color: "#8a5a36" },
  { name: "Seafoam", color: "#bfe2d6" },
  { name: "Soft Gray", color: "#d9d9d9" },
  { name: "Walnut", color: "#5e3f34" },
];

/** Utility to price parent albums with bundle logic */
function priceParentAlbums(typeKey, qty) {
  if (!qty || qty <= 0) return 0;
  const tier = PARENT_ALBUMS[typeKey];
  if (!tier) return 0;

  // Use "two for" pricing for pairs, "each" pricing for remainder
  const pairs = Math.floor(qty / 2);
  const remainder = qty % 2;
  return pairs * tier.twoFor + remainder * tier.each;
}

export default function AlbumDemo() {
  // selections
  const [albumType, setAlbumType] = useState("signature"); // 'signature' or 'artisan'
  const [albumSizeKey, setAlbumSizeKey] = useState(ALBUMS.signature.sizes[0].key);
  const [leather, setLeather] = useState(null);

  // parent albums
  const [parentType, setParentType] = useState("small"); // 'small' | 'large'
  const [parentQty, setParentQty] = useState(0);

  // (Optional) demo coupon field (we won’t wire real coupons until Stripe)
  const [couponCode, setCouponCode] = useState("");

  // compute base album price
  const baseAlbumPrice = useMemo(() => {
    const album = ALBUMS[albumType];
    const size = album.sizes.find(s => s.key === albumSizeKey);
    return size ? size.price : 0;
  }, [albumType, albumSizeKey]);

  const parentAlbumsPrice = useMemo(() => priceParentAlbums(parentType, Number(parentQty) || 0), [parentType, parentQty]);

  // cover upgrades… none yet; coming next (Photo +$75, Metal/Acrylic +$200, Debossing +$200, etc.)
  const coverUpgradesPrice = 0;

  const subtotal = baseAlbumPrice + parentAlbumsPrice + coverUpgradesPrice;

  // demo coupon logic: if someone enters PREPAID400, subtract up to $400 (not below $0)
  const discount = couponCode.trim().toUpperCase() === "PREPAID400" ? Math.min(400, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const albumSizes = ALBUMS[albumType].sizes;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Album Configurator Demo</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        {ALBUMS[albumType].notes}
      </p>

      {/* Step 1: Album Type */}
      <Section title="1) Choose Album Type">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(ALBUMS).map(([key, album]) => (
            <OptionButton
              key={key}
              selected={albumType === key}
              onClick={() => {
                setAlbumType(key);
                // reset size to that album's first size
                setAlbumSizeKey(ALBUMS[key].sizes[0].key);
              }}
              label={album.label}
            />
          ))}
        </div>
      </Section>

      {/* Step 2: Album Size */}
      <Section title="2) Choose Size">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {albumSizes.map(size => (
            <Card
              key={size.key}
              selected={albumSizeKey === size.key}
              onClick={() => setAlbumSizeKey(size.key)}
            >
              <div style={{ fontWeight: 600 }}>{size.label}</div>
              <div>${size.price}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Step 3: Cover Material (Standard Leather for now) */}
      <Section title="3) Pick Cover Material (Standard Leather)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          {LEATHERS.map(l => (
            <div
              key={l.name}
              onClick={() => setLeather(l)}
              style={{
                cursor: "pointer",
                border: leather?.name === l.name ? "3px solid #2563eb" : "1px solid #ccc",
                borderRadius: 10,
                overflow: "hidden",
                textAlign: "center",
                userSelect: "none"
              }}
            >
              <div style={{ width: "100%", height: 60, backgroundColor: l.color }} />
              <div style={{ padding: 6, fontSize: 14 }}>{l.name}</div>
            </div>
          ))}
        </div>
        {leather && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
            <small>Selected: <strong>{leather.name}</strong></small>
          </motion.div>
        )}
      </Section>

      {/* Step 4: Parent Albums */}
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
            <input
              type="number"
              min={0}
              step={1}
              value={parentQty}
              onChange={e => setParentQty(e.target.value)}
              style={{ width: 80 }}
            />
          </label>
          <span style={{ opacity: 0.8 }}>= ${parentAlbumsPrice}</span>
        </div>
        <small style={{ color: "#555" }}>Tip: enter 0 if none. Bundle pricing applies automatically to pairs.</small>
      </Section>

      {/* Step 5: Coupon (demo) */}
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
        <div style={{ display: "grid", gap: 6, maxWidth: 480 }}>
          <Row label={`${ALBUMS[albumType].label} — ${albumSizes.find(s => s.key === albumSizeKey)?.label}`} value={`$${baseAlbumPrice}`} />
          <Row label={`Parent Albums (${PARENT_ALBUMS[parentType].label} × ${Number(parentQty) || 0})`} value={`$${parentAlbumsPrice}`} />
          {/* future upgrades go here */}
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
                leather: leather?.name || null,
                parentType,
                parentQty: Number(parentQty) || 0,
                subtotal,
                discount,
                total,
              };
              navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
              alert("Selections copied to clipboard for now (we’ll email/save these next).");
            }}
          >
            Copy selections (for testing)
          </button>
        </div>
      </Section>
    </div>
  );
}

/** UI helpers */
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
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
        borderRadius: 12,
        padding: 12,
        background: selected ? "#f0f7ff" : "white",
      }}
    >
      {children}
    </div>
  );
}
function OptionButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 9999,
        border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
        background: selected ? "#f0f7ff" : "white",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
function Row({ label, value, strong, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: strong ? 700 : 400, fontSize: big ? 20 : 16 }}>
      <span>{label}</span>
      <span>{value}</span>
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
