// AlbumDemo (merged v2)
// Images: place these in /public/assets (Vite/CRA) so the <img src> paths below work without imports.
//   /assets/foilstamping.png
//   /assets/standarddebossing.png
//   /assets/standarddebossingcoloroptions.png
//   /assets/gilding.png

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

/* -----------------------------
   VERSION
------------------------------ */
const VERSION = "build-ma-design-1 + imprinting-v2";

/* -----------------------------
   PRODUCTS & PRICING (unchanged)
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

const PARENT_ALBUMS = {
  small: { label: "8×8 or 6×9", each: 325, twoFor: 600 },
  large: { label: "10×10 or 8×11", each: 400, twoFor: 750 },
};

/* -----------------------------
   COVER SETS (by album type)
------------------------------ */
const SIGNATURE_BASE_CATEGORIES = [
  { key: "standard",   label: "Standard Leather", options: ["Ash","Black Olive","Blush","Buttercream","Cardinal","Flamingo","Lavender","Maroon","Mist","Monsoon","Mystique","Nightfall","Northern Lights","Peppercorn","Pink Coral","Pink Quartz","Polar","Powder Blue","Saddle","Seafoam","Soft Gray","Walnut"] },
  { key: "distressed", label: "Distressed Leather", options: ["Cream","Ore","Pebble","Sierra"] },
  { key: "vegan",      label: "Vegan Leather", options: ["Coyote","Shadow","Spritz","Storm","Sunset","Wave"] },
  { key: "linen",      label: "Linen", options: ["Ebony","Fog (Shimmer)","Oyster (shimmer)","Plum","Sage","Sand","Silver","Sky","Tundra","Tusk"] },
];

const ARTISAN_BASE_CATEGORIES = [
  { key: "modern",  label: "Modern Genuine Leather",  options: ["Black","Dark Brown","Espresso","Navy Blue","Charcoal","Blue Grey","Distressed Navy Blue","Distressed Dark Green","Distressed Cinnamon","Distressed Caramel","Ivory","White"] },
  { key: "classic", label: "Classic Genuine Leather", options: ["Black","Navy Blue","Dark Brown","Blue Grey","White","Beige"] },
  { key: "leatherette", label: "Leatherette", options: ["Black","Navy Blue","Dark Hunter Green","Mahogany Brown","Denim Blue","Royal Blue","Red","Cinnamon","Cedar Brown","Grey","Pastel Mint","Cloud Blue","Burgundy","Eggshell","Blush Pink","Ivory","White","Walnut","Cherry Wood","Oak","Birch"] },
  { key: "linen",   label: "Linen", options: ["Burgundy","Midnight Blue","Black","Dark Chocolate","Forest Green","Dark Hunter Green","Coffee","Steel Blue","Tortilla Brown","Concrete Grey","Petal Pink","Buttermilk","Teal","Stone Blue","Walnut","Dove Grey","Wheat","Sand","Green Tea","Oatmeal","Cream","Navy Blue","Slate Grey","Maroon","Pink Rose","Light Blue"] },
];

const PHOTO_SUBSTRATES = ["Canvas","Glossy","Metallic","Matte Metallic","Satin"];
const PHOTO_COVER_PRICE = 75;
const PARENT_PHOTO_COVER_PRICE = 75;

const METAL_ACRYLIC_PRICE = 200;
const METAL_ACRYLIC_TYPES = [
  { key: "metal", label: "Metal", finishes: ["Vivid Metal (high-gloss)", "Matte Metal (glare-reducing)", "Brushed Metal (textured)"] },
  { key: "acrylic", label: "Acrylic", finishes: ["Gloss Acrylic (high-gloss)", "Matte Acrylic (glare-reducing)"] },
];

const COVER_SET = {
  signature: { baseCategories: SIGNATURE_BASE_CATEGORIES, allowPhoto: true, allowMetalAcrylic: true },
  artisan: { baseCategories: ARTISAN_BASE_CATEGORIES, allowPhoto: true, allowMetalAcrylic: false },
};

