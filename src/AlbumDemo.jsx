// AlbumDemo.jsx (build-ma-design-3)
// Updated to use images directly from /public/assets/ so you don’t need imports.

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ImprintingConfigurator from "./ImprintingConfigurator";

/* -----------------------------
   VERSION (for cache sanity)
------------------------------ */
const VERSION = "build-ma-design-3";

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

/* Photo cover substrates */
const PHOTO_SUBSTRATES = ["Canvas", "Glossy", "Metallic", "Matte Metallic", "Satin"];
const PHOTO_COVER_PRICE = 75;
const PARENT_PHOTO_COVER_PRICE = 75;

/* Metal/Acrylic (+$200) — Signature only */
const METAL_ACRYLIC_PRICE = 200;
const METAL_ACRYLIC_TYPES = [
  { key: "metal", label: "Metal", finishes: ["Vivid Metal (high-gloss)", "Matte Metal (glare-reducing)", "Brushed Metal (textured)"] },
  { key: "acrylic", label: "Acrylic", finishes: ["Gloss Acrylic (high-gloss)", "Matte Acrylic (glare-reducing)"] },
];

/* -----------------------------
   OTHER UPGRADES
------------------------------ */
const GILDING_PRICE = 75; // flat
const PAGE_THICKNESS_OPTIONS = [
  { key: "standard", label: "Standard (included)", price: 0 },
  { key: "thick", label: "Thick (+$TBD)", price: 0 },
  { key: "xthick", label: "Extra Thick (+$TBD)", price: 0 },
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
  const [coverMode, setCoverMode] = useState("standard");
  const [coverSwatch, setCoverSwatch] = useState(null);

  /* photo fields (main) */
  const [photoSubstrate, setPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [photoImageNums, setPhotoImageNums] = useState(["", "", "", ""]);
  const enteredPhotoNums = photoImageNums.map(s => s.trim()).filter(Boolean);

  /* metal/acrylic */
  const [maType, setMaType] = useState("metal");
  const [maFinish, setMaFinish] = useState(METAL_ACRYLIC_TYPES[0].finishes[0]);
  const [maBindingCategory, setMaBindingCategory] = useState("standard");
  const [maBindingSwatch, setMaBindingSwatch] = useState(null);
  const [maImageNums, setMaImageNums] = useState(["", "", "", ""]);
  const maEnteredImageNums = maImageNums.map(s => s.trim()).filter(Boolean);
  const [maText1, setMaText1] = useState("");
  const [maText2, setMaText2] = useState("");

  /* imprinting */
  const [imprinting, setImprinting] = useState();

  /* parent albums */
  const [parentType, setParentType] = useState("small");
  const [parentQty, setParentQty] = useState(0);
  const [parentCoverMode, setParentCoverMode] = useState("modern");
  const [parentCoverSwatch, setParentCoverSwatch] = useState(null);
  const [parentPhotoSubstrate, setParentPhotoSubstrate] = useState(PHOTO_SUBSTRATES[0]);
  const [parentPhotoImageNums, setParentPhotoImageNums] = useState(["", "", "", ""]);
  const parentEnteredPhotoNums = parentPhotoImageNums.map(s => s.trim()).filter(Boolean);

  /* coupon demo */
  const [couponCode, setCouponCode] = useState("");

  /* upgrades */
  const [addGilding, setAddGilding] = useState(false);
  const [pageThickness, setPageThickness] = useState(PAGE_THICKNESS_OPTIONS[0].key);

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

  const parentPhotoCoverUpcharge = useMemo(() => {
    const qty = Number(parentQty) || 0;
    return parentCoverMode === "photo" ? qty * PARENT_PHOTO_COVER_PRICE : 0;
  }, [parentCoverMode, parentQty]);

  const GILDING_UPCHARGE = addGilding ? GILDING_PRICE : 0;
  const pageThicknessPrice = useMemo(() => {
    const opt = PAGE_THICKNESS_OPTIONS.find(o => o.key === pageThickness);
    return opt?.price || 0;
  }, [pageThickness]);

  const subtotal =
    baseAlbumPrice + parentAlbumsPrice + parentPhotoCoverUpcharge + GILDING_UPCHARGE + pageThicknessPrice;

  const discount = couponCode.trim().toUpperCase() === "PREPAID400" ? Math.min(400, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Album Configurator Demo</h1>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Version: {VERSION}</div>

      {/* Album Type, Size, Cover Material sections remain unchanged... */}

      {/* 4) Imprinting */}
      <Section title="4) Imprinting (optional)">
        <ImprintingConfigurator
          value={imprinting}
          onChange={setImprinting}
          forceTwoLinesForDeboss={coverMode === "metalacrylic"}
          foilImg="/assets/foilstamping.png"
          debossImg="/assets/standarddebossing.png"
          debossColorsImg="/assets/standarddebossingcoloroptions.png"
        />
      </Section>

      {/* 5) Parent Albums — your existing code here */}

      {/* 6) Upgrades */}
      <Section title="6) Upgrades">
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
          <div style={{ marginTop: 8 }}>
            <img
              src="/assets/gilding.png"
              alt="Gilding example"
              style={{ maxWidth: 320, borderRadius: 12, border: "1px solid #e5e7eb" }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Applies up to 15 spreads / 30 pages. Colors shown: Black, Gold, Silver.
          </div>
        </div>

        {/* Page Thickness selector remains here */}
      </Section>

      {/* Coupon + Summary sections remain unchanged... */}
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
