import { useState, useMemo } from "react";
import { motion } from "framer-motion";

/* -----------------------------
   VERSION (for cache sanity)
------------------------------ */
const VERSION = "build-upgrades-1";

/* -----------------------------
   PRODUCTS & PRICING
------------------------------ */
const ALBUMS = {
  signature: {
    label: "Signature Layflat",
    sizes: [
      { key: "10x10", label: "10×10", price: 1000 },
      { key: "12x12", label: "12×12", price: 1200 },
      { key: "8x12", label: "8×12 (horizontal)", price: 1000 },
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
      { key: "8x11", label: "8×11 (horizontal)", price: 700 },
      { key: "11x14", label: "11×14 (horizontal)", price: 900 },
    ],
    intro:
      "This is our Budget friendly album that is machine pressed and a little more delicate.",
    spreads: "Each album starts with 30 pages / 15 spreads.",
  },
};

/* Parent Album pricing (base; add-ons priced separately) */
const PARENT_ALBUMS = {
  small: { label: "8×8 or 6×9", each: 325, twoFor: 600 },
  large: { label: "10×10 or 8×11", each: 400, twoFor: 750 },
};

/* -----------------------------
   COVER SETS (by album type)
------------------------------ */

/* Signature swatches */
const SIGNATURE_BASE_CATEGORIES = [
  { key: "standard",   label: "Standard Leather", options: ["Ash","Black Olive","Blush","Buttercream","Cardinal","Flamingo","Lavender","Maroon","Mist","Monsoon","Mystique","Nightfall","Northern Lights","Peppercorn","Pink Coral","Pink Quartz","Polar","Powder Blue","Saddle","Seafoam","Soft Gray","Walnut"] },
  { key: "distressed", label: "Distressed Leather", options: ["Cream","Ore","Pebble","Sierra"] },
  { key: "vegan",      label: "Vegan Leather", options: ["Coyote","Shadow","Spritz","Storm","Sunset","Wave"] },
  { key: "linen",      label: "Linen", options: ["Ebony","Fog (Shimmer)","Oyster (shimmer)","Plum","Sage","Sand","Silver","Sky","Tundra","Tusk"] },
];

/* Artisan swatches */
const ARTISAN_BASE_CATEGORIES = [
  { key: "modern",  label: "Modern Genuine Leather",  options: ["Black","Dark Brown","Espresso","Navy Blue","Charcoal","Blue Grey","Distressed Navy Blue","Distressed Dark Green","Distressed Cinnamon","Distressed Caramel","Ivory","White"] },
  { key: "classic", label: "Classic Genuine Leather", options: ["Black","Navy Blue","Dark Brown","Blue Grey","White","Beige"] },
  { key: "leatherette", label: "Leatherette", options: ["Black","Navy Blue","Dark Hunter Green","Mahogany Brown","Denim Blue","Royal Blue","Red","Cinnamon","Cedar Brown","Grey","Pastel Mint","Cloud Blue","Burgundy","Eggshell","Blush Pink","Ivory","White","Walnut","Cherry Wood","Oak","Birch"] },
  { key: "linen",   label: "Linen", options: ["Burgundy","Midnight Blue","Black","Dark Chocolate","Forest Green","Dark Hunter Green","Coffee","Steel Blue","Tortilla Brown","Concrete Grey","Petal Pink","Buttermilk","Teal","Stone Blue","Walnut","Dove Grey","Wheat","Sand","Green Tea","Oatmeal","Cream","Navy Blue","Slate Grey","Maroon","Pink Rose","Light Blue"] },
];

/* Photo cover substrates */
const PHOTO_SUBSTRATES = ["Canvas","Glossy","Metallic","Matte Metallic","Satin"];
const PHOTO_COVER_PRICE = 75;             // main album photo cover price
const PARENT_PHOTO_COVER_PRICE = 75;      // per parent album

