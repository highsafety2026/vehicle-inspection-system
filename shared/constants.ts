// ============================================
// Vehicle Condition Map Constants
// ============================================

// أجزاء السيارة
export const VEHICLE_PARTS = [
  { id: 'front_door_right', label: 'باب أمامي يمين', area: 'right' },
  { id: 'front_door_left', label: 'باب أمامي يسار', area: 'left' },
  { id: 'rear_door_right', label: 'باب خلفي يمين', area: 'right' },
  { id: 'rear_door_left', label: 'باب خلفي يسار', area: 'left' },
  { id: 'fender_right', label: 'رفرف يمين', area: 'right' },
  { id: 'fender_left', label: 'رفرف يسار', area: 'left' },
  { id: 'front_bumper', label: 'صدام أمامي', area: 'front' },
  { id: 'rear_bumper', label: 'صدام خلفي', area: 'back' },
  { id: 'trunk', label: 'شنطة', area: 'back' },
  { id: 'hood', label: 'كبوت', area: 'front' },
  { id: 'roof', label: 'سقف', area: 'roof' },
  { id: 'pillar_a_right', label: 'قائم A يمين', area: 'right' },
  { id: 'pillar_a_left', label: 'قائم A يسار', area: 'left' },
  { id: 'pillar_b_right', label: 'قائم B يمين', area: 'right' },
  { id: 'pillar_b_left', label: 'قائم B يسار', area: 'left' },
  { id: 'pillar_c_right', label: 'قائم C يمين', area: 'right' },
  { id: 'pillar_c_left', label: 'قائم C يسار', area: 'left' },
  { id: 'mirror_right', label: 'مرآة يمين', area: 'right' },
  { id: 'mirror_left', label: 'مرآة يسار', area: 'left' },
  { id: 'windshield', label: 'زجاج أمامي', area: 'front' },
  { id: 'rear_glass', label: 'زجاج خلفي', area: 'back' },
  { id: 'side_glass_right', label: 'زجاج جانبي يمين', area: 'right' },
  { id: 'side_glass_left', label: 'زجاج جانبي يسار', area: 'left' },
  // الكواتش (الإطارات) - اللهجة الإماراتية
  { id: 'tire_front_right', label: 'كوتش أمامي يمين', area: 'front' },
  { id: 'tire_front_left', label: 'كوتش أمامي يسار', area: 'front' },
  { id: 'tire_rear_right', label: 'كوتش خلفي يمين', area: 'back' },
  { id: 'tire_rear_left', label: 'كوتش خلفي يسار', area: 'back' },
  // المكينة (المحرك)
  { id: 'engine', label: 'مكينة', area: 'front' },
] as const;

