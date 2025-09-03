// NOTE: Full updated AlbumDemo.jsx (restored full flow + Imprinting + gilding image)
// Uses public images at /assets/* (placed in /public/assets)

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ImprintingConfigurator from "./ImprintingConfigurator";

/* -----------------------------
   VERSION (for cache sanity)
------------------------------ */
const VERSION = "build-ma-design-4";

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
   ENGRAVING (from your PDF)
------------------------------ */
const ENGRAVING_LIMITS = {
  deboss: { maxChars: 25, maxLines: 2 },
  foil:   { maxChars: 28, maxLines: 2 },
};

// Fonts
const DEBOSS_FONTS = [
  "Baskerville",
  "Coco Gothic",
  "Dessau Pro",
  "Eye Catching",
  "Garage Gothic",
];
const FOIL_FONTS = [
  "Alana Pro",
  "Garage Gothic",
];

// Colors
const DEBOSS_COLORS_ALL = [
  "Blind (no color)",
  "Black",
  "Copper",
  "Gold",
  "Matte Gold",
  "Granite",
  "Silver",
  "Matte Silver",
  "White",
];
const FOIL_COLORS = [
  "Black",
  "Copper",
  "Gold",
  "Matte Gold",
  "Granite",
  "Silver",
  "Matte Silver",
  "White",
];

// Material rule helpers
function isDistressed(label) { return /Distressed/i.test(label || ""); }
function isLinen(label) { return /Linen/i.test(label || ""); }
function isStandard(label) { return /Standard Leather/i.test(label || ""); }
function isVegan(label) { return /Vegan Leather/i.test(label || ""); }

