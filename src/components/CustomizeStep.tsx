import React, { useRef } from 'react';
import {
  Palette,
  Type,
  Layout,
  MousePointerClick,
  Sliders,
  Sparkles,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Volume2,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import {
  DesignSettings,
  ThemePreset,
  BackgroundType,
  ButtonShape,
  ButtonSize,
  ButtonHoverEffect,
  CardRadius,
  CardShadow,
  HeadingStyle,
} from '../types/quiz';
import { THEME_PRESETS } from '../utils/themePresets';

interface CustomizeStepProps {
  design: DesignSettings;
  onChangeDesign: (newDesign: DesignSettings) => void;
  onProceedToPreview: () => void;
}

export const CustomizeStep: React.FC<CustomizeStepProps> = ({
  design,
  onChangeDesign,
  onProceedToPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply a Theme Preset
  const handleApplyPreset = (presetKey: ThemePreset) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;
    onChangeDesign({
      ...design,
      themePreset: presetKey,
      ...preset.settings,
    });
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChangeDesign({
          ...design,
          backgroundType: 'imageUpload',
          bgImageData: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Curated Unsplash background presets
  const sampleBackgrounds = [
    { name: 'Abstract Deep Blue', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Minimal Geometric', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Emerald Forest', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Palette className="w-3.5 h-3.5" />
              Step 2: Design Customization
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Style Your Quiz
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Select preset themes, customize backgrounds, buttons, typography, colors, and layout.
            </p>
          </div>

          <button
            onClick={onProceedToPreview}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Next: Live Preview & ZIP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Theme Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            One-Click Theme Presets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((pKey) => {
              const p = THEME_PRESETS[pKey];
              const isSelected = design.themePreset === pKey;
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => handleApplyPreset(pKey)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20 text-white'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: p.settings.primaryBtnBg || '#3b82f6' }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: p.settings.cardBgColor || '#1e293b' }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: p.settings.accentColor || '#10b981' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 1: BACKGROUND CUSTOMIZATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Layout className="w-4 h-4 text-blue-400" />
            <h3>Background Style</h3>
          </div>

          {/* Background Mode Selector */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'gradient', label: 'Gradient' },
              { id: 'solid', label: 'Solid' },
              { id: 'imageUrl', label: 'Image URL' },
              { id: 'imageUpload', label: 'Upload' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeDesign({ ...design, backgroundType: m.id as BackgroundType })}
                className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  design.backgroundType === m.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode-Specific Settings */}
          {design.backgroundType === 'solid' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Solid Background Color:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={design.solidColor}
                  onChange={(e) => onChangeDesign({ ...design, solidColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={design.solidColor}
                  onChange={(e) => onChangeDesign({ ...design, solidColor: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white w-28 uppercase"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap gap-2 pt-2">
                {['#0f172a', '#000000', '#18181b', '#064e3b', '#1e1b4b', '#3b0764', '#f8fafc', '#fffbeb'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChangeDesign({ ...design, solidColor: c })}
                    className="w-7 h-7 rounded-lg border border-slate-700 transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {design.backgroundType === 'gradient' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gradient Start:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.gradientFrom}
                      onChange={(e) => onChangeDesign({ ...design, gradientFrom: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.gradientFrom}
                      onChange={(e) => onChangeDesign({ ...design, gradientFrom: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white w-24 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gradient End:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.gradientTo}
                      onChange={(e) => onChangeDesign({ ...design, gradientTo: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.gradientTo}
                      onChange={(e) => onChangeDesign({ ...design, gradientTo: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white w-24 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Angle presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Gradient Direction:
                </label>
                <div className="flex gap-2">
                  {[45, 90, 135, 180].map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => onChangeDesign({ ...design, gradientAngle: angle })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        design.gradientAngle === angle
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(design.backgroundType === 'imageUrl' || design.backgroundType === 'imageUpload') && (
            <div className="space-y-4">
              {design.backgroundType === 'imageUrl' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Background Image URL:
                  </label>
                  <input
                    type="text"
                    value={design.bgImageUrl}
                    onChange={(e) => onChangeDesign({ ...design, bgImageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />

                  {/* Preset Unsplash backgrounds */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5">Presets:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleBackgrounds.map((bg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onChangeDesign({ ...design, bgImageUrl: bg.url })}
                          className="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500 text-[11px] text-slate-300 truncate"
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {design.backgroundType === 'imageUpload' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Upload Custom Background Image:
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl bg-slate-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-slate-300 font-semibold">Choose image from device</span>
                    <span className="text-[11px] text-slate-500">PNG, JPG, WebP supported</span>
                  </button>
                </div>
              )}

              {/* Scrim Overlay */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Dark Legibility Scrim:</span>
                  <span className="font-bold text-white">{design.bgOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={design.bgOverlayOpacity}
                  onChange={(e) => onChangeDesign({ ...design, bgOverlayOpacity: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: BUTTONS DESIGN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
            <h3>Button Design & Effects</h3>
          </div>

          {/* Primary Button Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Button Background:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.primaryBtnBg}
                  onChange={(e) => onChangeDesign({ ...design, primaryBtnBg: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={design.primaryBtnBg}
                  onChange={(e) => onChangeDesign({ ...design, primaryBtnBg: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white w-24 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Button Text Color:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.primaryBtnText}
                  onChange={(e) => onChangeDesign({ ...design, primaryBtnText: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={design.primaryBtnText}
                  onChange={(e) => onChangeDesign({ ...design, primaryBtnText: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white w-24 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Button Shape */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Button Shape:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['rounded', 'square', 'pill'] as ButtonShape[]).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => onChangeDesign({ ...design, buttonShape: shape })}
                  className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer capitalize ${
                    shape === 'rounded' ? 'rounded-lg' : shape === 'pill' ? 'rounded-full' : 'rounded-none'
                  } ${
                    design.buttonShape === shape
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Button Size & Hover Effect */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Button Size:
              </label>
              <div className="flex gap-1.5">
                {(['compact', 'normal', 'prominent'] as ButtonSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onChangeDesign({ ...design, buttonSize: sz })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                      design.buttonSize === sz
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Hover Animation:
              </label>
              <select
                value={design.buttonHoverEffect}
                onChange={(e) => onChangeDesign({ ...design, buttonHoverEffect: e.target.value as ButtonHoverEffect })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="lift">Lift Upward (-2px)</option>
                <option value="glow">Neon Glow Shadow</option>
                <option value="scale">Subtle Scale (+3%)</option>
                <option value="outline">Accent Ring Outline</option>
              </select>
            </div>
          </div>

          {/* Button Live Mini-Preview */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Button Live Preview:</span>
            <button
              type="button"
              style={{
                backgroundColor: design.primaryBtnBg,
                color: design.primaryBtnText,
                borderRadius: design.buttonShape === 'pill' ? '9999px' : design.buttonShape === 'square' ? '0px' : '8px',
              }}
              className="px-4 py-2 text-xs font-bold shadow transition-transform active:scale-95"
            >
              Sample Button
            </button>
          </div>
        </div>

        {/* SECTION 3: TYPOGRAPHY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Type className="w-4 h-4 text-purple-400" />
            <h3>Typography & Headings</h3>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Font Family:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Inter', desc: 'Modern Clean' },
                { name: 'Poppins', desc: 'Friendly Sans' },
                { name: 'Outfit', desc: 'Geometric' },
                { name: 'Space Grotesk', desc: 'Tech Neo' },
                { name: 'Playfair Display', desc: 'Classic Serif' },
                { name: 'JetBrains Mono', desc: 'Monospace Code' },
              ].map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => onChangeDesign({ ...design, fontFamily: f.name as any })}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    design.fontFamily === f.name
                      ? 'bg-blue-600/15 border-blue-500 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs">{f.name}</span>
                  <span className="text-[10px] text-slate-500">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Heading Style & Font Scaling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question Heading:
              </label>
              <select
                value={design.headingStyle}
                onChange={(e) => onChangeDesign({ ...design, headingStyle: e.target.value as HeadingStyle })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
              >
                <option value="minimal">Minimal Plain</option>
                <option value="accent-bar">Accent Left Border</option>
                <option value="badge">Badge Pill Number</option>
                <option value="banner">Boxed Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Base Font Scaling:
              </label>
              <div className="flex gap-1.5">
                {(['compact', 'medium', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onChangeDesign({ ...design, fontSize: sz })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                      design.fontSize === sz
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: CARD LAYOUT & FEEDBACK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3>Card Layout & Feedback Colors</h3>
          </div>

          {/* Card Radius & Shadow */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Card Border Radius:
              </label>
              <select
                value={design.cardRadius}
                onChange={(e) => onChangeDesign({ ...design, cardRadius: e.target.value as CardRadius })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
              >
                <option value="none">Square (0px)</option>
                <option value="sm">Small (6px)</option>
                <option value="md">Medium (12px)</option>
                <option value="lg">Large (18px)</option>
                <option value="xl">Pill (24px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Card Elevation Shadow:
              </label>
              <select
                value={design.cardShadow}
                onChange={(e) => onChangeDesign({ ...design, cardShadow: e.target.value as CardShadow })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
              >
                <option value="none">Flat (No Shadow)</option>
                <option value="subtle">Subtle</option>
                <option value="medium">Medium Depth</option>
                <option value="elevated">Elevated 3D</option>
                <option value="glow">Neon Glow</option>
              </select>
            </div>
          </div>

          {/* Feedback Colors */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Correct Color:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={design.correctColor}
                  onChange={(e) => onChangeDesign({ ...design, correctColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-[10px] font-mono text-slate-300">{design.correctColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Incorrect Color:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={design.incorrectColor}
                  onChange={(e) => onChangeDesign({ ...design, incorrectColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-[10px] font-mono text-slate-300">{design.incorrectColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Accent Highlight:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={design.accentColor}
                  onChange={(e) => onChangeDesign({ ...design, accentColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-[10px] font-mono text-slate-300">{design.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Behavior Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-300 font-semibold">Offline Sound Effects (Web Audio)</span>
              </div>
              <input
                type="checkbox"
                checked={design.enableSounds}
                onChange={(e) => onChangeDesign({ ...design, enableSounds: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-semibold">Enable Question Countdown Timer</span>
              </div>
              <input
                type="checkbox"
                checked={design.enableTimer}
                onChange={(e) => onChangeDesign({ ...design, enableTimer: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-semibold">Instant Answer Feedback Mode</span>
              </div>
              <input
                type="checkbox"
                checked={design.instantFeedback}
                onChange={(e) => onChangeDesign({ ...design, instantFeedback: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Proceed Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          All styles will be mirrored in the interactive preview and exported in style.css.
        </span>
        <button
          onClick={onProceedToPreview}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
        >
          <span>Proceed to Live Preview & Download</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