// أنواع الأعطال
export const DEFECT_TYPES = [
  { id: 'scratch_light', label: 'خدش سطحي', icon: '〰️', color: '#FFA500' },
  { id: 'scratch_deep', label: 'خدش عميق', icon: '🔪', color: '#FF4500' },
  { id: 'dent_light', label: 'طعجة خفيفة', icon: '◉', color: '#FFD700' },
  { id: 'dent_severe', label: 'طعجة شديدة', icon: '●', color: '#DC143C' },
  { id: 'crack', label: 'كسر', icon: '💥', color: '#8B0000' },
  { id: 'fracture', label: 'شق', icon: '⚡', color: '#B22222' },
  { id: 'paint_non_original', label: 'صبغ غير أصلي', icon: '🎨', color: '#9370DB' },
  { id: 'color_mismatch', label: 'فرق لون', icon: '🌈', color: '#BA55D3' },
  { id: 'rust', label: 'صدأ', icon: '🦀', color: '#A0522D' },
  { id: 'misalignment', label: 'عدم اتزان', icon: '⚖️', color: '#696969' },
  { id: 'multiple_damages', label: 'أضرار متعددة', icon: '⚠️', color: '#FF6347' },
  
  // أعطال الكواتش (الإطارات) - اللهجة الإماراتية
  { id: 'tire_worn', label: 'كوتش بالي (تآكل)', icon: '🔴', color: '#D32F2F' },
  { id: 'tire_flat', label: 'كوتش مفلت (مثقوب)', icon: '🛞', color: '#F44336' },
  { id: 'tire_cracked', label: 'كوتش متشقق', icon: '⚡', color: '#E53935' },
  { id: 'tire_bulge', label: 'كوتش منفوخ (تورم)', icon: '💨', color: '#D84315' },
  { id: 'tire_uneven_wear', label: 'كوتش تآكل غير متساوي', icon: '⚠️', color: '#E64A19' },
  { id: 'tire_bald', label: 'كوتش أملس (بدون نقشة)', icon: '⭕', color: '#BF360C' },
  { id: 'tire_sidewall_damage', label: 'كوتش تلف جنبي', icon: '🔨', color: '#D84315' },
  { id: 'tire_age_deterioration', label: 'كوتش قديم متآكل', icon: '🕐', color: '#795548' },
  { id: 'tire_pressure_issue', label: 'كوتش ضغط هوا خطأ', icon: '💨', color: '#FF9800' },
  { id: 'tire_noise', label: 'كوتش يصدر صوت', icon: '🔊', color: '#FF6F00' },
  { id: 'tire_vibration', label: 'كوتش يسبب اهتزاز', icon: '📳', color: '#F57C00' },
  { id: 'rim_damaged', label: 'جنط مضروب', icon: '⚙️', color: '#424242' },
  { id: 'rim_bent', label: 'جنط ملوي', icon: '🔧', color: '#616161' },
  { id: 'rim_scratched', label: 'جنط مخدوش', icon: '〰️', color: '#757575' },
  { id: 'rim_corroded', label: 'جنط متآكل (صدأ)', icon: '🦀', color: '#8D6E63' },
  
  // أعطال المكينة (المحرك) - اللهجة الإماراتية
  { id: 'engine_overheating', label: 'مكينة تسخن زيادة', icon: '🔥', color: '#D32F2F' },
  { id: 'engine_oil_leak', label: 'مكينة تسرب زيت', icon: '💧', color: '#1976D2' },
  { id: 'engine_coolant_leak', label: 'مكينة تسرب ماي راديتر', icon: '💦', color: '#0288D1' },
  { id: 'engine_noise_knocking', label: 'مكينة صوت طرق', icon: '🔨', color: '#F44336' },
  { id: 'engine_noise_rattling', label: 'مكينة صوت خشخشة', icon: '🔊', color: '#E53935' },
  { id: 'engine_smoke_white', label: 'مكينة دخان أبيض', icon: '💨', color: '#BDBDBD' },
  { id: 'engine_smoke_blue', label: 'مكينة دخان أزرق', icon: '💨', color: '#2196F3' },
  { id: 'engine_smoke_black', label: 'مكينة دخان أسود', icon: '💨', color: '#212121' },
  { id: 'engine_misfire', label: 'مكينة تفتفة (خلل احتراق)', icon: '⚡', color: '#FF9800' },
  { id: 'engine_stalling', label: 'مكينة تطفي فجأة', icon: '🛑', color: '#D32F2F' },
  { id: 'engine_rough_idle', label: 'مكينة اهتزاز على فاضي', icon: '📳', color: '#F57C00' },
  { id: 'engine_low_power', label: 'مكينة ضعف أداء', icon: '⬇️', color: '#FF6F00' },
  { id: 'engine_check_light', label: 'مكينة لمبة تحذير شغالة', icon: '⚠️', color: '#FFA000' },
  { id: 'engine_timing_issue', label: 'مكينة مشكلة توقيت', icon: '🕐', color: '#E65100' },
  { id: 'engine_belt_damaged', label: 'مكينة سير تالف', icon: '🔗', color: '#424242' },
  { id: 'engine_spark_plug_issue', label: 'مكينة بواجي خربانة', icon: '⚡', color: '#FF5722' },
  { id: 'engine_fuel_system', label: 'مكينة مشكلة نظام وقود', icon: '⛽', color: '#4CAF50' },
  { id: 'engine_air_filter_dirty', label: 'مكينة فلتر هوا متسخ', icon: '🌫️', color: '#9E9E9E' },
  { id: 'engine_sensor_failure', label: 'مكينة حساس خربان', icon: '📡', color: '#607D8B' },
  { id: 'engine_exhaust_issue', label: 'مكينة مشكلة عادم', icon: '💨', color: '#455A64' },
  { id: 'engine_turbo_failure', label: 'مكينة تيربو خربان', icon: '🌪️', color: '#546E7A' },
  { id: 'engine_gasket_leak', label: 'مكينة جوان يسرب', icon: '💧', color: '#1565C0' },
  { id: 'engine_compression_low', label: 'مكينة ضغط ضعيف', icon: '⬇️', color: '#EF5350' },
  { id: 'engine_starting_issue', label: 'مكينة صعوبة تشغيل', icon: '🔑', color: '#D84315' },
  { id: 'engine_mount_damaged', label: 'مكينة كراسي تالفة', icon: '🪑', color: '#6D4C41' },
] as const;

// درجات العطل
export const SEVERITY_LEVELS = [
  { id: 'light', label: 'خفيف', color: '#52c41a' },
  { id: 'medium', label: 'متوسط', color: '#fa8c16' },
  { id: 'severe', label: 'شديد', color: '#ff4d4f' },
] as const;

// مناطق السيارة على الخريطة
export const VEHICLE_AREAS = [
  { id: 'front', label: 'أمام', viewBox: '0 0 300 200' },
  { id: 'back', label: 'خلف', viewBox: '0 0 300 200' },
  { id: 'left', label: 'يسار', viewBox: '0 0 400 150' },
  { id: 'right', label: 'يمين', viewBox: '0 0 400 150' },
  { id: 'roof', label: 'سقف', viewBox: '0 0 300 400' },
] as const;

// Types
export type VehiclePart = typeof VEHICLE_PARTS[number];
export type DefectType = typeof DEFECT_TYPES[number];
export type SeverityLevel = typeof SEVERITY_LEVELS[number];
export type VehicleArea = typeof VEHICLE_AREAS[number];
