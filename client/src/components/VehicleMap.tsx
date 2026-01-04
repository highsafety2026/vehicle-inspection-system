import { useState } from 'react';
import { VEHICLE_AREAS, DEFECT_TYPES } from '@shared/constants';
import type { InspectionItem } from '@shared/schema';

interface VehicleMapProps {
  items: InspectionItem[];
  onAreaClick: (area: string, x: number, y: number) => void;
  onDamageClick: (item: InspectionItem) => void;
}

export function VehicleMap({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const [activeView, setActiveView] = useState<string>('front');

  return (
    <div className="vehicle-map-container">
      {/* Enhanced View Selector with Icons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button
          onClick={() => setActiveView('front')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'front'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          🚗 أمام
        </button>
        <button
          onClick={() => setActiveView('back')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'back'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          🚙 خلف
        </button>
        <button
          onClick={() => setActiveView('left')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'left'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          ⬅️ يسار
        </button>
        <button
          onClick={() => setActiveView('right')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'right'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          ➡️ يمين
        </button>
        <button
          onClick={() => setActiveView('roof')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'roof'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          ⬆️ سقف
        </button>
        <button
          onClick={() => setActiveView('tires')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'tires'
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          🛞 الجنوط
        </button>
        <button
          onClick={() => setActiveView('mechanics')}
          className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
            activeView === 'mechanics'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl scale-105'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          ⚙️ الميكانيكا
        </button>
      </div>

      {/* Vehicle Views with Animation */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 font-semibold">💡 اضغط على أي جزء من السيارة لإضافة عطل</p>
        </div>
        {activeView === 'front' && (
          <FrontView items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'back' && (
          <BackView items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'left' && (
          <SideView side="left" items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'right' && (
          <SideView side="right" items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'roof' && (
          <RoofView items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'tires' && (
          <TiresView items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
        {activeView === 'mechanics' && (
          <MechanicsView items={items} onAreaClick={onAreaClick} onDamageClick={onDamageClick} />
        )}
      </div>
    </div>
  );
}

// Enhanced Front View Component - Professional 3D-style
function FrontView({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const frontItems = items.filter(item => item.vehicleArea === 'front');

  return (
    <svg viewBox="0 0 500 450" className="w-full max-w-4xl mx-auto" style={{filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'}}>
      <defs>
        {/* Realistic Silver/Gray Car Body */}
        <linearGradient id="carBodyFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#e8edf2', stopOpacity: 1}} />
          <stop offset="40%" style={{stopColor: '#c5d3e0', stopOpacity: 1}} />
          <stop offset="70%" style={{stopColor: '#8b9cad', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#5a6978', stopOpacity: 1}} />
        </linearGradient>
        {/* Realistic Glass - Blue Tint */}
        <linearGradient id="glassEffect" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#dbeafe', stopOpacity: 0.6}} />
          <stop offset="50%" style={{stopColor: '#93c5fd', stopOpacity: 0.7}} />
          <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.5}} />
        </linearGradient>
        {/* Chrome/Metallic Parts */}
        <linearGradient id="metallic" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#d1d5db', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#9ca3af', stopOpacity: 1}} />
        </linearGradient>
        {/* Warm LED Headlights */}
        <radialGradient id="lightGlow">
          <stop offset="0%" style={{stopColor: '#fffbeb', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#fef3c7', stopOpacity: 0.9}} />
          <stop offset="100%" style={{stopColor: '#fde68a', stopOpacity: 0.4}} />
        </radialGradient>
        {/* Black Tire Rubber */}
        <radialGradient id="tireGradient">
          <stop offset="0%" style={{stopColor: '#3d3d3d', stopOpacity: 1}} />
          <stop offset="70%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}} />
        </radialGradient>
        {/* Alloy Rim */}
        <radialGradient id="rimGradient">
          <stop offset="0%" style={{stopColor: '#f3f4f6', stopOpacity: 1}} />
          <stop offset="60%" style={{stopColor: '#9ca3af', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#4b5563', stopOpacity: 1}} />
        </radialGradient>
        {/* Engine Heat Gradient */}
        <linearGradient id="engineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#fca5a5', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#ef4444', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#991b1b', stopOpacity: 1}} />
        </linearGradient>
        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Car Body Outline - Professional Shape */}
      <path
        d="M 100 180 L 100 280 L 120 310 L 380 310 L 400 280 L 400 180 L 380 120 L 350 90 L 150 90 L 120 120 Z"
        fill="url(#carBodyFront)" stroke="#475569" strokeWidth="4"
        className="car-body"
      />
      
      {/* Windshield - 3D Glass Effect */}
      <path
        d="M 160 90 L 200 60 L 300 60 L 340 90 L 320 120 L 180 120 Z"
        fill="url(#glassEffect)" stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'windshield', onAreaClick)}
        className="hover:fill-blue-300 transition-all cursor-pointer"
        style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'}}
      />
      <text x="250" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#1e3a8a">زجاج</text>
      
      {/* Hood / Bonnet - Curved Design */}
      <ellipse
        cx="250" cy="170" rx="110" ry="50"
        fill="url(#carBodyFront)" stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'hood', onAreaClick)}
        className="hover:opacity-90 transition-opacity cursor-pointer"
      />
      <path
        d="M 140 160 Q 250 140 360 160"
        fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6"
      />
      <text x="250" y="175" textAnchor="middle" className="text-xl font-bold" fill="white">كبوت</text>
      <text x="250" y="192" textAnchor="middle" className="text-xs" fill="#dbeafe">Hood</text>

      {/* Front Bumper - Curved Professional Design */}
      <path
        d="M 110 240 Q 250 225 390 240 L 400 275 Q 250 290 100 275 Z"
        fill="url(#metallic)" stroke="#475569" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'front_bumper', onAreaClick)}
        className="hover:opacity-90 transition-all cursor-pointer"
        style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'}}
      />
      {/* Bumper detail lines */}
      <path d="M 120 255 Q 250 245 380 255" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.7"/>
      <path d="M 120 265 Q 250 255 380 265" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.7"/>
      <text x="250" y="265" textAnchor="middle" className="text-base font-bold" fill="#1e293b">صدام أمامي</text>
      
      {/* Left Fender - 3D Curved */}
      <path
        d="M 80 140 Q 90 120 100 120 L 100 270 Q 90 280 85 275 L 75 145 Z"
        fill="url(#carBodyFront)" stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'left_fender', onAreaClick)}
        className="hover:fill-blue-400 transition-colors cursor-pointer"
      />
      <text x="88" y="200" textAnchor="middle" className="text-xs font-bold" fill="white" transform="rotate(-90 88 200)">رفرف يسار</text>

      {/* Right Fender - 3D Curved */}
      <path
        d="M 420 140 Q 410 120 400 120 L 400 270 Q 410 280 415 275 L 425 145 Z"
        fill="url(#carBodyFront)" stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'right_fender', onAreaClick)}
        className="hover:fill-blue-400 transition-colors cursor-pointer"
      />
      <text x="412" y="200" textAnchor="middle" className="text-xs font-bold" fill="white" transform="rotate(90 412 200)">رفرف يمين</text>
      
      {/* Windshield */}
      <path
        d="M 100 70 L 300 70 L 290 90 L 110 90 Z"
        fill="#bfdbfe" fillOpacity="0.6" stroke="#1e40af" strokeWidth="2.5"
        onClick={(e) => handleSvgClick(e, 'windshield', onAreaClick)}
        className="hover:fill-blue-300 transition-colors cursor-pointer"
      />
      <text x="200" y="83" textAnchor="middle" className="text-sm font-semibold" fill="#1e3a8a">زجاج أمامي</text>

      {/* Left Fender */}
      <path
        d="M 60 120 L 80 120 L 80 200 L 70 220 L 55 210 L 55 130 Z"
        fill="#e0e7ff" stroke="#3730a3" strokeWidth="2.5"
        onClick={(e) => handleSvgClick(e, 'left_fender', onAreaClick)}
        className="hover:fill-indigo-200 transition-colors cursor-pointer"
      />
      <text x="68" y="165" textAnchor="middle" className="text-xs font-bold" fill="#3730a3" transform="rotate(-90 68 165)">رفرف</text>

      {/* Right Fender */}
      <path
        d="M 340 120 L 320 120 L 320 200 L 330 220 L 345 210 L 345 130 Z"
        fill="#e0e7ff" stroke="#3730a3" strokeWidth="2.5"
        onClick={(e) => handleSvgClick(e, 'right_fender', onAreaClick)}
        className="hover:fill-indigo-200 transition-colors cursor-pointer"
      />
      <text x="332" y="165" textAnchor="middle" className="text-xs font-bold" fill="#3730a3" transform="rotate(90 332 165)">رفرف</text>

      {/* Headlights - LED Style with Glow */}
      <g className="headlight-left">
        <ellipse cx="135" cy="245" rx="25" ry="30" fill="url(#lightGlow)" opacity="0.5"/>
        <ellipse cx="135" cy="245" rx="20" ry="25" fill="#fef3c7" stroke="#d97706" strokeWidth="3"/>
        <ellipse cx="130" cy="240" rx="8" ry="10" fill="#fde047"/>
        <path d="M 125 235 Q 135 238 130 245" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
      </g>
      <g className="headlight-right">
        <ellipse cx="365" cy="245" rx="25" ry="30" fill="url(#lightGow)" opacity="0.5"/>
        <ellipse cx="365" cy="245" rx="20" ry="25" fill="#fef3c7" stroke="#d97706" strokeWidth="3"/>
        <ellipse cx="370" cy="240" rx="8" ry="10" fill="#fde047"/>
        <path d="M 375 235 Q 365 238 370 245" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
      </g>

      {/* Grille - Professional Mesh Design */}
      <rect x="210" y="275" width="80" height="30" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
      <g opacity="0.7">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`grill-v-${i}`} x1={215 + i * 10} y1="277" x2={215 + i * 10} y2="303" stroke="#64748b" strokeWidth="1.5"/>
        ))}
        {[0, 1, 2].map(i => (
          <line key={`grill-h-${i}`} x1="212" y1={280 + i * 10} x2="288" y2={280 + i * 10} stroke="#64748b" strokeWidth="1.5"/>
        ))}
      </g>

      {/* Engine - المكينة - Enhanced Design */}
      <g 
        onClick={(e) => handleSvgClick(e, 'engine', onAreaClick)}
        className="hover:opacity-90 transition-opacity cursor-pointer"
      >
        <rect x="200" y="145" width="100" height="60" rx="8" fill="#fca5a5" stroke="#dc2626" strokeWidth="3"/>
        <rect x="210" y="155" width="35" height="20" rx="3" fill="#ef4444"/>
        <rect x="255" y="155" width="35" height="20" rx="3" fill="#ef4444"/>
        <circle cx="227" cy="165" r="4" fill="#7f1d1d"/>
        <circle cx="273" cy="165" r="4" fill="#7f1d1d"/>
        <text x="250" y="192" textAnchor="middle" className="text-2xl">⚙️</text>
        <rect x="220" y="175" width="60" height="25" rx="4" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5"/>
        <text x="250" y="222" textAnchor="middle" className="text-xs font-bold" fill="#7f1d1d">مكينة</text>
      </g>

      {/* Front Left Tire - كوتش أمامي يسار - Realistic Black Rubber */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_front_left', onAreaClick)}
        className="hover:opacity-90 transition-all cursor-pointer"
        style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'}}
      >
        {/* Outer Tire - Black Rubber */}
        <circle cx="110" cy="310" r="38" fill="url(#tireGradient)" stroke="#000000" strokeWidth="3"/>
        {/* Sidewall */}
        <circle cx="110" cy="310" r="30" fill="#1a1a1a" opacity="0.9"/>
        {/* Alloy Rim */}
        <circle cx="110" cy="310" r="20" fill="url(#rimGradient)" stroke="#9ca3af" strokeWidth="2"/>
        {/* Center Cap */}
        <circle cx="110" cy="310" r="8" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5"/>
        {/* Tire Treads */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line 
              key={`tire-fl-${angle}`}
              x1={110 + Math.cos(rad) * 22} 
              y1={310 + Math.sin(rad) * 22}
              x2={110 + Math.cos(rad) * 30} 
              y2={310 + Math.sin(rad) * 30}
              stroke="#444444" strokeWidth="2"
            />
          );
        })}
        <text x="110" y="365" textAnchor="middle" className="text-xs font-bold" fill="#1f2937">كوتش يسار</text>
      </g>

      {/* Front Right Tire - كوتش أمامي يمين - Realistic Black Rubber */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_front_right', onAreaClick)}
        className="hover:opacity-90 transition-all cursor-pointer"
        style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'}}
      >
        {/* Outer Tire - Black Rubber */}
        <circle cx="390" cy="310" r="38" fill="url(#tireGradient)" stroke="#000000" strokeWidth="3"/>
        {/* Sidewall */}
        <circle cx="390" cy="310" r="30" fill="#1a1a1a" opacity="0.9"/>
        {/* Alloy Rim */}
        <circle cx="390" cy="310" r="20" fill="url(#rimGradient)" stroke="#9ca3af" strokeWidth="2"/>
        {/* Center Cap */}
        <circle cx="390" cy="310" r="8" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5"/>
        {/* Tire Treads */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line 
              key={`tire-fr-${angle}`}
              x1={390 + Math.cos(rad) * 22} 
              y1={310 + Math.sin(rad) * 22}
              x2={390 + Math.cos(rad) * 30} 
              y2={310 + Math.sin(rad) * 30}
              stroke="#444444" strokeWidth="2"
            />
          );
        })}
        <text x="390" y="365" textAnchor="middle" className="text-xs font-bold" fill="#1f2937">كوتش يمين</text>
      </g>

      {/* Render Damage Icons */}
      {frontItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Back View Component
function BackView({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const backItems = items.filter(item => item.vehicleArea === 'back');

  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-2xl mx-auto cursor-pointer">
      {/* Trunk */}
      <rect
        x="50" y="30" width="200" height="80"
        fill="#e8e8e8" stroke="#333" strokeWidth="2"
        onClick={(e) => handleSvgClick(e, 'trunk', onAreaClick)}
        className="hover:fill-blue-100 transition-colors"
      />
      <text x="150" y="75" textAnchor="middle" className="text-sm">شنطة</text>

      {/* Rear Bumper */}
      <rect
        x="60" y="120" width="180" height="40"
        fill="#d0d0d0" stroke="#333" strokeWidth="2"
        onClick={(e) => handleSvgClick(e, 'rear_bumper', onAreaClick)}
        className="hover:fill-blue-100 transition-colors"
      />
      <text x="150" y="145" textAnchor="middle" className="text-sm">صدام خلفي</text>

      {/* Rear Glass */}
      <path
        d="M 70 20 L 230 20 L 240 30 L 60 30 Z"
        fill="#87CEEB" fillOpacity="0.3" stroke="#333" strokeWidth="2"
        onClick={(e) => handleSvgClick(e, 'rear_glass', onAreaClick)}
        className="hover:fill-blue-200 transition-colors"
      />
      <text x="150" y="28" textAnchor="middle" className="text-xs">زجاج خلفي</text>

      {/* Rear Left Tire - كوتش خلفي يسار */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_rear_left', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="70" cy="100" r="25" fill="#1f2937" stroke="#111827" strokeWidth="3"/>
        <circle cx="70" cy="100" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
        <circle cx="70" cy="100" r="8" fill="#9ca3af"/>
        <text x="70" y="140" textAnchor="middle" className="text-xs font-bold" fill="#1f2937">كوتش يسار</text>
      </g>

      {/* Rear Right Tire - كوتش خلفي يمين */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_rear_right', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="230" cy="100" r="25" fill="#1f2937" stroke="#111827" strokeWidth="3"/>
        <circle cx="230" cy="100" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
        <circle cx="230" cy="100" r="8" fill="#9ca3af"/>
        <text x="230" y="140" textAnchor="middle" className="text-xs font-bold" fill="#1f2937">كوتش يمين</text>
      </g>

      {/* Render Damage Icons */}
      {backItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Enhanced Side View Component with detailed doors
function SideView({ side, items, onAreaClick, onDamageClick }: VehicleMapProps & { side: 'left' | 'right' }) {
  const sideItems = items.filter(item => item.vehicleArea === side);

  return (
    <svg viewBox="0 0 600 300" className="w-full max-w-4xl mx-auto" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'}}>
      <defs>
        <linearGradient id={`door${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#dbeafe', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#93c5fd', stopOpacity: 1}} />
        </linearGradient>
      </defs>

      {/* Car Body Outline */}
      <path
        d="M 80 140 L 520 140 L 540 160 L 540 220 L 60 220 L 60 160 Z"
        fill="#e0e7ff" stroke="#1e40af" strokeWidth="3" opacity="0.3"
      />

      {/* Roof */}
      <path
        d="M 120 100 L 180 80 L 420 80 L 480 100 L 500 140 L 100 140 Z"
        fill="#c7d2fe" stroke="#4338ca" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, 'roof', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
      <text x="300" y="115" textAnchor="middle" className="text-lg font-bold" fill="#312e81">سقف</text>

      {/* Front Door */}
      <rect
        x="100" y="140" width="120" height="80"
        rx="8"
        fill={`url(#door${side})`} stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, `front_door_${side}`, onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
      <text x="160" y="175" textAnchor="middle" className="text-xl font-bold" fill="#1e3a8a">باب أمامي</text>
      <text x="160" y="195" textAnchor="middle" className="text-sm" fill="#475569">{side === 'left' ? 'يسار' : 'يمين'}</text>
      
      {/* Door Handle */}
      <rect x="200" y="170" width="15" height="8" rx="4" fill="#374151"/>
      
      {/* Window */}
      <rect x="110" y="145" width="100" height="35" rx="4" fill="#bfdbfe" fillOpacity="0.6" stroke="#3b82f6" strokeWidth="2"/>

      {/* Rear Door */}
      <rect
        x="230" y="140" width="120" height="80"
        rx="8"
        fill={`url(#door${side})`} stroke="#1e40af" strokeWidth="3"
        onClick={(e) => handleSvgClick(e, `rear_door_${side}`, onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
      <text x="290" y="175" textAnchor="middle" className="text-xl font-bold" fill="#1e3a8a">باب خلفي</text>
      <text x="290" y="195" textAnchor="middle" className="text-sm" fill="#475569">{side === 'left' ? 'يسار' : 'يمين'}</text>
      
      {/* Door Handle */}
      <rect x="330" y="170" width="15" height="8" rx="4" fill="#374151"/>
      
      {/* Window */}
      <rect x="240" y="145" width="100" height="35" rx="4" fill="#bfdbfe" fillOpacity="0.6" stroke="#3b82f6" strokeWidth="2"/>

      {/* Front Fender */}
      <path
        d="M 60 160 L 95 145 L 95 210 L 70 225 L 55 220 L 55 170 Z"
        fill="#e0e7ff" stroke="#3730a3" strokeWidth="2.5"
        onClick={(e) => handleSvgClick(e, `front_fender_${side}`, onAreaClick)}
        className="hover:fill-indigo-200 transition-colors cursor-pointer"
      />
      <text x="75" y="185" textAnchor="middle" className="text-sm font-bold" fill="#3730a3">رفرف</text>

      {/* Rear Quarter Panel */}
      <path
        d="M 355 140 L 500 140 L 520 160 L 520 220 L 355 220 Z"
        fill="#dbeafe" stroke="#0369a1" strokeWidth="2.5"
        onClick={(e) => handleSvgClick(e, `rear_panel_${side}`, onAreaClick)}
        className="hover:fill-sky-200 transition-colors cursor-pointer"
      />
      <text x="437" y="185" textAnchor="middle" className="text-sm font-bold" fill="#0c4a6e">جانب خلفي</text>

      {/* Side Mirror */}
      <ellipse
        cx="95" cy="130" rx="12" ry="18"
        fill="#94a3b8" stroke="#334155" strokeWidth="2"
        onClick={(e) => handleSvgClick(e, `mirror_${side}`, onAreaClick)}
        className="hover:fill-slate-400 transition-colors cursor-pointer"
      />
      <text x="95" y="115" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">مرآة</text>

      {/* Wheels */}
      <circle cx="130" cy="230" r="25" fill="#1f2937" stroke="#374151" strokeWidth="3"/>
      <circle cx="130" cy="230" r="15" fill="#6b7280"/>
      <circle cx="420" cy="230" r="25" fill="#1f2937" stroke="#374151" strokeWidth="3"/>
      <circle cx="420" cy="230" r="15" fill="#6b7280"/>

      {/* Render Damage Icons */}
      {sideItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Roof View Component
function RoofView({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const roofItems = items.filter(item => item.vehicleArea === 'roof');

  return (
    <svg viewBox="0 0 300 400" className="w-full max-w-xl mx-auto cursor-pointer">
      <rect
        x="50" y="50" width="200" height="300"
        fill="#e8e8e8" stroke="#333" strokeWidth="2"
        onClick={(e) => handleSvgClick(e, 'roof', onAreaClick)}
        className="hover:fill-blue-100 transition-colors"
      />
      <text x="150" y="210" textAnchor="middle" className="text-lg">سقف السيارة</text>

      {/* Render Damage Icons */}
      {roofItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Tires View Component - منظر الجنوط/الكواتش
function TiresView({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const tireItems = items.filter(item => 
    item.partName?.includes('tire') || 
    item.partName?.includes('كوتش') || 
    item.partName?.includes('جنط')
  );

  return (
    <svg viewBox="0 0 600 400" className="w-full max-w-4xl mx-auto" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'}}>
      <defs>
        <radialGradient id="tireGradMain">
          <stop offset="0%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
          <stop offset="70%" style={{stopColor: '#374151', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
        </radialGradient>
      </defs>

      {/* Title */}
      <text x="300" y="40" textAnchor="middle" className="text-3xl font-bold" fill="#1f2937">🛞 الجنوط والكواتش</text>
      <text x="300" y="65" textAnchor="middle" className="text-sm" fill="#6b7280">اضغط على أي كوتش لإضافة عطل</text>

      {/* Front Left Tire */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_front_left', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="150" cy="150" r="60" fill="url(#tireGradMain)" stroke="#111827" strokeWidth="5"/>
        <circle cx="150" cy="150" r="40" fill="#4b5563" stroke="#374151" strokeWidth="3"/>
        <circle cx="150" cy="150" r="25" fill="#6b7280"/>
        <circle cx="150" cy="150" r="12" fill="#9ca3af"/>
        {/* Tire treads */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + Math.cos(rad) * 50;
          const y1 = 150 + Math.sin(rad) * 50;
          const x2 = 150 + Math.cos(rad) * 60;
          const y2 = 150 + Math.sin(rad) * 60;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth="3"/>;
        })}
        <text x="150" y="230" textAnchor="middle" className="text-lg font-bold" fill="#1f2937">كوتش أمامي يسار</text>
        <text x="150" y="248" textAnchor="middle" className="text-sm" fill="#6b7280">Front Left Tire</text>
      </g>

      {/* Front Right Tire */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_front_right', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="450" cy="150" r="60" fill="url(#tireGradMain)" stroke="#111827" strokeWidth="5"/>
        <circle cx="450" cy="150" r="40" fill="#4b5563" stroke="#374151" strokeWidth="3"/>
        <circle cx="450" cy="150" r="25" fill="#6b7280"/>
        <circle cx="450" cy="150" r="12" fill="#9ca3af"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 450 + Math.cos(rad) * 50;
          const y1 = 150 + Math.sin(rad) * 50;
          const x2 = 450 + Math.cos(rad) * 60;
          const y2 = 150 + Math.sin(rad) * 60;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth="3"/>;
        })}
        <text x="450" y="230" textAnchor="middle" className="text-lg font-bold" fill="#1f2937">كوتش أمامي يمين</text>
        <text x="450" y="248" textAnchor="middle" className="text-sm" fill="#6b7280">Front Right Tire</text>
      </g>

      {/* Rear Left Tire */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_rear_left', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="150" cy="310" r="60" fill="url(#tireGradMain)" stroke="#111827" strokeWidth="5"/>
        <circle cx="150" cy="310" r="40" fill="#4b5563" stroke="#374151" strokeWidth="3"/>
        <circle cx="150" cy="310" r="25" fill="#6b7280"/>
        <circle cx="150" cy="310" r="12" fill="#9ca3af"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + Math.cos(rad) * 50;
          const y1 = 310 + Math.sin(rad) * 50;
          const x2 = 150 + Math.cos(rad) * 60;
          const y2 = 310 + Math.sin(rad) * 60;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth="3"/>;
        })}
        <text x="150" y="390" textAnchor="middle" className="text-lg font-bold" fill="#1f2937">كوتش خلفي يسار</text>
        <text x="150" y="408" textAnchor="middle" className="text-sm" fill="#6b7280">Rear Left Tire</text>
      </g>

      {/* Rear Right Tire */}
      <g 
        onClick={(e) => handleSvgClick(e, 'tire_rear_right', onAreaClick)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <circle cx="450" cy="310" r="60" fill="url(#tireGradMain)" stroke="#111827" strokeWidth="5"/>
        <circle cx="450" cy="310" r="40" fill="#4b5563" stroke="#374151" strokeWidth="3"/>
        <circle cx="450" cy="310" r="25" fill="#6b7280"/>
        <circle cx="450" cy="310" r="12" fill="#9ca3af"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 450 + Math.cos(rad) * 50;
          const y1 = 310 + Math.sin(rad) * 50;
          const x2 = 450 + Math.cos(rad) * 60;
          const y2 = 310 + Math.sin(rad) * 60;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth="3"/>;
        })}
        <text x="450" y="390" textAnchor="middle" className="text-lg font-bold" fill="#1f2937">كوتش خلفي يمين</text>
        <text x="450" y="408" textAnchor="middle" className="text-sm" fill="#6b7280">Rear Right Tire</text>
      </g>

      {/* Render Damage Icons */}
      {tireItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Mechanics View Component - منظر الميكانيكا/المكينة
function MechanicsView({ items, onAreaClick, onDamageClick }: VehicleMapProps) {
  const mechanicsItems = items.filter(item => 
    item.partName?.includes('engine') || 
    item.partName?.includes('مكينة') ||
    item.partName?.includes('محرك')
  );

  return (
    <svg viewBox="0 0 600 500" className="w-full max-w-4xl mx-auto" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'}}>
      <defs>
        <linearGradient id="engineGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#fee2e2', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#fecaca', stopOpacity: 1}} />
        </linearGradient>
        <radialGradient id="engineHeat">
          <stop offset="0%" style={{stopColor: '#fef3c7', stopOpacity: 0.8}} />
          <stop offset="100%" style={{stopColor: '#dc2626', stopOpacity: 0.1}} />
        </radialGradient>
      </defs>

      {/* Title */}
      <text x="300" y="40" textAnchor="middle" className="text-3xl font-bold" fill="#dc2626">⚙️ قسم الميكانيكا</text>
      <text x="300" y="65" textAnchor="middle" className="text-sm" fill="#991b1b">اضغط على المكينة لإضافة عطل</text>

      {/* Engine Block */}
      <g 
        onClick={(e) => handleSvgClick(e, 'engine', onAreaClick)}
        className="hover:opacity-90 transition-opacity cursor-pointer"
      >
        {/* Heat glow */}
        <ellipse cx="300" cy="250" rx="200" ry="180" fill="url(#engineHeat)" opacity="0.5"/>
        
        {/* Main engine body */}
        <rect x="150" y="120" width="300" height="260" rx="15" fill="url(#engineGradMain)" stroke="#dc2626" strokeWidth="5"/>
        
        {/* Engine details */}
        <rect x="180" y="150" width="80" height="40" rx="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
        <rect x="340" y="150" width="80" height="40" rx="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
        <rect x="180" y="210" width="80" height="40" rx="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
        <rect x="340" y="210" width="80" height="40" rx="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
        
        {/* Center cylinder */}
        <rect x="250" y="180" width="100" height="100" rx="8" fill="#7f1d1d" stroke="#450a0a" strokeWidth="3"/>
        <circle cx="300" cy="230" r="30" fill="#991b1b" stroke="#450a0a" strokeWidth="2"/>
        
        {/* Bolts */}
        {[170, 210, 250, 290, 330, 370, 410, 430].map((x, i) => (
          <circle key={`bolt-${i}`} cx={x} cy={135} r="5" fill="#78716c" stroke="#1c1917" strokeWidth="1"/>
        ))}
        
        {/* Oil pan */}
        <rect x="200" y="320" width="200" height="40" rx="10" fill="#1e3a8a" stroke="#1e40af" strokeWidth="3"/>
        <text x="300" y="345" textAnchor="middle" className="text-xs font-bold" fill="#dbeafe">حوض الزيت</text>
        
        {/* Main icon and text */}
        <text x="300" y="240" textAnchor="middle" className="text-6xl">⚙️</text>
        <text x="300" y="420" textAnchor="middle" className="text-2xl font-bold" fill="#7f1d1d">المكينة / المحرك</text>
        <text x="300" y="445" textAnchor="middle" className="text-lg" fill="#991b1b">Engine</text>
        
        {/* Warning symbols */}
        <text x="160" y="115" textAnchor="middle" className="text-2xl">🔥</text>
        <text x="440" y="115" textAnchor="middle" className="text-2xl">🔥</text>
      </g>

      {/* Render Damage Icons */}
      {mechanicsItems.map((item) => (
        <DamageIcon key={item.id} item={item} onClick={onDamageClick} />
      ))}
    </svg>
  );
}

// Damage Icon Component
function DamageIcon({ item, onClick }: { item: InspectionItem; onClick: (item: InspectionItem) => void }) {
  const defect = DEFECT_TYPES.find(d => d.id === item.defectType);
  if (!item.positionX || !item.positionY || !defect) return null;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      className="cursor-pointer hover:scale-110 transition-transform"
    >
      <circle
        cx={item.positionX}
        cy={item.positionY}
        r="12"
        fill={defect.color}
        stroke="#fff"
        strokeWidth="2"
        opacity="0.9"
      />
      <text
        x={item.positionX}
        y={item.positionY + 4}
        textAnchor="middle"
        className="text-xs"
      >
        {defect.icon}
      </text>
    </g>
  );
}

// Helper function to handle SVG clicks
function handleSvgClick(
  e: React.MouseEvent<SVGElement>,
  partId: string,
  onAreaClick: (area: string, x: number, y: number) => void
) {
  const svg = e.currentTarget.closest('svg');
  if (!svg) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;

  const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
  onAreaClick(partId, Math.round(svgP.x), Math.round(svgP.y));
}