/* Metal/Acrylic (+$200) — Signature only */
const METAL_ACRYLIC_PRICE = 200;
const METAL_ACRYLIC_TYPES = [
  { key: "metal", label: "Metal", finishes: ["Vivid Metal (high-gloss)", "Matte Metal (glare-reducing)", "Brushed Metal (textured)"] },
  { key: "acrylic", label: "Acrylic", finishes: ["Gloss Acrylic (high-gloss)", "Matte Acrylic (glare-reducing)"] },
];

/* Cover set config */
const COVER_SET = {
  signature: {
    baseCategories: SIGNATURE_BASE_CATEGORIES,
    allowPhoto: true,
    allowMetalAcrylic: true,
  },
  artisan: {
    baseCategories: ARTISAN_BASE_CATEGORIES,
    allowPhoto: true,
    allowMetalAcrylic: false,
  },
};

/* -----------------------------
   OTHER UPGRADES
------------------------------ */
const GILDING_PRICE = 75; // flat up to 15 spreads / 30 pages

/* Page Thickness options (Signature only). Prices TBD (0 for now). */
const PAGE_THICKNESS_OPTIONS = [
  { key: "standard", label: "Standard (included)", price: 0 },
  { key: "thick",    label: "Thick (+$TBD)",       price: 0 }, // update later
  { key: "xthick",   label: "Extra Thick (+$TBD)", price: 0 }, // update later
];

