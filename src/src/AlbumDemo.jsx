import { useState } from "react";
import { motion } from "framer-motion";

const leathers = [
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

export default function AlbumDemo() {
  const [selectedLeather, setSelectedLeather] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Album Customizer Demo</h1>
      <p>Step 1: Choose your cover material (Standard Leather)</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
        {leathers.map((leather) => (
          <div
            key={leather.name}
            onClick={() => setSelectedLeather(leather)}
            style={{
              cursor: 'pointer',
              border: selectedLeather?.name === leather.name ? '3px solid blue' : '1px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <div style={{ width: '100%', height: '60px', backgroundColor: leather.color }}></div>
            <div style={{ padding: '6px', fontSize: '14px' }}>{leather.name}</div>
          </div>
        ))}
      </div>

      {selectedLeather && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '20px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}
        >
          <h2>Selected Leather</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: selectedLeather.color, borderRadius: '4px' }}></div>
            <span style={{ fontSize: '16px' }}>{selectedLeather.name}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