/* -----------------------------
   UPGRADES / MISC PRICES
------------------------------ */
const GILDING_PRICE = 75; // flat up to 15 spreads / 30 pages
const PAGE_THICKNESS_OPTIONS = [
  { key: "standard", label: "Standard (included)", price: 0 },
  { key: "thick",    label: "Thick (+$TBD)",       price: 0 },
  { key: "xthick",   label: "Extra Thick (+$TBD)", price: 0 },
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
function PreviewImg({ src, alt }) {
  if (!src) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <img src={src} alt={alt} style={{ width: 160, height: "auto", borderRadius: 8, border: "1px solid #e5e7eb" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
    </div>
  );
}

/* ==============================
   ImprintingConfigurator (no Gilding tab)
============================== */
const FOIL_FONTS = ["Alana Pro", "Garage Gothic"];
const DEBOSS_FONTS = ["Baskerville", "Coco Gothic", "Dessau Pro", "Eye Catching", "Garage Gothic"];
const FOIL_COLORS = ["Black","Copper","Gold","Matte Gold","Granite","Silver","Matte Silver","White"];
const DEBOSS_COLORS = ["Blind","Black","Copper","Gold","Granite","Matte Gold","Matte Silver","Silver","White"];
const FOIL_POSITIONS = [
  "Front — Lower Center",
  "Front — Lower Right",
  "Inside Back — Lower Center",
  "Inside Back — Lower Right",
];
const SAFE_TEXT_RE = /^[A-Za-z0-9 .,\-&'\/] *$/;

function RadioGrid({ options, value, onChange, columns = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 8 }}>
      {options.map((opt) => (
        <label key={opt} style={{ cursor: "pointer", border: value === opt ? "2px solid #111" : "1px solid #d1d5db", borderRadius: 12, padding: 8, textAlign: "center", fontSize: 14 }}>
          <input type="radio" name="radiogrid" checked={value === opt} onChange={() => onChange(opt)} style={{ display: "none" }} />
          {opt}
        </label>
      ))}
    </div>
  );
}
function TextLines({ value, onChange, maxLines = 3, charLimit = 28, disallowSpecial = false }) {
  const handleChange = (i, next) => {
    let v = next.slice(0, charLimit);
    if (disallowSpecial && v && !SAFE_TEXT_RE.test(v)) return;
    const nextLines = [...value];
    nextLines[i] = v;
    onChange(nextLines);
  };
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {Array.from({ length: maxLines }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 48px", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Line {i + 1}</span>
          <input type="text" value={value[i] || ""} onChange={(e) => handleChange(i, e.target.value)} placeholder="Optional" style={{ padding: 8, borderRadius: 10, border: "1px solid #d1d5db" }} />
          <span style={{ fontSize: 11, color: "#6b7280", textAlign: "right" }}>{(value[i] || "").length}/{charLimit}</span>
        </div>
      ))}
    </div>
  );
}
function SectionCard({ title, children, image, description }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
          {description && <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>{description}</div>}
          <div style={{ display: "grid", gap: 12 }}>{children}</div>
        </div>
        {image && (
          <div style={{ background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
            <img src={image} alt={title} style={{ maxHeight: 360, width: "auto", borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ImprintingConfigurator({ value, onChange, forceTwoLinesForDeboss = false }) {
  const [activeTab, setActiveTab] = useState(value?.method || "Foil Stamping");
  const state = useMemo(() => ({
    method: "Foil Stamping",
    foil: { font: FOIL_FONTS[0], color: FOIL_COLORS[2], position: FOIL_POSITIONS[0], lines: ["", "", ""] },
    deboss: { font: DEBOSS_FONTS[0], color: DEBOSS_COLORS[0], lines: ["", "", ""] },
    ...(value || {}),
  }), [value]);
  const update = (patch) => onChange?.({ ...state, ...patch });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {(["Foil Stamping", "Standard Debossing"]).map(label => (
          <button key={label} onClick={() => { setActiveTab(label); update({ method: label }); }} style={{ padding: "8px 12px", borderRadius: 9999, border: activeTab === label ? "2px solid #111" : "1px solid #d1d5db", background: activeTab === label ? "#111" : "#fff", color: activeTab === label ? "#fff" : "#111" }}>{label}</button>
        ))}
      </div>

      {activeTab === "Foil Stamping" && (
        <SectionCard title="Foil Stamping" image="/assets/foilstamping.png" description={<div><span style={{ fontSize:12, color:'#6b7280' }}>Fonts: Alana Pro, Garage Gothic · Up to 3 lines · 28 chars/line</span></div>}>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Font</div>
            <RadioGrid options={FOIL_FONTS} value={state.foil.font} onChange={(font) => update({ foil: { ...state.foil, font } })} columns={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Foil Color</div>
            <RadioGrid options={FOIL_COLORS} value={state.foil.color} onChange={(color) => update({ foil: { ...state.foil, color } })} columns={3} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Position</div>
            <RadioGrid options={FOIL_POSITIONS} value={state.foil.position} onChange={(position) => update({ foil: { ...state.foil, position } })} columns={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Stamping Text</div>
            <TextLines value={state.foil.lines} onChange={(lines) => update({ foil: { ...state.foil, lines } })} maxLines={3} charLimit={28} disallowSpecial />
          </div>
        </SectionCard>
      )}

      {activeTab === "Standard Debossing" && (
        <SectionCard title="Standard Debossing" image="/assets/standarddebossing.png" description={<div><span style={{ fontSize:12, color:'#6b7280' }}>Fonts: Baskerville, Coco Gothic, Dessau Pro, Eye Catching, Garage Gothic</span></div>}>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Font</div>
            <RadioGrid options={DEBOSS_FONTS} value={state.deboss.font} onChange={(font) => update({ deboss: { ...state.deboss, font } })} columns={3} />
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Deboss Color</div>
            <RadioGrid options={DEBOSS_COLORS} value={state.deboss.color} onChange={(color) => update({ deboss: { ...state.deboss, color } })} columns={3} />
            <div style={{ marginTop: 8 }}>
              <img src="/assets/standarddebossingcoloroptions.png" alt="Deboss color swatches" style={{ width: "100%", borderRadius: 12, border: "1px solid #f3f4f6" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Deboss Text</div>
            <TextLines value={state.deboss.lines} onChange={(lines) => update({ deboss: { ...state.deboss, lines } })} maxLines={forceTwoLinesForDeboss ? 2 : 3} charLimit={28} />
          </div>
        </SectionCard>
      )}

      {/* Debug toggle instead of always-on JSON */}
      <details style={{ marginTop: 10, background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: 12, padding: 10 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, userSelect: "none" }}>Show debug payload</summary>
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", marginTop: 8 }}>{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  );
}

/* ==============================
   MAIN APP — AlbumDemo
============================== */
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
  const [maImageNums, setMaImageNums] = useState(["", "", "", ""]);
  const maEnteredImageNums = maImageNums.map(s => s.trim()).filter(Boolean);
  const [maText1, setMaText1] = useState("");
  const [maText2, setMaText2] = useState("");

  /* NEW: imprinting (Foil/Deboss) */
  const [imprinting, setImprinting] = useState();

  /* parent albums */
  const [parentType, setParentType] = useState("small");
  const [parentQty, setParentQty] = useState(0);
  const [parentCoverMode, setParentCoverMode] = useState(ARTISAN_BASE_CATEGORIES[0].key);
  const [parentCoverSwatch, setParentCoverSwatch] = useState(null);
  const [parentPhotoSubstrate, setParentPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [parentPhotoImageNums, setParentPhotoImageNums] = useState(["", "", "", ""]);
  const parentEnteredPhotoNums = parentPhotoImageNums.map(s => s.trim()).filter(Boolean);

  /* coupon demo */
  const [couponCode, setCouponCode] = useState("");

  /* upgrades */
  const [addGilding, setAddGilding] = useState(false);
  const [gildingColor, setGildingColor] = useState("Gold");
  const [pageThickness, setPageThickness] = useState(PAGE_THICKNESS_OPTIONS[0].key); // Signature only

  /* when album type switches */
  function onChangeAlbumType(nextType) {
    setAlbumType(nextType);
    setAlbumSizeKey(ALBUMS[nextType].sizes[0].key);
    const firstKey = COVER_SET[nextType].baseCategories[0].key;
    setCoverMode(firstKey);
    setCoverSwatch(null);
    setPhotoSubstrate(PHOTO_SUBSTRATES[0]);
    setPhotoImageNums(["", "", "", ""]);
    setMaType("metal");
    setMaFinish(METAL_ACRYLIC_TYPES[0].finishes[0]);
    setMaBindingCategory("standard");
    setMaBindingSwatch(null);
    setMaImageNums(["", "", "", ""]);
    setMaText1("");
    setMaText2("");
    setImprinting(undefined);
    setPageThickness(PAGE_THICKNESS_OPTIONS[0].key);
    setAddGilding(false);
    setGildingColor("Gold");
  }

  /* pricing */
  const baseAlbumPrice = useMemo(() => {
    const album = ALBUMS[albumType];
    const size = album.sizes.find(s => s.key === albumSizeKey);
    return size ? size.price : 0;
  }, [albumType, albumSizeKey]);

  const parentAlbumsPrice = useMemo(() => priceParentAlbums(parentType, Number(parentQty) || 0), [parentType, parentQty]);

  const parentPhotoCoverUpcharge = useMemo(() => {
    const qty = Number(parentQty) || 0;
    return parentCoverMode === "photo" ? qty * PARENT_PHOTO_COVER_PRICE : 0;
  }, [parentCoverMode, parentQty]);

  const GILDING_UPCHARGE = addGilding ? GILDING_PRICE : 0;

  const pageThicknessPrice = useMemo(() => {
    const opt = PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness);
    return opt?.price || 0;
  }, [pageThickness]);

  const upgradesPrice =
    (coverMode === "photo" ? PHOTO_COVER_PRICE : 0) +
    (coverMode === "metalacrylic" && COVER_SET[albumType].allowMetalAcrylic ? METAL_ACRYLIC_PRICE : 0) +
    parentPhotoCoverUpcharge +
    GILDING_UPCHARGE +
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
    (parentCoverMode === "photo");

  const canCheckout = mainCoverIsComplete && parentCoverIsComplete;

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
            <OptionButton key={key} selected={albumType === key} onClick={() => onChangeAlbumType(key)} label={album.label} />
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
        <div style={{ marginBottom: 6, color: "#666", fontSize: 13 }}>Choose one cover option.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {currentSet.baseCategories.map(cat => (
            <Tab key={cat.key} active={coverMode === cat.key} onClick={() => { setCoverMode(cat.key); setCoverSwatch(null); }}>{cat.label}</Tab>
          ))}
          {currentSet.allowPhoto && (<Tab active={coverMode === "photo"} onClick={() => setCoverMode("photo")}>Photo ( +${PHOTO_COVER_PRICE} )</Tab>)}
          {currentSet.allowMetalAcrylic && (<Tab active={coverMode === "metalacrylic"} onClick={() => setCoverMode("metalacrylic")}>Metal/Acrylic ( +${METAL_ACRYLIC_PRICE} )</Tab>)}
        </div>
        {baseCategory && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {baseCategory.options.map(name => (
                <div key={name} onClick={() => setCoverSwatch(name)} style={{ cursor: "pointer", border: coverSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db", borderRadius: 12, overflow: "hidden", background: "white" }}>
                  <div style={{ height: 70, background: "#f3f4f6" }} />
                  <div style={{ padding: 10, textAlign: "center", fontSize: 14 }}>{name}</div>
                </div>
              ))}
            </div>
            {coverSwatch && (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}><small>Selected: <strong>{baseCategory.label} — {coverSwatch}</strong></small></motion.div>)}
          </>
        )}
        {coverMode === "photo" && currentSet.allowPhoto && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Photo substrate:</label>
              <select value={photoSubstrate} onChange={e => setPhotoSubstrate(e.target.value)}>{PHOTO_SUBSTRATES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
              <span style={{ marginLeft: 10, color: "#444" }}>+${PHOTO_COVER_PRICE}</span>
            </div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {photoImageNums.map((val, idx) => (
                <div key={idx} style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                  <input value={val} onChange={e => { const next = [...photoImageNums]; next[idx] = e.target.value; setPhotoImageNums(next); }} placeholder="e.g., IMG_1234" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
                </div>
              ))}
            </div>
            <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>Select up to 4 images. We’ll choose what works best within the margins, but you’ll get approval before sending to print.</p>
          </div>
        )}
        {coverMode === "metalacrylic" && currentSet.allowMetalAcrylic && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Type:</label>
              <select value={maType} onChange={e => { const nextType = e.target.value; setMaType(nextType); const defFinish = METAL_ACRYLIC_TYPES.find(t => t.key === nextType)?.finishes[0] || ""; setMaFinish(defFinish); }}>{METAL_ACRYLIC_TYPES.map(t => (<option key={t.key} value={t.key}>{t.label}</option>))}</select>
              <span style={{ marginLeft: 10, color: "#444" }}>+${METAL_ACRYLIC_PRICE}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, marginRight: 8 }}>Finish:</label>
              <select value={maFinish} onChange={e => setMaFinish(e.target.value)}>{METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.finishes.map(f => (<option key={f} value={f}>{f}</option>))}</select>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Cover Design (image-based)</div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>Provide up to 4 images + two lines of text. We’ll design the typography inside your image and send a proof before print.</div>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 8 }}>
                {maImageNums.map((val, idx) => (
                  <div key={idx} style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                    <input value={val} onChange={e => { const next = [...maImageNums]; next[idx] = e.target.value; setMaImageNums(next); }} placeholder="e.g., IMG_5678" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <div>
                  <label style={{ fontSize: 12, color: "#555" }}>Design Text — Line 1</label>
                  <input value={maText1} onChange={e => setMaText1(e.target.value)} placeholder="e.g., Elizabeth & Michael" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#555" }}>Design Text — Line 2 (optional)</label>
                  <input value={maText2} onChange={e => setMaText2(e.target.value)} placeholder="e.g., September 21, 2025" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>Binding & back material — please pick a material and color</div>
              {maBindingSwatch ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}><small>Selected: <strong>{SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.label} — {maBindingSwatch}</strong></small></motion.div>
              ) : (
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Please select a binding & back swatch to continue.</div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {SIGNATURE_BASE_CATEGORIES.filter(c => c.key !== "vegan").map(cat => (
                  <Tab key={cat.key} active={maBindingCategory === cat.key} onClick={() => { setMaBindingCategory(cat.key); setMaBindingSwatch(null); }}>{cat.label}</Tab>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.options.map(name => (
                  <div key={name} onClick={() => setMaBindingSwatch(name)} style={{ cursor: "pointer", border: maBindingSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db", borderRadius: 12, overflow: "hidden", background: "white" }}>
                    <div style={{ height: 70, background: "#f3f4f6" }} />
                    <div style={{ padding: 10, textAlign: "center", fontSize: 14 }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* 4) Imprinting */}
      <Section title="4) Imprinting (Foil · Deboss)">
        <ImprintingConfigurator value={imprinting} onChange={setImprinting} forceTwoLinesForDeboss={false} />
      </Section>

      {/* 5) Parent Albums */}
      <Section title="5) Parent Albums (optional)">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label>Type:&nbsp;
            <select value={parentType} onChange={e => setParentType(e.target.value)}>
              {Object.entries(PARENT_ALBUMS).map(([key, tier]) => (<option key={key} value={key}>{tier.label} — ${tier.each} ea or 2 for ${tier.twoFor}</option>))}
            </select>
          </label>
          <label>Quantity:&nbsp;<input type="number" min={0} step={1} value={parentQty} onChange={e => setParentQty(e.target.value)} style={{ width: 80 }} /></label>
          <span style={{ opacity: 0.8 }}>= ${parentAlbumsPrice}</span>
        </div>
        {Number(parentQty) > 0 && (
          <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Parent Album Cover — please pick a material and color (same options as Artisan)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {ARTISAN_BASE_CATEGORIES.map(cat => (<Tab key={cat.key} active={parentCoverMode === cat.key} onClick={() => { setParentCoverMode(cat.key); setParentCoverSwatch(null); }}>{cat.label}</Tab>))}
              <Tab active={parentCoverMode === "photo"} onClick={() => setParentCoverMode("photo")}>Photo ( +${PARENT_PHOTO_COVER_PRICE} each )</Tab>
            </div>
            {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode) && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.options.map(name => (
                    <div key={name} onClick={() => setParentCoverSwatch(name)} style={{ cursor: "pointer", border: parentCoverSwatch === name ? "2px solid #2563eb" : "1px solid #d1d5db", borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ height: 70, background: "#f3f4f6" }} />
                      <div style={{ padding: 10, textAlign: "center", fontSize: 14 }}>{name}</div>
                    </div>
                  ))}
                </div>
                {parentCoverSwatch && (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}><small>Selected: <strong>{ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label} — {parentCoverSwatch}</strong></small></motion.div>)}
              </>
            )}
            {parentCoverMode === "photo" && (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13, marginRight: 8 }}>Photo substrate:</label>
                  <select value={parentPhotoSubstrate} onChange={e => setParentPhotoSubstrate(e.target.value)}>{PHOTO_SUBSTRATES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                  <span style={{ marginLeft: 10, color: "#444" }}>+${PARENT_PHOTO_COVER_PRICE} each</span>
                </div>
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  {parentPhotoImageNums.map((val, idx) => (
                    <div key={idx} style={{ display: "grid", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "#555" }}>Image #{idx + 1} (optional)</label>
                      <input value={val} onChange={e => { const next = [...parentPhotoImageNums]; next[idx] = e.target.value; setParentPhotoImageNums(next); }} placeholder="e.g., IMG_1234" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>Select up to 4 images. We’ll choose what works best within the margins, but you’ll get approval before sending to print.</p>
              </div>
            )}
          </div>
        )}
        {Number(parentQty) > 0 && !parentCoverIsComplete && (<div style={{ marginTop: 8, fontSize: 12, color: "#b45309" }}>Please select a Parent Album cover (pick a swatch or choose Photo).</div>)}
      </Section>

      {/* 6) Upgrades */}
      <Section title="6) Upgrades">
        {albumType === "signature" && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Page Thickness (Signature only)</div>
            <div>
              <select value={pageThickness} onChange={(e) => setPageThickness(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #d1d5db", minWidth: 260 }}>
                {PAGE_THICKNESS_OPTIONS.map(opt => (<option key={opt.key} value={opt.key}>{opt.label}</option>))}
              </select>
              {pageThicknessPrice > 0 && (<span style={{ marginLeft: 10 }}>+${pageThicknessPrice}</span>)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>We’ll update pricing here once you finalize thickness upgrade amounts.</div>
          </div>
        )}

        {/* Gilding lives here only (with image + colors) */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={addGilding} onChange={(e) => setAddGilding(e.target.checked)} />
            <span>Add Gilding (protective decorative edge)</span>
            <span style={{ fontWeight: 600 }}>+${GILDING_PRICE}</span>
          </label>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
            <PreviewImg src="/assets/gilding.png" alt="Gilding" />
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Edge colors: Black, Gold, Silver</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Black","Gold","Silver"].map((c) => (
                  <button key={c} onClick={() => setGildingColor(c)} style={{ padding: "6px 10px", borderRadius: 9999, border: gildingColor === c ? "2px solid #111" : "1px solid #d1d5db", background: gildingColor === c ? "#111" : "#fff", color: gildingColor === c ? "#fff" : "#111" }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Not available for rounded corners, Metallic, or Classic Felt pages.</div>
        </div>
      </Section>

      {/* 7) Coupon (demo) */}
      <Section title="7) Coupon (demo)">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="Enter coupon code (try PREPAID400)" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", minWidth: 280 }} />
          {discount > 0 && <Badge>−${discount} applied</Badge>}
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <div style={{ display: "grid", gap: 6, maxWidth: 560 }}>
          <Row label={`${ALBUMS[albumType].label} — ${ALBUMS[albumType].sizes.find(s => s.key === albumSizeKey)?.label}`} value={`$${baseAlbumPrice}`} />
          {baseCategory && (<Row label={`Cover: ${baseCategory.label}${coverSwatch ? ` — ${coverSwatch}` : ""}`} value={"$0"} />)}
          {coverMode === "photo" && (<><Row label="Cover: Photo" value={`+$${PHOTO_COVER_PRICE}`} /><div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>Substrate: {photoSubstrate}{enteredPhotoNums.length > 0 && <> — Images: {enteredPhotoNums.join(", ")}</>}</div></>)}
          {coverMode === "metalacrylic" && (
            <>
              <Row label="Cover: Metal/Acrylic" value={`+$${METAL_ACRYLIC_PRICE}`} />
              <div style={{ fontSize: 14, color: "#444", marginTop: -2 }}>{METAL_ACRYLIC_TYPES.find(t => t.key === maType)?.label} — {maFinish}</div>
              <div style={{ fontSize: 14, color: "#444" }}>Binding/Back: {SIGNATURE_BASE_CATEGORIES.find(c => c.key === maBindingCategory)?.label}{maBindingSwatch ? ` — ${maBindingSwatch}` : ""}</div>
              {(maEnteredImageNums.length > 0 || maText1 || maText2) && (<div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>Design: { [maText1, maText2].filter(Boolean).join(" / ") }{ maEnteredImageNums.length > 0 && <> — Images: {maEnteredImageNums.join(", ")}</> }</div>)}
            </>
          )}

          {/* Imprinting summary */}
          {imprinting && (
            <>
              <Row label={`Imprinting: ${imprinting.method}`} value={"$0"} />
              {imprinting.method === 'Foil Stamping' && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Font: {imprinting.foil.font} — Color: {imprinting.foil.color} — Position: {imprinting.foil.position}
                  {imprinting.foil.lines.filter(Boolean).length > 0 && (<div>Text: {imprinting.foil.lines.filter(Boolean).join(" / ")}</div>)}
                </div>
              )}
              {imprinting.method === 'Standard Debossing' && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  Font: {imprinting.deboss.font} — Color: {imprinting.deboss.color}
                  {imprinting.deboss.lines.filter(Boolean).length > 0 && (<div>Text: {imprinting.deboss.lines.filter(Boolean).join(" / ")}</div>)}
                </div>
              )}
            </>
          )}

          {/* Parent Albums summary */}
          <Row label={`Parent Albums (${PARENT_ALBUMS[parentType].label} × ${Number(parentQty) || 0})`} value={`$${parentAlbumsPrice}`} />
          {Number(parentQty) > 0 && (
            <>
              {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode) && (<div style={{ fontSize: 14, color: "#444" }}>Parent Cover: {ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label}{parentCoverSwatch ? ` — ${parentCoverSwatch}` : ""}</div>)}
              {parentCoverMode === "photo" && (
                <>
                  <div style={{ fontSize: 14, color: "#444" }}>Parent Cover: Photo — Substrate: {parentPhotoSubstrate}{parentEnteredPhotoNums.length > 0 && <> — Images: {parentEnteredPhotoNums.join(", ")}</>}</div>
                  <Row label={`Parent Photo Cover upcharge`} value={`+$${PARENT_PHOTO_COVER_PRICE} × ${Number(parentQty) || 0} = $${parentPhotoCoverUpcharge}`} />
                </>
              )}
            </>
          )}

          {/* Upgrades summary */}
          {albumType === "signature" && (<Row label={`Page Thickness: ${PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness)?.label.replace(/ \(\+\$TBD\)/, "")}`} value={pageThicknessPrice > 0 ? `+$${pageThicknessPrice}` : "$0"} />)}
          {addGilding && <Row label={`Gilding${gildingColor ? ` — ${gildingColor}` : ""}`} value={`+$${GILDING_UPCHARGE}`} />}

          <Row label="Subtotal" value={`$${subtotal}`} strong />
          <Row label="Discount" value={`−$${discount}`} />
          <Row label="Total" value={`$${total}`} strong big />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={{ ...primaryBtn, opacity: canCheckout ? 1 : 0.6, pointerEvents: canCheckout ? "auto" : "none" }} onClick={() => alert("Next: we’ll connect Stripe Checkout and email notifications.")} title={canCheckout ? "Continue to Checkout (coming next)" : "Please complete the selections first"}>
            Continue to Checkout (coming next)
          </button>
          <button style={ghostBtn} onClick={() => {
            const payload = {
              albumType,
              albumSizeKey,
              cover: baseCategory
                ? { mode: coverMode, category: baseCategory.label, swatch: coverSwatch }
                : coverMode === "photo"
                ? { mode: "photo", price: PHOTO_COVER_PRICE, substrate: photoSubstrate, images: enteredPhotoNums }
                : { mode: "metalacrylic", price: METAL_ACRYLIC_PRICE, type: maType, finish: maFinish, bindingCategory: maBindingCategory, bindingSwatch: maBindingSwatch, images: maEnteredImageNums, text1: maText1, text2: maText2 },
              imprinting,
              parent: {
                type: parentType,
                qty: Number(parentQty) || 0,
                cover: ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)
                  ? { mode: parentCoverMode, category: ARTISAN_BASE_CATEGORIES.find(c => c.key === parentCoverMode)?.label, swatch: parentCoverSwatch }
                  : { mode: "photo", substrate: parentPhotoSubstrate, images: parentEnteredPhotoNums, priceEach: PARENT_PHOTO_COVER_PRICE, totalUpcharge: parentPhotoCoverUpcharge },
              },
              upgrades: {
                gilding: addGilding ? { price: GILDING_UPCHARGE, color: gildingColor } : null,
                pageThickness: albumType === "signature" ? { key: pageThickness, price: pageThicknessPrice } : null,
              },
              subtotal,
              discount,
              total,
              version: VERSION,
            };
            navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            alert("Selections copied to clipboard (we’ll send these to you automatically once checkout is connected).");
          }}>
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
    <div onClick={onClick} style={{ cursor: "pointer", border: selected ? "2px solid #2563eb" : "1px solid #d1d5db", borderRadius: 12, padding: 12, background: selected ? "#f0f7ff" : "white" }}>{children}</div>
  );
}
function OptionButton({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 12px", borderRadius: 9999, border: selected ? "2px solid #2563eb" : "1px solid #d1d5db", background: selected ? "#f0f7ff" : "white", cursor: "pointer" }}>{label}</button>
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
    <span style={{ border: "1px solid #d1d5db", borderRadius: 9999, padding: "4px 8px", fontSize: 12 }}>{children}</span>
  );
}
function Tab({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 10px", borderRadius: 9999, border: active ? "2px solid #2563eb" : "1px solid #d1d5db", background: active ? "#f0f7ff" : "white", cursor: "pointer" }}>{children}</button>
  );
}

const primaryBtn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb", background: "#2563eb", color: "white", cursor: "pointer" };
const ghostBtn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db", background: "white", color: "black" };