/* -----------------------------
   HELPERS
------------------------------ */
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

  /* cover state (main album) */
  const defaultCoverMode = COVER_SET[albumType].baseCategories[0].key;
  const [coverMode, setCoverMode] = useState(defaultCoverMode);
  const [coverSwatch, setCoverSwatch] = useState(null);

  // photo fields (main)
  const [photoSubstrate, setPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [photoImageNums, setPhotoImageNums] = useState(["", "", "", ""]);
  const enteredPhotoNums = photoImageNums.map(s => s.trim()).filter(Boolean);

  // metal/acrylic (Signature only)
  const [maType, setMaType] = useState("metal");
  const [maFinish, setMaFinish] = useState(METAL_ACRYLIC_TYPES[0].finishes[0]);
  const [maBindingCategory, setMaBindingCategory] = useState("standard");
  const [maBindingSwatch, setMaBindingSwatch] = useState(null);

  /* parent albums */
  const [parentType, setParentType] = useState("small");
  const [parentQty, setParentQty] = useState(0);

  // parent cover (independent; uses ARTISAN set always)
  const [parentCoverMode, setParentCoverMode] = useState(ARTISAN_BASE_CATEGORIES[0].key);
  const [parentCoverSwatch, setParentCoverSwatch] = useState(null);
  const [parentPhotoSubstrate, setParentPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [parentPhotoImageNums, setParentPhotoImageNums] = useState(["", "", "", ""]);
  const parentEnteredPhotoNums = parentPhotoImageNums.map(s => s.trim()).filter(Boolean);

  /* coupon demo */
  const [couponCode, setCouponCode] = useState("");

  /* upgrades */
  const [addGilding, setAddGilding] = useState(false);
  const [pageThickness, setPageThickness] = useState(PAGE_THICKNESS_OPTIONS[0].key); // Signature only

  /* when album type switches */
  function onChangeAlbumType(nextType) {
    setAlbumType(nextType);
    setAlbumSizeKey(ALBUMS[nextType].sizes[0].key);

    // reset main cover to first category for that album
    const firstKey = COVER_SET[nextType].baseCategories[0].key;
    setCoverMode(firstKey);
    setCoverSwatch(null);

    // reset upgrades
    setPhotoSubstrate(PHOTO_SUBSTRATES[0]);
    setPhotoImageNums(["", "", "", ""]);
    setMaType("metal");
    setMaFinish(METAL_ACRYLIC_TYPES[0].finishes[0]);
    setMaBindingCategory("standard");
    setMaBindingSwatch(null);

    // page thickness resets when switching album type
    setPageThickness(PAGE_THICKNESS_OPTIONS[0].key);
    setAddGilding(false);
  }

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

  // Parent photo cover surcharge: +$75 EACH parent album if Photo is chosen
  const parentPhotoCoverUpcharge = useMemo(() => {
    const qty = Number(parentQty) || 0;
    return parentCoverMode === "photo" ? qty * PARENT_PHOTO_COVER_PRICE : 0;
  }, [parentCoverMode, parentQty]);

  // Gilding upcharge (flat $75)
  const gildingUpcharge = addGilding ? GILDING_PRICE : 0;

  // Page thickness price (currently all 0s as placeholders)
  const pageThicknessPrice = useMemo(() => {
    const opt = PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness);
    return opt?.price || 0;
  }, [pageThickness]);

  const upgradesPrice =
    (coverMode === "photo" ? PHOTO_COVER_PRICE : 0) +
    (coverMode === "metalacrylic" && COVER_SET[albumType].allowMetalAcrylic ? METAL_ACRYLIC_PRICE : 0) +
    parentPhotoCoverUpcharge +
    gildingUpcharge +
    pageThicknessPrice;

  const subtotal = baseAlbumPrice + parentAlbumsPrice + upgradesPrice;
  const discount = couponCode.trim().toUpperCase() === "PREPAID400" ? Math.min(400, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  /* current cover set for main album */
  const currentSet = COVER_SET[albumType];
  const baseCategory = currentSet.baseCategories.find(c => c.key === coverMode);

  /* validation */
  const mainCoverIsComplete =
    (baseCategory && !!coverSwatch) ||
    (coverMode === "photo") ||
    (coverMode === "metalacrylic" && currentSet.allowMetalAcrylic && !!maBindingSwatch);

  const parentCoverCategoryObj = ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode);
  const parentCoverIsComplete =
    Number(parentQty) === 0 ||
    (!!parentCoverCategoryObj && !!parentCoverSwatch) ||
    (parentCoverMode === "photo"); // photo doesn't need a swatch

  const canCheckout = mainCoverIsComplete && parentCoverIsComplete;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Album Configurator Demo</h1>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Version: {VERSION}</div>

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
              onClick={() => onChangeAlbumType(key)}
              label={album.label}
            />
          ))}
        </div>
      </Section>

      {/* 2) Album Size */}
      <Section title="2) Choose Size">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {ALBUMS[albumType].sizes.map(size => (
            <Card key={size.key} selected={albumSizeKey === size.key} onClick={() => setAlbumSizeKey(size.key)}>
              <div style={{ fontWeight: 600 }}>{size.label}</div>
              <div>${size.price}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 3) Pick Cover Material */}
      <Section title="3) Pick Cover Material">
        <div style={{ marginBottom: 6, color: "#666", fontSize: 13 }}>
          Choose one cover option.
        </div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {/* Base categories */}
          {currentSet.baseCategories.map(cat => (
            <Tab key={cat.key} active={coverMode === cat.key} onClick={() => { setCoverMode(cat.key); setCoverSwatch(null); }}>
              {cat.label}
            </Tab>
          ))}

          {/* Photo */}
          {currentSet.allowPhoto && (
            <Tab active={coverMode === "photo"} onClick={() => setCoverMode("photo")}>
              Photo ( +${PHOTO_COVER_PRICE} )
            </Tab>
          )}

          {/* Metal/Acrylic (Signature only) */}
          {currentSet.allowMetalAcrylic && (
            <Tab active={coverMode === "metalacrylic"} onClick={() => setCoverMode("metalacrylic")}>
              Metal/Acrylic ( +${METAL_ACRYLIC_PRICE} )
            </Tab>
          )}
        </div>

        {/* A) Base swatch grid */}
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
        {coverMode === "photo" && currentSet.allowPhoto && (
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

        {/* C) Metal/Acrylic (Signature only) */}
        {coverMode === "metalacrylic" && currentSet.allowMetalAcrylic && (
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

              {/* selected confirmation OR hint */}
              {maBindingSwatch ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
                  <small>Selected: <strong>{SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.label} — {maBindingSwatch}</strong></small>
                </motion.div>
              ) : (
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                  Please select a binding & back swatch to continue.
                </div>
              )}

              {/* binding category tabs */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {SIGNATURE_BASE_CATEGORIES.filter(c => c.key !== "vegan").map(cat => (
                  <Tab
                    key={cat.key}
                    active={maBindingCategory === cat.key}
                    onClick={() => { setMaBindingCategory(cat.key); setMaBindingSwatch(null); }}
                  >
                    {cat.label}
                  </Tab>
                ))}
              </div>

              {/* swatch grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.options.map(name => (
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

        {/* Parent Album Cover Picker (shows when qty > 0) */}
        {Number(parentQty) > 0 && (
          <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              Parent Album Cover — please pick a material and color (same options as Artisan)
            </div>

            {/* tabs: Artisan base categories + Photo ( +$75 each ) */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {ARTISAN_BASE_CATEGORIES.map(cat => (
                <Tab
                  key={cat.key}
                  active={parentCoverMode === cat.key}
                  onClick={() => { setParentCoverMode(cat.key); setParentCoverSwatch(null); }}
                >
                  {cat.label}
                </Tab>
              ))}
              <Tab
                active={parentCoverMode === "photo"}
                onClick={() => setParentCoverMode("photo")}
              >
                Photo ( +${PARENT_PHOTO_COVER_PRICE} each )
              </Tab>
            </div>

            {/* Base swatch grid */}
            {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode) && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.options.map(name => (
                    <div
                      key={name}
                      onClick={() => setParentCoverSwatch(name)}
                      style={{
                        cursor: "pointer",
                        border: parentCoverSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db",
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

                {parentCoverSwatch && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}>
                    <small>Selected: <strong>{ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label} — {parentCoverSwatch}</strong></small>
                  </motion.div>
                )}
              </>
            )}

            {/* Photo cover inputs ( +$75 each ) */}
            {parentCoverMode === "photo" && (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13, marginRight: 8 }}>Photo substrate:</label>
                  <select value={parentPhotoSubstrate} onChange={e => setParentPhotoSubstrate(e.target.value)}>
                    {PHOTO_SUBSTRATES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span style={{ marginLeft: 10, color: "#444" }}>+${PARENT_PHOTO_COVER_PRICE} each</span>
                </div>

                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  {parentPhotoImageNums.map((val, idx) => (
                    <div key={idx} style={{ display: "grid", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                      <input
                        value={val}
                        onChange={e => {
                          const next = [...parentPhotoImageNums];
                          next[idx] = e.target.value;
                          setParentPhotoImageNums(next);
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
          </div>
        )}

        {/* Helpful hint if qty > 0 but no cover yet */}
        {Number(parentQty) > 0 && !parentCoverIsComplete && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#b45309" }}>
            Please select a Parent Album cover (pick a swatch or choose Photo).
          </div>
        )}
      </Section>

      {/* 5) Upgrades */}
      <Section title="5) Upgrades">
        {/* Page Thickness (Signature only) */}
        {albumType === "signature" && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Page Thickness (Signature only)</div>
            <div>
              <select
                value={pageThickness}
                onChange={(e) => setPageThickness(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid #d1d5db", minWidth: 260 }}
              >
                {PAGE_THICKNESS_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              {pageThicknessPrice > 0 && (
                <span style={{ marginLeft: 10 }}>+${pageThicknessPrice}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              We’ll update pricing here once you finalize thickness upgrade amounts.
            </div>
          </div>
        )}

        {/* Gilding */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={addGilding}
              onChange={(e) => setAddGilding(e.target.checked)}
            />
            <span>Add Gilding (protective decorative edge)</span>
            <span style={{ fontWeight: 600 }}>+${GILDING_PRICE}</span>
          </label>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Applies up to 15 spreads / 30 pages.
          </div>
        </div>
      </Section>

      {/* 6) Coupon (demo) */}
      <Section title="6) Coupon (demo)">
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
          <Row label={`${ALBUMS[albumType].label} — ${ALBUMS[albumType].sizes.find(s => s.key === albumSizeKey)?.label}`} value={`$${baseAlbumPrice}`} />

          {/* Main Cover summary */}
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
          {coverMode === "metalacrylic" && currentSet.allowMetalAcrylic && (
            <>
              <Row label="Cover: Metal/Acrylic" value={`+$${METAL_ACRYLIC_PRICE}`} />
              <div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>
                {METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.label} — {maFinish}
              </div>
              <div style={{ fontSize: 14, color: "#444" }}>
                Binding/Back: {SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.label}{maBindingSwatch ? ` — ${maBindingSwatch}` : ""}
              </div>
            </>
          )}

          {/* Parent Albums summary */}
          <Row label={`Parent Albums (${PARENT_ALBUMS[parentType].label} × ${Number(parentQty) || 0})`} value={`$${parentAlbumsPrice}`} />
          {Number(parentQty) > 0 && (
            <>
              {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode) && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Parent Cover: {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label}
                  {parentCoverSwatch ? ` — ${parentCoverSwatch}` : ""}
                </div>
              )}
              {parentCoverMode === "photo" && (
                <>
                  <div style={{ fontSize: 14, color: "#444" }}>
                    Parent Cover: Photo — Substrate: {parentPhotoSubstrate}
                    {parentEnteredPhotoNums.length > 0 && <> — Images: {parentEnteredPhotoNums.join(", ")}</>}
                  </div>
                  <Row
                    label={`Parent Photo Cover upcharge`}
                    value={`+$${PARENT_PHOTO_COVER_PRICE} × ${Number(parentQty) || 0} = $${parentPhotoCoverUpcharge}`}
                  />
                </>
              )}
            </>
          )}

          {/* Upgrades summary */}
          {albumType === "signature" && (
            <Row label={`Page Thickness: ${PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness)?.label.replace(/ \\(\\+\\$TBD\\)/, "")}`} value={pageThicknessPrice > 0 ? `+$${pageThicknessPrice}` : "$0"} />
          )}
          {addGilding && <Row label="Gilding" value={`+$${gildingUpcharge}`} />}

          <Row label="Subtotal" value={`$${subtotal}`} strong />
          <Row label="Discount" value={`−$${discount}`} />
          <Row label="Total" value={`$${total}`} strong big />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{ ...primaryBtn, opacity: canCheckout ? 1 : 0.6, pointerEvents: canCheckout ? "auto" : "none" }}
            onClick={() => alert("Next: we’ll connect Stripe Checkout and email notifications.")}
            title={canCheckout ? "Continue to Checkout (coming next)" : "Please complete the cover selections first"}
          >
            Continue to Checkout (coming next)
          </button>
          <button
            style={ghostBtn}
            onClick={() => {
              const payload = {
                albumType,
                albumSizeKey,
                cover:
                  baseCategory
                    ? { mode: coverMode, category: baseCategory.label, swatch: coverSwatch }
                    : coverMode === "photo"
                    ? { mode: "photo", price: PHOTO_COVER_PRICE, substrate: photoSubstrate, images: enteredPhotoNums }
                    : { mode: "metalacrylic", price: METAL_ACRYLIC_PRICE, type: maType, finish: maFinish, bindingCategory: maBindingCategory, bindingSwatch: maBindingSwatch },
                parent: {
                  type: parentType,
                  qty: Number(parentQty) || 0,
                  cover:
                    ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)
                      ? { mode: parentCoverMode, category: ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label, swatch: parentCoverSwatch }
                      : { mode: "photo", substrate: parentPhotoSubstrate, images: parentEnteredPhotoNums, priceEach: PARENT_PHOTO_COVER_PRICE, totalUpcharge: parentPhotoCoverUpcharge },
                },
                upgrades: {
                  gilding: addGilding ? { price: gildingUpcharge } : null,
                  pageThickness: albumType === "signature" ? { key: pageThickness, price: pageThicknessPrice } : null,
                },
                subtotal,
                discount,
                total,
                version: VERSION,
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
};
