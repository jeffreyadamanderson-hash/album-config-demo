// ImprintingConfigurator.jsx
// Foil Stamping + Standard Debossing
// - Images are passed via props (defaults are /public/assets/*.png paths)
// - No pricing; parent controls costs
// - Deboss position is fixed to "Front — Center" (no selector)

import { useMemo, useState } from "react";

const FOIL_FONTS = ["Alana Pro", "Garage Gothic"];
const DEBOSS_FONTS = ["Baskerville", "Coco Gothic", "Dessau Pro", "Eye Catching", "Garage Gothic"];

const FOIL_COLORS = ["Black", "Copper", "Gold", "Matte Gold", "Granite", "Silver", "Matte Silver", "White"];
const DEBOSS_COLORS = ["Blind", "Black", "Copper", "Gold", "Granite", "Matte Gold", "Matte Silver", "Silver", "White"];

const FOIL_POSITIONS = [
  "Front — Lower Center",
  "Front — Lower Right",
  "Inside Back — Lower Center",
  "Inside Back — Lower Right",
];

// A–Z, 0–9, space and basic punctuation for Foil
const FOIL_SAFE_RE = /^[A-Za-z0-9 .,\-&'\/]*$/;

function Pills({ options, value, onChange, columns = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: "8px 10px",
            borderRadius: 9999,
            border: value === opt ? "2px solid #111" : "1px solid #d1d5db",
            background: value === opt ? "#111" : "#fff",
            color: value === opt ? "#fff" : "#111",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          title={opt}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, charLimit = 28, disabled, validate }) {
  function handle(e) {
    let next = e.target.value.slice(0, charLimit);
    if (validate && !validate(next)) return;
    onChange(next);
  }
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={handle}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: 8,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          width: "100%",
          background: disabled ? "#f9fafb" : "white",
        }}
      />
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
        {(value || "").length}/{charLimit}
      </div>
    </div>
  );
}

function SectionCard({ title, image, description, children }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
          {description && <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>{description}</div>}
          <div style={{ display: "grid", gap: 12 }}>{children}</div>
        </div>
        {image && (
          <div
            style={{
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
            }}
          >
            <img
              src={image}
              alt={title}
              style={{ maxHeight: 360, width: "auto", borderRadius: 12, border: "1px solid #eef2f7" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImprintingConfigurator({
  value,
  onChange,
  forceTwoLinesForDeboss = false,
  foilImg = "/assets/foilstamping.png",
  debossImg = "/assets/standarddebossing.png",
  debossColorsImg = "/assets/standarddebossingcoloroptions.png",
}) {
  const seed = useMemo(
    () => ({
      method: "Foil Stamping",
      foil: { font: FOIL_FONTS[0], color: FOIL_COLORS[2], position: FOIL_POSITIONS[0], lines: ["", "", ""] },
      deboss: { font: DEBOSS_FONTS[0], color: DEBOSS_COLORS[0], lines: ["", "", ""] },
      ...(value || {}),
    }),
    [value]
  );
  const [activeTab, setActiveTab] = useState(seed.method || "Foil Stamping");
  const update = (patch) => onChange?.({ ...seed, ...patch });

  // Foil handlers
  const foil = seed.foil || { font: FOIL_FONTS[0], color: FOIL_COLORS[2], position: FOIL_POSITIONS[0], lines: ["", "", ""] };
  const onFoilLine = (i, next) => {
    const lines = [...(foil.lines || ["", "", ""])];
    const safe = next.slice(0, 28);
    if (!FOIL_SAFE_RE.test(safe)) return;
    lines[i] = safe;
    update({ foil: { ...foil, lines } });
  };

  // Deboss handlers (fixed position: Front — Center)
  const deboss = seed.deboss || { font: DEBOSS_FONTS[0], color: DEBOSS_COLORS[0], lines: ["", "", ""] };
  const maxDebossLines = forceTwoLinesForDeboss ? 2 : 3;
  const onDebossLine = (i, next) => {
    const lines = [...(deboss.lines || ["", "", ""])];
    lines[i] = next.slice(0, 28);
    update({ deboss: { ...deboss, lines } });
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {["Foil Stamping", "Standard Debossing"].map((label) => (
          <button
            key={label}
            onClick={() => {
              setActiveTab(label);
              update({ method: label });
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 9999,
              border: activeTab === label ? "2px solid #111" : "1px solid #d1d5db",
              background: activeTab === label ? "#111" : "#fff",
              color: activeTab === label ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Foil Stamping */}
      {activeTab === "Foil Stamping" && (
        <SectionCard
          title="Foil Stamping"
          image={foilImg}
          description={
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Fonts: Alana Pro, Garage Gothic · Up to 3 lines · 28 chars/line · A–Z, 0–9, basic punctuation
            </span>
          }
        >
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Font</div>
            <Pills options={FOIL_FONTS} value={foil.font} onChange={(font) => update({ foil: { ...foil, font } })} columns={2} />
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Foil Color</div>
            <Pills options={FOIL_COLORS} value={foil.color} onChange={(color) => update({ foil: { ...foil, color } })} columns={3} />
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Position</div>
            <Pills
              options={FOIL_POSITIONS}
              value={foil.position}
              onChange={(position) => update({ foil: { ...foil, position } })}
              columns={2}
            />
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Stamping Text</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <LabeledInput
                  key={i}
                  label={`Line ${i + 1}`}
                  value={foil.lines?.[i] || ""}
                  onChange={(v) => onFoilLine(i, v)}
                  placeholder={i === 0 ? "e.g., Elizabeth & Michael" : "Optional"}
                  charLimit={28}
                  validate={(v) => FOIL_SAFE_RE.test(v)}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Standard Debossing */}
      {activeTab === "Standard Debossing" && (
        <SectionCard
          title="Standard Debossing"
          image={debossImg}
          description={
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Fonts: Baskerville, Coco Gothic, Dessau Pro, Eye Catching, Garage Gothic · Up to {maxDebossLines}–3 lines<br />
              <strong>Position: Front — Center only</strong>
            </span>
          }
        >
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Font</div>
            <Pills options={DEBOSS_FONTS} value={deboss.font} onChange={(font) => update({ deboss: { ...deboss, font } })} columns={3} />
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Deboss Color</div>
            <Pills options={DEBOSS_COLORS} value={deboss.color} onChange={(color) => update({ deboss: { ...deboss, color } })} columns={3} />
            <div style={{ marginTop: 8 }}>
              <img
                src={debossColorsImg}
                alt="Deboss color options"
                style={{ width: "100%", borderRadius: 12, border: "1px solid #eef2f7" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>Deboss Text</div>
            <div style={{ display: "grid", gap: 8 }}>
              {Array.from({ length: maxDebossLines }).map((_, i) => (
                <LabeledInput
                  key={i}
                  label={`Line ${i + 1}`}
                  value={deboss.lines?.[i] || ""}
                  onChange={(v) => onDebossLine(i, v)}
                  placeholder={i === 0 ? "e.g., The Andersons" : "Optional"}
                  charLimit={28}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
