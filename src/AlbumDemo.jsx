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
     'standard' | 'distressed' | 'vegan' | 'linen' | 'photo' | 'metalacrylic'
     (ensures only one cover option at a time)
  */
  const [coverMode, setCoverMode] = useState("standard");

  /* base material swatch (for standard/distressed/vegan/linen) */
  const [coverSwatch, setCoverSwatch] = useState(null);

  /* photo cover fields */
  const [photoSubstrate, setPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [photoImageNums, setPhotoImageNums] = useState(["", "", "", ""]); // up to 4
  const enteredPhotoNums = photoImageNums.map(s => s.trim()).filter(Boolean);

  /* metal/acrylic fields */
  const [maType, setMaType] = useState("metal");
  const [maFinish, setMaFinish] = useState(METAL_ACRYLIC_TYPES[0].finishes[0]);
  const [maBindingCategory, setMaBindingCategory] = useState("standard"); // 'standard' | 'distressed' | 'vegan' | 'linen'
  const [maBindingSwatch, setMaBindingSwatch] = useState(null);

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

  /* current base category (for swatches) if in base material mode */
  const baseCategory = COVER_CATEGORIES.find(c => c.key === coverMode);
  const bindingCategoryObj = COVER_CATEGORIES.find(c => c.key === maBindingCategory);

  /* change cover mode and clear incompatible selections */
  function switchCoverMode(nextMode) {
    setCoverMode(nextMode);
    setCoverSwatch(null);
    if (nextMode !== "photo") {
      setPhotoSubstrate(PHOTO_SUBSTRATES[0]);
      setPhotoImageNums(["", "", "", ""]);
    }
    if (nextMode !== "metalacrylic") {
      setMaType("metal");
      setMaFinish(METAL_ACRYLIC_TYPES[0].finishes[0]);
      setMaBindingCategory("standard");
      setMaBindingSwatch(null);
    }
  }

  const coverIsComplete =
    (baseCategory && !!coverSwatch) ||
    (coverMode === "photo") ||
    (coverMode === "metalacrylic" && !!maBindingSwatch);

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
        <div style={{ marginBottom: 6, color: "#666", fontSize: 13 }}>
          Choose one cover option.
        </div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {COVER_CATEGORIES.map(cat => (
            <Tab key={cat.key} active={coverMode === cat.key} onClick={() => switchCoverMode(cat.key)}>
              {cat.label}
            </Tab>
          ))}
          <Tab active={coverMode === "photo"} onClick={() => switchCoverMode("photo")}>
            Photo ( +${PHOTO_COVER_PRICE} )
          </Tab>
          <Tab active={coverMode === "metalacrylic"} onClick={() => switchCoverMode("metalacrylic")}>
            Metal/Acrylic ( +${METAL_ACRYLIC_PRICE} )
          </Tab>
        </div>

        {/* A) Base material swatch grid */}
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

            {/* Binding & Back selection */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                Binding & back material — please pick a material and color
                <span style={{ fontSize: 12, color: "#666", marginLeft: 6 }}>
                  (Metal/Acrylic cover pairs with your chosen Leather or Linen for the spine & back.)
                </span>
              </div>

              {/* Selected confirmation OR hint */}
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
            </div>
          </div>
        )}
      </Section>

      {/* 4) Parent Albums */}
      <Section title="4) Parent Albums (optional)">