/* Special chars rule for Foil: allow A–Z a–z 0–9 spaces and basic punctuation (.,-'&) */
function sanitizeFoilText(s) {
  return s.replace(/[^A-Za-z0-9\s\.\-,'&]/g, "");
}

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

/* Try to show a small preview image if present in /public/assets/... */
function PreviewImg({ src, alt }) {
  if (!src) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <img
        src={src}
        alt={alt}
        style={{ width: 160, height: "auto", borderRadius: 8, border: "1px solid #e5e7eb" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
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

  // NEW: Metal/Acrylic image-based design fields
  const [maImageNums, setMaImageNums] = useState(["", "", "", ""]);
  const maEnteredImageNums = maImageNums.map(s => s.trim()).filter(Boolean);
  const [maText1, setMaText1] = useState("");
  const [maText2, setMaText2] = useState("");

  /* --- Engraving --- */
  const [engravingEnabled, setEngravingEnabled] = useState(false);
  const [engravingMethod, setEngravingMethod] = useState("foil"); // "foil" | "deboss"
  const [engravingFont, setEngravingFont] = useState(FOIL_FONTS[0]);
  const [engravingColor, setEngravingColor] = useState(FOIL_COLORS[0]);
  const [engravingLine1, setEngravingLine1] = useState("");
  const [engravingLine2, setEngravingLine2] = useState("");
  const [engravingPlacement, setEngravingPlacement] = useState("front-lower-center");

  /* NEW: Imprinting (separate UI section) */
  const [imprinting, setImprinting] = useState();

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
    setMaImageNums(["", "", "", ""]);
    setMaText1("");
    setMaText2("");

    // reset engraving
    setEngravingEnabled(false);
    setEngravingMethod("foil");
    setEngravingFont(FOIL_FONTS[0]);
    setEngravingColor(FOIL_COLORS[0]);
    setEngravingLine1("");
    setEngravingLine2("");
    setEngravingPlacement("front-lower-center");

    // reset imprinting
    setImprinting(undefined);

    // reset other
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

  // Engraving price (included = $0)
  const engravingPrice = 0;

  // Gilding upcharge (flat $75)
  const GILDING_UPCHARGE = addGilding ? GILDING_PRICE : 0;

  // Page thickness price (currently 0s as placeholders)
  const pageThicknessPrice = useMemo(() => {
    const opt = PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness);
    return opt?.price || 0;
  }, [pageThickness]);

  const upgradesPrice =
    (coverMode === "photo" ? PHOTO_COVER_PRICE : 0) +
    (coverMode === "metalacrylic" && COVER_SET[albumType].allowMetalAcrylic ? METAL_ACRYLIC_PRICE : 0) +
    parentPhotoCoverUpcharge +
    (engravingEnabled ? engravingPrice : 0) +
    GILDING_UPCHARGE +
    pageThicknessPrice;

  const subtotal = baseAlbumPrice + parentAlbumsPrice + upgradesPrice;
  const discount = couponCode.trim().toUpperCase() === "PREPAID400" ? Math.min(400, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  /* current cover set for main album */
  const currentSet = COVER_SET[albumType];
  const baseCategory = currentSet.baseCategories.find(c => c.key === coverMode);
  const baseCategoryLabel = baseCategory?.label;

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

  /* Engraving availability rules */
  const isCoverPhotoOrMA = coverMode === "photo" || coverMode === "metalacrylic";
  const foilAllowedOnThisMaterial =
    !!baseCategoryLabel && (isStandard(baseCategoryLabel) || isVegan(baseCategoryLabel));
  const debossAllowedOnThisMaterial =
    !!baseCategoryLabel && (isStandard(baseCategoryLabel) || isVegan(baseCategoryLabel) || isLinen(baseCategoryLabel) || isDistressed(baseCategoryLabel));

  // Distressed + Debossing ⇒ Blind only
  const debossColorsForMaterial = isDistressed(baseCategoryLabel)
    ? ["Blind (no color)"]
    : DEBOSS_COLORS_ALL;

  // Engraving validity (disabled for Photo and Metal/Acrylic)
  const engravingIsValid =
    !engravingEnabled ||
    (!isCoverPhotoOrMA &&
      ((engravingMethod === "foil" && foilAllowedOnThisMaterial) ||
       (engravingMethod === "deboss" && debossAllowedOnThisMaterial)));

  /* Combine for overall checkout enablement */
  const canCheckout = mainCoverIsComplete && parentCoverIsComplete && engravingIsValid;

  /* engraving dynamic lists */
  const engravingFonts = engravingMethod === "foil" ? FOIL_FONTS : DEBOSS_FONTS;
  const engravingColorsList = engravingMethod === "foil" ? FOIL_COLORS : debossColorsForMaterial;

  /* character limits */
  const limits = ENGRAVING_LIMITS[engravingMethod];
  const line1Count = engravingLine1.length;
  const line2Count = engravingLine2.length;

  /* sanitize Foil lines (no special characters) */
  function onChangeEngravingLine(which, val) {
    let v = val;
    if (engravingMethod === "foil") v = sanitizeFoilText(v);
    v = v.slice(0, limits.maxChars);
    if (which === 1) setEngravingLine1(v);
    else setEngravingLine2(v);
  }

  /* placements */
  const FOIL_PLACEMENTS = [
    { key: "front-lower-center", label: "Front — Lower Center" },
    { key: "front-lower-right",  label: "Front — Lower Right" },
    { key: "inside-back-lower-center", label: "Inside Back — Lower Center" },
  ];
  const DEBOSS_PLACEMENTS = [
    { key: "front-center", label: "Front — Center" },
  ];
  const placementOptions = engravingMethod === "foil" ? FOIL_PLACEMENTS : DEBOSS_PLACEMENTS;

  /* preview helpers */
  const fontPreviewSrc =
    engravingEnabled && !isCoverPhotoOrMA
      ? `/assets/fonts/${(engravingFont || "").replaceAll("/", "-")}.png`
      : null;
  // Updated gilding preview to your uploaded file:
  const gildingPreviewSrc = `/assets/gilding.png`;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Album Configurator Demo</h1>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Version: {VERSION}</div>

      {/* Intro */}
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
          {currentSet.baseCategories.map(cat => (
            <Tab key={cat.key} active={coverMode === cat.key} onClick={() => { setCoverMode(cat.key); setCoverSwatch(null); }}>
              {cat.label}
            </Tab>
          ))}

          {currentSet.allowPhoto && (
            <Tab active={coverMode === "photo"} onClick={() => setCoverMode("photo")}>
              Photo ( +${PHOTO_COVER_PRICE} )
            </Tab>
          )}

          {currentSet.allowMetalAcrylic && (
            <Tab active={coverMode === "metalacrylic"} onClick={() => setCoverMode("metalacrylic")}>
              Metal/Acrylic ( +${METAL_ACRYLIC_PRICE} )
            </Tab>
          )}
        </div>

        {/* Base material swatches */}
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

        {/* Photo Cover */}
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

        {/* Metal/Acrylic (Signature only) */}
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

            {/* NEW: image-based design for Metal/Acrylic */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Cover Design (image-based)</div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
                Provide up to 4 images + two lines of text. We’ll design the typography inside your image and send a proof before print.
              </div>

              {/* images */}
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 8 }}>
                {maImageNums.map((val, idx) => (
                  <div key={idx} style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                    <input
                      value={val}
                      onChange={e => {
                        const next = [...maImageNums];
                        next[idx] = e.target.value;
                        setMaImageNums(next);
                      }}
                      placeholder="e.g., IMG_5678"
                      style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                    />
                  </div>
                ))}
              </div>

              {/* text lines for your design */}
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <div>
                  <label style={{ fontSize: 12, color: "#555" }}>Design Text — Line 1</label>
                  <input
                    value={maText1}
                    onChange={e => setMaText1(e.target.value)}
                    placeholder="e.g., Elizabeth & Michael"
                    style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#555" }}>Design Text — Line 2 (optional)</label>
                  <input
                    value={maText2}
                    onChange={e => setMaText2(e.target.value)}
                    placeholder="e.g., September 21, 2025"
                    style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Binding & Back selection */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                Binding & back material — please pick a material and color
                <span style={{ fontSize: 12, color: "#666", marginLeft: 6 }}>
                  (Metal/Acrylic cover pairs with your chosen Leather or Linen for the spine & back.)
                </span>
              </div>

              {maBindingSwatch ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
                  <small>Selected: <strong>{SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.label} — {maBindingSwatch}</strong></small>
                </motion.div>
              ) : (
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                  Please select a binding & back swatch to continue.
                </div>
              )}

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

      {/* 4) Imprinting (optional) */}
      <Section title="4) Imprinting (optional)">
        <ImprintingConfigurator
          value={imprinting}
          onChange={setImprinting}
          forceTwoLinesForDeboss={false}
          foilImg="/assets/foilstamping.png"
          debossImg="/assets/standarddebossing.png"
          debossColorsImg="/assets/standarddebossingcoloroptions.png"
        />
      </Section>

      {/* 5) Engraving (kept off for Photo & Metal/Acrylic) */}
      <Section title="5) Engraving (optional)">
        { (coverMode === "photo" || coverMode === "metalacrylic") && (
          <div style={{ fontSize: 13, color: "#b45309", marginBottom: 8 }}>
            Engraving isn’t added on {coverMode === "photo" ? "Photo" : "Metal/Acrylic"} covers.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, opacity: (coverMode === "photo" || coverMode === "metalacrylic") ? 0.5 : 1 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: (coverMode === "photo" || coverMode === "metalacrylic") ? "not-allowed" : "pointer" }}>
            <input
              type="checkbox"
              checked={engravingEnabled && !(coverMode === "photo" || coverMode === "metalacrylic")}
              disabled={coverMode === "photo" || coverMode === "metalacrylic"}
              onChange={(e) => setEngravingEnabled(e.target.checked)}
            />
            <span>Add Engraving</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>(included)</span>
          </label>
        </div>

        {engravingEnabled && !(coverMode === "photo" || coverMode === "metalacrylic") && (
          <div style={{ display: "grid", gap: 12 }}>
            {/* Method */}
            <div>
              <label style={{ fontSize: 13, marginRight: 8 }}>Method:</label>
              <select
                value={engravingMethod}
                onChange={(e) => {
                  const method = e.target.value;
                  setEngravingMethod(method);
                  setEngravingFont(method === "foil" ? FOIL_FONTS[0] : DEBOSS_FONTS[0]);
                  setEngravingColor(method === "foil" ? FOIL_COLORS[0] : (isDistressed(baseCategoryLabel) ? "Blind (no color)" : DEBOSS_COLORS_ALL[0]));
                  setEngravingPlacement(method === "foil" ? "front-lower-center" : "front-center");
                }}
              >
                <option value="foil" disabled={!(isStandard(baseCategoryLabel) || isVegan(baseCategoryLabel))}>Foil Stamping</option>
                <option value="deboss" disabled={! (isStandard(baseCategoryLabel) || isVegan(baseCategoryLabel) || isLinen(baseCategoryLabel) || isDistressed(baseCategoryLabel))}>Standard Debossing</option>
              </select>
              {engravingMethod === "foil" && !(isStandard(baseCategoryLabel) || isVegan(baseCategoryLabel)) && (
                <div style={{ fontSize: 12, color: "#b45309", marginTop: 4 }}>
                  Foil Stamping is only available on Standard Leather or Vegan Leather.
                </div>
              )}
            </div>

            {/* Font */}
            <div>
              <label style={{ fontSize: 13, marginRight: 8 }}>Font:</label>
              <select value={engravingFont} onChange={(e) => setEngravingFont(e.target.value)}>
                {(engravingMethod === "foil" ? FOIL_FONTS : DEBOSS_FONTS).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <PreviewImg src={fontPreviewSrc} alt={`Preview of ${engravingFont}`} />
            </div>

            {/* Color */}
            <div>
              <label style={{ fontSize: 13, marginRight: 8 }}>Color:</label>
              <select
                value={engravingColor}
                onChange={(e) => setEngravingColor(e.target.value)}
              >
                {(engravingMethod === "foil" ? FOIL_COLORS : (isDistressed(baseCategoryLabel) ? ["Blind (no color)"] : DEBOSS_COLORS_ALL)).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {engravingMethod === "deboss" && isDistressed(baseCategoryLabel) && (
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  Distressed Leather supports <strong>Blind (no color)</strong> debossing only.
                </div>
              )}
            </div>

            {/* Placement */}
            <div>
              <label style={{ fontSize: 13, marginRight: 8 }}>Placement:</label>
              <select
                value={engravingPlacement}
                onChange={(e) => setEngravingPlacement(e.target.value)}
              >
                {(engravingMethod === "foil" ? [
                  { key: "front-lower-center", label: "Front — Lower Center" },
                  { key: "front-lower-right",  label: "Front — Lower Right" },
                  { key: "inside-back-lower-center", label: "Inside Back — Lower Center" },
                ] : [
                  { key: "front-center", label: "Front — Center" },
                ]).map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>

            {/* Lines */}
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <div>
                <label style={{ fontSize: 12, color: "#555" }}>Line 1</label>
                <input
                  value={engravingLine1}
                  onChange={(e) => onChangeEngravingLine(1, e.target.value)}
                  placeholder="e.g., Elizabeth & Michael"
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }}
                />
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  {line1Count}/{(engravingMethod === "foil" ? ENGRAVING_LIMITS.foil.maxChars : ENGRAVING_LIMITS.deboss.maxChars)} characters{engravingMethod === "foil" ? " • letters/numbers only" : ""}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#555" }}>Line 2 (optional)</label>
                <input
                  value={engravingLine2}
                  onChange={(e) => onChangeEngravingLine(2, e.target.value)}
                  placeholder="e.g., September 21, 2025"
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }}
                />
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  {line2Count}/{(engravingMethod === "foil" ? ENGRAVING_LIMITS.foil.maxChars : ENGRAVING_LIMITS.deboss.maxChars)} characters{engravingMethod === "foil" ? " • letters/numbers only" : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* 6) Parent Albums */}
      <Section title="6) Parent Albums (optional)">
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

      {/* 7) Upgrades */}
      <Section title="7) Upgrades">
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
          {/* Show your gilding image (no color selector; colors are in the image) */}
          <PreviewImg src={gildingPreviewSrc} alt="Gilding example" />
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Applies up to 15 spreads / 30 pages.
          </div>
        </div>
      </Section>

      {/* 8) Coupon (demo) */}
      <Section title="8) Coupon (demo)">
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
              { (maEnteredImageNums.length > 0 || maText1 || maText2) && (
                <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
                  Design: { [maText1, maText2].filter(Boolean).join(" / ") }
                  { maEnteredImageNums.length > 0 && <> — Images: {maEnteredImageNums.join(", ")}</> }
                </div>
              )}
            </>
          )}

          {/* Imprinting summary */}
          {imprinting && (
            <>
              <Row label={`Imprinting: ${imprinting.method}`} value={"$0"} />
              {imprinting.method === 'Foil Stamping' && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Font: {imprinting.foil?.font} — Color: {imprinting.foil?.color} — Position: {imprinting.foil?.position}
                  {imprinting.foil?.lines?.filter(Boolean).length > 0 && (<div>Text: {imprinting.foil.lines.filter(Boolean).join(" / ")}</div>)}
                </div>
              )}
              {imprinting.method === 'Standard Debossing' && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Font: {imprinting.deboss?.font} — Color: {imprinting.deboss?.color} — Position: Front — Center
                  {imprinting.deboss?.lines?.filter(Boolean).length > 0 && (<div>Text: {imprinting.deboss.lines.filter(Boolean).join(" / ")}</div>)}
                </div>
              )}
            </>
          )}

          {/* Engraving summary (not shown for photo/MA) */}
          {engravingEnabled && !(coverMode === "photo" || coverMode === "metalacrylic") && (
            <>
              <Row label={`Engraving: ${engravingMethod === "foil" ? "Foil Stamping" : "Standard Debossing"}`} value={"$0"} />
              <div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>
                Font: {engravingFont} — Color: {engravingColor} — Placement: { (engravingMethod === "foil"
                  ? { "front-lower-center":"Front — Lower Center", "front-lower-right":"Front — Lower Right", "inside-back-lower-center":"Inside Back — Lower Center" }[engravingPlacement]
                  : "Front — Center") }
              </div>
              {(engravingLine1 || engravingLine2) && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Text: {[engravingLine1, engravingLine2].filter(Boolean).join(" / ")}
                </div>
              )}
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
            <Row label={`Page Thickness: ${PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness)?.label.replace(/ \(\+\$TBD\)/, "")}`} value={pageThicknessPrice > 0 ? `+$${pageThicknessPrice}` : "$0"} />
          )}
          {addGilding && <Row label="Gilding" value={`+$${GILDING_UPCHARGE}`} />}

          <Row label="Subtotal" value={`$${subtotal}`} strong />
          <Row label="Discount" value={`−$${discount}`} />
          <Row label="Total" value={`$${total}`} strong big />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{ ...primaryBtn, opacity: canCheckout ? 1 : 0.6, pointerEvents: canCheckout ? "auto" : "none" }}
            onClick={() => alert("Next: we’ll connect Stripe Checkout and email notifications.")}
            title={canCheckout ? "Continue to Checkout (coming next)" : "Please complete the selections first"}
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
                    : { mode: "metalacrylic", price: METAL_ACRYLIC_PRICE, type: maType, finish: maFinish, bindingCategory: maBindingCategory, bindingSwatch: maBindingSwatch, images: maEnteredImageNums, text1: maText1, text2: maText2 },
                engraving: (engravingEnabled && !(coverMode === "photo" || coverMode === "metalacrylic")) ? {
                  method: engravingMethod,
                  font: engravingFont,
                  color: engravingColor,
                  placement: engravingPlacement,
                  line1: engravingLine1,
                  line2: engravingLine2,
                  price: 0,
                } : null,
                imprinting, // add imprinting block
                parent: {
                  type: parentType,
                  qty: Number(parentQty) || 0,
                  cover:
                    ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)
                      ? { mode: parentCoverMode, category: ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label, swatch: parentCoverSwatch }
                      : { mode: "photo", substrate: parentPhotoSubstrate, images: parentEnteredPhotoNums, priceEach: PARENT_PHOTO_COVER_PRICE, totalUpcharge: parentPhotoCoverUpcharge },
                },
                upgrades: {
                  gilding: addGilding ? { price: GILDING_UPCHARGE } : null,
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
