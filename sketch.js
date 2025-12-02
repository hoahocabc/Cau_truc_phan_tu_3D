// --- CẤU HÌNH HỆ THỐNG ---
let currentMoleculeKey = null;
let atoms = [];
let bonds = [];

// Biến tương tác
let rotX = 0, rotY = 0, panX = 0, panY = 0, zoom = 1.0;
let lastX = 0, lastY = 0, isDragging = false;
let isRotating = true, showLabels = true, autoRotationAngle = 0;
let myFont;

// Biến cảm ứng (Touch) - Dành cho Mobile
let touchesStart = []; 
let initialZoom = 1.0;
let initialPanX = 0, initialPanY = 0;
let initialDist = 0;

// Biến ngôn ngữ
let currentLang = 'vi'; 

const SCALE = 70; 

// TỪ ĐIỂN ĐA NGÔN NGỮ
const TRANSLATIONS = {
    vi: {
        headerTitle: "CẤU TRÚC PHÂN TỬ 3D",
        headerSub: "HÓA HỌC ABC",
        placeholder: "-- Chọn phân tử --",
        canvasMsg: "Vui lòng chọn phân tử từ menu",
        btnRotate: "Xoay Tự Động",
        btnLabels: "Nhãn Nguyên Tố",
        keyLeft: "Chuột trái", insLeft: "Xoay góc nhìn",
        keyWheel: "Con lăn", insWheel: "Thu / Phóng",
        keyRight: "Chuột phải", insRight: "Di chuyển",
        btnSave: "Lưu Ảnh",
        resCurrent: "Màn hình hiện tại",
        fmtPNG: "PNG", fmtJPG: "JPG",
        optgroups: {
            "opt-inorganic": "Chất vô cơ", "opt-hydrocarbons": "Hiđrocacbon", "opt-halogen": "Dẫn xuất Halogen",
            "opt-alcohols": "Ancol & Phenol", "opt-aldehydes": "Anđehit & Xeton", "opt-acids": "Axit Cacboxylic",
            "opt-esters": "Este", "opt-amines": "Amin", "opt-carbs": "Cacbohiđrat", "opt-amino-acids": "Amino Acids"
        }
    },
    en: {
        headerTitle: "3D MOLECULAR STRUCTURE",
        headerSub: "HÓA HỌC ABC",
        placeholder: "-- Select Molecule --",
        canvasMsg: "Please select a molecule from the menu",
        btnRotate: "Auto Rotate",
        btnLabels: "Atom Labels",
        keyLeft: "Left Click", insLeft: "Rotate View",
        keyWheel: "Scroll", insWheel: "Zoom In/Out",
        keyRight: "Right Click", insRight: "Pan View",
        btnSave: "Save Image",
        resCurrent: "Current Viewport",
        fmtPNG: "PNG", fmtJPG: "JPG",
        optgroups: {
            "opt-inorganic": "Inorganic substances", "opt-hydrocarbons": "Hydrocarbons", "opt-halogen": "Halogen derivatives",
            "opt-alcohols": "Alcohols & Phenols", "opt-aldehydes": "Aldehydes & Ketones", "opt-acids": "Carboxylic acids",
            "opt-esters": "Esters", "opt-amines": "Amines", "opt-carbs": "Carbohydrates", "opt-amino-acids": "Amino Acids"
        }
    }
};

const ELEMENTS = {
    H:  { color: [255, 255, 255], radius: 18, textColor: [0, 0, 0] },
    C:  { color: [90, 90, 90],    radius: 32, textColor: [255, 255, 255] },
    N:  { color: [48, 80, 248],   radius: 32, textColor: [255, 255, 255] }, 
    O:  { color: [255, 13, 13],   radius: 28, textColor: [255, 255, 255] }, 
    F:  { color: [144, 224, 80], radius: 30, textColor: [0, 0, 0] }, 
    Cl: { color: [31, 240, 31],   radius: 38, textColor: [0, 0, 0] }, 
    S:  { color: [255, 255, 48],   radius: 36, textColor: [0, 0, 0] },
    P:  { color: [255, 128, 0],   radius: 36, textColor: [0, 0, 0] } 
};

// --- DỮ LIỆU PHÂN TỬ ĐẦY ĐỦ (66 CHẤT) ---
const MOLECULE_DATA = {
    // --- INORGANIC ---
    "H2":  { atoms: [{e:"H", x:-0.37, y:0, z:0}, {e:"H", x:0.37, y:0, z:0}], bonds: [[0,1,1]] },
    "N2":  { atoms: [{e:"N", x:-0.65, y:0, z:0}, {e:"N", x:0.65, y:0, z:0}], bonds: [[0,1,3]] },
    "O2":  { atoms: [{e:"O", x:-0.6, y:0, z:0}, {e:"O", x:0.6, y:0, z:0}], bonds: [[0,1,2]] },
    "F2":  { atoms: [{e:"F", x:-0.55, y:0, z:0}, {e:"F", x:0.55, y:0, z:0}], bonds: [[0,1,1]] },
    "Cl2": { atoms: [{e:"Cl", x:-0.8, y:0, z:0}, {e:"Cl", x:0.8, y:0, z:0}], bonds: [[0,1,1]] },
    "CO2": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:-1.16, y:0, z:0}, {e:"O", x:1.16, y:0, z:0}], bonds: [[0,1,2], [0,2,2]] },
    "SO2": { atoms: [{e:"S", x:0, y:0.3, z:0}, {e:"O", x:-1.25, y:-0.5, z:0}, {e:"O", x:1.25, y:-0.5, z:0}], bonds: [[0,1,2], [0,2,2]] }, 
    "HCl": { atoms: [{e:"H", x:-0.64, y:0, z:0}, {e:"Cl", x:0.64, y:0, z:0}], bonds: [[0,1,1]] },
    "H2O": { atoms: [{e:"O", x:0, y:0.15, z:0}, {e:"H", x:0.76, y:-0.45, z:0}, {e:"H", x:-0.76, y:-0.45, z:0}], bonds: [[0,1,1], [0,2,1]] },
    "H2S": { atoms: [{e:"S", x:0, y:0.2, z:0}, {e:"H", x:0.85, y:-0.65, z:0}, {e:"H", x:-0.85, y:-0.65, z:0}], bonds: [[0,1,1], [0,2,1]] },
    "NH3": { atoms: [{e:"N", x:0, y:-0.15, z:0}, {e:"H", x:0, y:0.25, z:0.94}, {e:"H", x:0.81, y:0.25, z:-0.47}, {e:"H", x:-0.81, y:0.25, z:-0.47}], bonds: [[0,1,1], [0,2,1], [0,3,1]] },
    "H2SO4": { atoms: [{e:"S", x:0, y:0, z:0}, {e:"O", x:0.87, y:0.87, z:0.87}, {e:"O", x:-0.87, y:-0.87, z:0.87}, {e:"O", x:0.87, y:-0.87, z:-0.87}, {e:"O", x:-0.87, y:0.87, z:-0.87}, {e:"H", x:1.6, y:-1.2, z:-0.5}, {e:"H", x:-1.6, y:1.2, z:-0.5}], bonds: [[0,1,2], [0,2,2], [0,3,1], [0,4,1], [3,5,1], [4,6,1]] },
    "HNO3": { atoms: [{e:"N", x:0, y:0, z:0}, {e:"O", x:1.2, y:0, z:0}, {e:"O", x:-0.6, y:1.0, z:0}, {e:"O", x:-0.6, y:-1.0, z:0}, {e:"H", x:-1.5, y:1.0, z:0}], bonds: [[0,1,2], [0,2,1], [0,3,2], [2,4,1]] },
    "H3PO4": { atoms: [{e:"P", x:0, y:0, z:0}, {e:"O", x:0, y:1.45, z:0}, {e:"O", x:1.2, y:-0.5, z:0.5}, {e:"O", x:-1.2, y:-0.5, z:0.5}, {e:"O", x:0, y:-0.5, z:-1.3}, {e:"H", x:2.0, y:-0.2, z:0.5}, {e:"H", x:-2.0, y:-0.2, z:0.5}, {e:"H", x:0, y:-0.2, z:-2.1}], bonds: [[0,1,2], [0,2,1], [0,3,1], [0,4,1], [2,5,1], [3,6,1], [4,7,1]] },

    // --- HYDROCARBONS ---
    "CH4": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0.63, y:0.63, z:0.63}, {e:"H", x:-0.63, y:-0.63, z:0.63}, {e:"H", x:-0.63, y:0.63, z:-0.63}, {e:"H", x:0.63, y:-0.63, z:-0.63}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1]] },
    "C2H6": { atoms: [{e:"C", x:-0.76, y:0, z:0}, {e:"C", x:0.76, y:0, z:0}, {e:"H", x:-1.1, y:1.0, z:0}, {e:"H", x:-1.1, y:-0.5, z:0.87}, {e:"H", x:-1.1, y:-0.5, z:-0.87}, {e:"H", x:1.1, y:-1.0, z:0}, {e:"H", x:1.1, y:0.5, z:-0.87}, {e:"H", x:1.1, y:0.5, z:0.87}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [1,5,1], [1,6,1], [1,7,1]] },
    "C3H8": { atoms: [{e:"C", x:0, y:0.4, z:0}, {e:"C", x:-1.4, y:-0.4, z:0}, {e:"C", x:1.4, y:-0.4, z:0}, {e:"H", x:0, y:0.9, z:0.88}, {e:"H", x:0, y:0.9, z:-0.88}, {e:"H", x:-1.4, y:-1.5, z:0}, {e:"H", x:-1.9, y:-0.05, z:0.88}, {e:"H", x:-1.9, y:-0.05, z:-0.88}, {e:"H", x:1.4, y:-1.5, z:0}, {e:"H", x:1.9, y:-0.05, z:0.88}, {e:"H", x:1.9, y:-0.05, z:-0.88}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [1,5,1], [1,6,1], [1,7,1], [2,8,1], [2,9,1], [2,10,1]] },
    "nC4H10": { atoms: [{e:"C", x:-2.1, y:-0.4, z:0}, {e:"C", x:-0.7, y:0.4, z:0}, {e:"C", x:0.7, y:-0.4, z:0}, {e:"C", x:2.1, y:0.4, z:0}, {e:"H", x:-2.1, y:-1.5, z:0}, {e:"H", x:-2.6, y:-0.05, z:0.88}, {e:"H", x:-2.6, y:-0.05, z:-0.88}, {e:"H", x:-0.7, y:0.9, z:0.88}, {e:"H", x:-0.7, y:0.9, z:-0.88}, {e:"H", x:0.7, y:-0.9, z:0.88}, {e:"H", x:0.7, y:-0.9, z:-0.88}, {e:"H", x:2.1, y:1.5, z:0}, {e:"H", x:2.6, y:0.05, z:0.88}, {e:"H", x:2.6, y:0.05, z:-0.88}], bonds: [[0,1,1], [1,2,1], [2,3,1], [0,4,1], [0,5,1], [0,6,1], [1,7,1], [1,8,1], [2,9,1], [2,10,1], [3,11,1], [3,12,1], [3,13,1]] },
    "isoC4H10": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:0, z:1.1}, {e:"C", x:0, y:1.4, z:-0.5}, {e:"C", x:1.2, y:-0.7, z:-0.5}, {e:"C", x:-1.2, y:-0.7, z:-0.5}, {e:"H", x:0, y:1.5, z:-1.6}, {e:"H", x:0.9, y:1.9, z:-0.1}, {e:"H", x:-0.9, y:1.9, z:-0.1}, {e:"H", x:1.3, y:-0.7, z:-1.6}, {e:"H", x:2.1, y:-0.3, z:-0.1}, {e:"H", x:1.3, y:-1.7, z:-0.1}, {e:"H", x:-1.3, y:-0.7, z:-1.6}, {e:"H", x:-2.1, y:-0.3, z:-0.1}, {e:"H", x:-1.3, y:-1.7, z:-0.1}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [2,5,1], [2,6,1], [2,7,1], [3,8,1], [3,9,1], [3,10,1], [4,11,1], [4,12,1], [4,13,1]] },
    "C2H4": { atoms: [{e:"C", x:-0.67, y:0, z:0}, {e:"C", x:0.67, y:0, z:0}, {e:"H", x:-1.25, y:0.92, z:0}, {e:"H", x:-1.25, y:-0.92, z:0}, {e:"H", x:1.25, y:0.92, z:0}, {e:"H", x:1.25, y:-0.92, z:0}], bonds: [[0,1,2], [0,2,1], [0,3,1], [1,4,1], [1,5,1]] },
    "C2H2": { atoms: [{e:"C", x:-0.6, y:0, z:0}, {e:"C", x:0.6, y:0, z:0}, {e:"H", x:-1.66, y:0, z:0}, {e:"H", x:1.66, y:0, z:0}], bonds: [[0,1,3], [0,2,1], [1,3,1]] },
    "C3H6_open": { atoms: [{e:"C", x:-1.2, y:-0.3, z:0}, {e:"C", x:0, y:0.4, z:0}, {e:"C", x:1.3, y:-0.1, z:0}, {e:"H", x:-1.2, y:-1.4, z:0}, {e:"H", x:-2.1, y:0.2, z:0}, {e:"H", x:0, y:1.5, z:0}, {e:"H", x:1.3, y:-1.2, z:0}, {e:"H", x:1.9, y:0.3, z:0.9}, {e:"H", x:1.9, y:0.3, z:-0.9}], bonds: [[0,1,2], [1,2,1], [0,3,1], [0,4,1], [1,5,1], [2,6,1], [2,7,1], [2,8,1]] },
    "C3H6_ring": { atoms: [{e:"C", x:0, y:1.0, z:0}, {e:"C", x:0.87, y:-0.5, z:0}, {e:"C", x:-0.87, y:-0.5, z:0}, {e:"H", x:0, y:1.3, z:0.9}, {e:"H", x:0, y:1.3, z:-0.9}, {e:"H", x:1.1, y:-0.7, z:0.9}, {e:"H", x:1.1, y:-0.7, z:-0.9}, {e:"H", x:-1.1, y:-0.7, z:0.9}, {e:"H", x:-1.1, y:-0.7, z:-0.9}], bonds: [[0,1,1], [1,2,1], [2,0,1], [0,3,1], [0,4,1], [1,5,1], [1,6,1], [2,7,1], [2,8,1]] },
    "cis_but_2_ene": { atoms: [{e:"C", x:-0.67, y:0, z:0}, {e:"C", x:0.67, y:0, z:0}, {e:"C", x:-1.5, y:1.2, z:0}, {e:"C", x:1.5, y:1.2, z:0}, {e:"H", x:-1.2, y:-0.9, z:0}, {e:"H", x:1.2, y:-0.9, z:0}, {e:"H", x:-1.2, y:1.8, z:0.9}, {e:"H", x:-1.2, y:1.8, z:-0.9}, {e:"H", x:-2.5, y:0.9, z:0}, {e:"H", x:1.2, y:1.8, z:0.9}, {e:"H", x:1.2, y:1.8, z:-0.9}, {e:"H", x:2.5, y:0.9, z:0}], bonds: [[0,1,2], [0,2,1], [0,4,1], [1,3,1], [1,5,1], [2,6,1], [2,7,1], [2,8,1], [3,9,1], [3,10,1], [3,11,1]]},
    "trans_but_2_ene": { atoms: [{e:"C", x:-0.67, y:0, z:0}, {e:"C", x:0.67, y:0, z:0}, {e:"C", x:-1.5, y:1.2, z:0}, {e:"C", x:1.5, y:-1.2, z:0}, {e:"H", x:-1.2, y:-0.9, z:0}, {e:"H", x:1.2, y:0.9, z:0}, {e:"H", x:-1.2, y:1.8, z:0.9}, {e:"H", x:-1.2, y:1.8, z:-0.9}, {e:"H", x:-2.5, y:0.9, z:0}, {e:"H", x:1.2, y:-1.8, z:0.9}, {e:"H", x:1.2, y:-1.8, z:-0.9}, {e:"H", x:2.5, y:-0.9, z:0}], bonds: [[0,1,2], [0,2,1], [0,4,1], [1,3,1], [1,5,1], [2,6,1], [2,7,1], [2,8,1], [3,9,1], [3,10,1], [3,11,1]]},
    "but_1_3_diene": { atoms: [{e:"C", x:-1.9, y:-0.5, z:0}, {e:"C", x:-0.7, y:0.2, z:0}, {e:"C", x:0.7, y:-0.2, z:0}, {e:"C", x:1.9, y:0.5, z:0}, {e:"H", x:-1.9, y:-1.5, z:0}, {e:"H", x:-2.8, y:-0.0, z:0}, {e:"H", x:-0.7, y:1.2, z:0}, {e:"H", x:0.7, y:-1.2, z:0}, {e:"H", x:1.9, y:1.5, z:0}, {e:"H", x:2.8, y:0.0, z:0}], bonds: [[0,1,2], [1,2,1], [2,3,2], [0,4,1], [0,5,1], [1,6,1], [2,7,1], [3,8,1], [3,9,1]]},
    "isoprene": { atoms: [{e:"C", x:-1.9, y:-0.5, z:0}, {e:"C", x:-0.7, y:0.2, z:0}, {e:"C", x:0.7, y:-0.2, z:0}, {e:"C", x:1.9, y:0.5, z:0}, {e:"C", x:-0.7, y:1.7, z:0}, {e:"H", x:-1.9, y:-1.5, z:0}, {e:"H", x:-2.8, y:-0.0, z:0}, {e:"H", x:0.7, y:-1.2, z:0}, {e:"H", x:1.9, y:1.5, z:0}, {e:"H", x:2.8, y:0.0, z:0}, {e:"H", x:-1.7, y:2.1, z:0}, {e:"H", x:-0.2, y:2.1, z:0.9}, {e:"H", x:-0.2, y:2.1, z:-0.9}], bonds: [[0,1,2], [1,2,1], [2,3,2], [1,4,1], [0,5,1], [0,6,1], [2,7,1], [3,8,1], [3,9,1], [4,10,1], [4,11,1], [4,12,1]]},
    "C6H6": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"H", x:2.48, y:0, z:0}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [0,6,1], [1,7,1], [2,8,1], [3,9,1], [4,10,1], [5,11,1]] },
    "C6H5CH3": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"C", x:2.9, y:0, z:0}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}, {e:"H", x:3.3, y:1.0, z:0}, {e:"H", x:3.3, y:-0.5, z:0.87}, {e:"H", x:3.3, y:-0.5, z:-0.87}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [0,6,1], [1,7,1], [2,8,1], [3,9,1], [4,10,1], [5,11,1], [6,12,1], [6,13,1], [6,14,1]] },
    "styrene": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}, {e:"C", x:2.8, y:0, z:0}, {e:"H", x:3.3, y:-0.9, z:0}, {e:"C", x:3.6, y:1.1, z:0}, {e:"H", x:3.2, y:2.1, z:0}, {e:"H", x:4.7, y:1.0, z:0}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [1,6,1], [2,7,1], [3,8,1], [4,9,1], [5,10,1], [0,11,1], [11,12,1], [11,13,2], [13,14,1], [13,15,1]] },

    // --- HALOGEN DERIVATIVES ---
    "CH3Cl": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"Cl", x:0, y:1.5, z:0}, {e:"H", x:0.96, y:-0.5, z:0}, {e:"H", x:-0.48, y:-0.5, z:0.84}, {e:"H", x:-0.48, y:-0.5, z:-0.84}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1]] },
    "C2H5Cl": { atoms: [{e:"C", x:-0.8, y:0, z:0}, {e:"C", x:0.7, y:0, z:0}, {e:"H", x:-1.15, y:1.03, z:0}, {e:"H", x:-1.15, y:-0.51, z:0.89}, {e:"H", x:-1.15, y:-0.51, z:-0.89}, {e:"Cl", x:1.4, y:-1.2, z:0}, {e:"H", x:1.1, y:0.5, z:0.89}, {e:"H", x:1.1, y:0.5, z:-0.89}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [1,5,1], [1,6,1], [1,7,1]] },

    // --- ALCOHOLS & PHENOLS ---
    "CH3OH": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:1.42, y:0, z:0}, {e:"H", x:-0.37, y:1.03, z:0}, {e:"H", x:-0.37, y:-0.51, z:0.89}, {e:"H", x:-0.37, y:-0.51, z:-0.89}, {e:"H", x:1.7, y:0.8, z:0}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [1,5,1]] },
    "C2H5OH": { atoms: [{e:"C", x:-1.2, y:0.5, z:0}, {e:"C", x:0, y:-0.3, z:0}, {e:"O", x:1.2, y:0.5, z:0}, {e:"H", x:-1.2, y:1.55, z:0}, {e:"H", x:-1.7, y:0.15, z:0.89}, {e:"H", x:-1.7, y:0.15, z:-0.89}, {e:"H", x:0, y:-0.95, z:0.89}, {e:"H", x:0, y:-0.95, z:-0.89}, {e:"H", x:1.9, y:0.0, z:0}], bonds: [[0,1,1], [1,2,1], [0,3,1], [0,4,1], [0,5,1], [1,6,1], [1,7,1], [2,8,1]] },
    "C3H5(OH)3": { atoms: [{e:"C", x:-1.5, y:0, z:0}, {e:"C", x:0, y:0.8, z:0}, {e:"C", x:1.5, y:0, z:0}, {e:"H", x:-1.5, y:-0.6, z:0.9}, {e:"H", x:-1.5, y:-0.6, z:-0.9}, {e:"H", x:0, y:1.4, z:0.9}, {e:"H", x:1.5, y:-0.6, z:0.9}, {e:"H", x:1.5, y:-0.6, z:-0.9}, {e:"O", x:-2.6, y:0.8, z:0}, {e:"H", x:-3.3, y:0.3, z:0}, {e:"O", x:0, y:1.6, z:-1.2}, {e:"H", x:0.8, y:2.0, z:-1.2}, {e:"O", x:2.6, y:0.8, z:0}, {e:"H", x:3.3, y:0.3, z:0}], bonds: [[0,1,1], [1,2,1], [0,3,1], [0,4,1], [0,8,1], [8,9,1], [1,5,1], [1,10,1], [10,11,1], [2,6,1], [2,7,1], [2,12,1], [12,13,1]]},
    "C6H5OH": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"O", x:2.7, y:0, z:0}, {e:"H", x:3.1, y:0.8, z:0}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [0,6,1], [6,7,1], [1,8,1], [2,9,1], [3,10,1], [4,11,1], [5,12,1]] },

    // --- ALDEHYDES & KETONES ---
    "HCHO": { atoms: [{e:"C", x:0, y:0.2, z:0}, {e:"O", x:0, y:-1.0, z:0}, {e:"H", x:0.96, y:0.75, z:0}, {e:"H", x:-0.96, y:0.75, z:0}], bonds: [[0,1,2], [0,2,1], [0,3,1]] },
    "CH3CHO": { atoms: [{e:"C", x:-0.6, y:-0.2, z:0}, {e:"C", x:0.8, y:0.3, z:0}, {e:"O", x:-1.6, y:0.3, z:0}, {e:"H", x:-0.6, y:-1.3, z:0}, {e:"H", x:0.9, y:1.4, z:0}, {e:"H", x:1.3, y:-0.05, z:0.88}, {e:"H", x:1.3, y:-0.05, z:-0.88}], bonds: [[0,1,1], [0,2,2], [0,3,1], [1,4,1], [1,5,1], [1,6,1]] },
    "CH3COCH3": { atoms: [{e:"C", x:0, y:0.4, z:0}, {e:"O", x:0, y:1.6, z:0}, {e:"C", x:-1.4, y:-0.4, z:0}, {e:"C", x:1.4, y:-0.4, z:0}, {e:"H", x:-1.4, y:-1.5, z:0}, {e:"H", x:-1.9, y:-0.05, z:0.88}, {e:"H", x:-1.9, y:-0.05, z:-0.88}, {e:"H", x:1.4, y:-1.5, z:0}, {e:"H", x:1.9, y:-0.05, z:0.88}, {e:"H", x:1.9, y:-0.05, z:-0.88}], bonds: [[0,1,2], [0,2,1], [0,3,1], [2,4,1], [2,5,1], [2,6,1], [3,7,1], [3,8,1], [3,9,1]] },

    // --- CARBOXYLIC ACIDS ---
    "HCOOH": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:0, y:1.2, z:0}, {e:"O", x:1.2, y:-0.5, z:0}, {e:"H", x:2.0, y:-0.1, z:0}, {e:"H", x:-1.0, y:-0.5, z:0}], bonds: [[0,1,2], [0,2,1], [2,3,1], [0,4,1]] },
    "CH3COOH": { atoms: [{e:"C", x:0.6, y:0, z:0}, {e:"C", x:-0.8, y:0, z:0}, {e:"O", x:1.2, y:1.1, z:0}, {e:"O", x:1.3, y:-1.1, z:0}, {e:"H", x:2.2, y:-0.9, z:0}, {e:"H", x:-1.2, y:1.0, z:0}, {e:"H", x:-1.2, y:-0.5, z:0.87}, {e:"H", x:-1.2, y:-0.5, z:-0.87}], bonds: [[0,1,1], [0,2,2], [0,3,1], [3,4,1], [1,5,1], [1,6,1], [1,7,1]] },
    "oxalic_acid": { atoms: [{e:"C", x:-0.7, y:0, z:0}, {e:"C", x:0.7, y:0, z:0}, {e:"O", x:-1.3, y:1.1, z:0}, {e:"O", x:-1.4, y:-1.1, z:0}, {e:"H", x:-2.3, y:-0.9, z:0}, {e:"O", x:1.3, y:-1.1, z:0}, {e:"O", x:1.4, y:1.1, z:0}, {e:"H", x:2.3, y:0.9, z:0}], bonds: [[0,1,1], [0,2,2], [0,3,1], [3,4,1], [1,5,2], [1,6,1], [6,7,1]] },
    "malonic_acid": { atoms: [{e:"C", x:0, y:0.5, z:0}, {e:"H", x:0, y:1.0, z:0.89}, {e:"H", x:0, y:1.0, z:-0.89}, {e:"C", x:-1.3, y:-0.4, z:0}, {e:"O", x:-1.3, y:-1.6, z:0}, {e:"O", x:-2.5, y:0.2, z:0}, {e:"H", x:-3.2, y:-0.4, z:0}, {e:"C", x:1.3, y:-0.4, z:0}, {e:"O", x:1.3, y:-1.6, z:0}, {e:"O", x:2.5, y:0.2, z:0}, {e:"H", x:3.2, y:-0.4, z:0}], bonds: [[0,3,1], [0,7,1], [0,1,1], [0,2,1], [3,4,2], [3,5,1], [5,6,1], [7,8,2], [7,9,1], [9,10,1]] },
    "succinic_acid": { atoms: [{e:"C", x:-0.7, y:0.5, z:0}, {e:"C", x:0.7, y:-0.5, z:0}, {e:"H", x:-0.7, y:1.0, z:0.89}, {e:"H", x:-0.7, y:1.0, z:-0.89}, {e:"H", x:0.7, y:-1.0, z:0.89}, {e:"H", x:0.7, y:-1.0, z:-0.89}, {e:"C", x:-2.0, y:-0.4, z:0}, {e:"O", x:-2.0, y:-1.6, z:0}, {e:"O", x:-3.2, y:0.2, z:0}, {e:"H", x:-3.9, y:-0.4, z:0}, {e:"C", x:2.0, y:0.4, z:0}, {e:"O", x:2.0, y:1.6, z:0}, {e:"O", x:3.2, y:-0.2, z:0}, {e:"H", x:3.9, y:0.4, z:0}], bonds: [[0,1,1], [0,6,1], [1,10,1], [0,2,1], [0,3,1], [1,4,1], [1,5,1], [6,7,2], [6,8,1], [8,9,1], [10,11,2], [10,12,1], [12,13,1]] },
    "citric_acid": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:0, y:1.4, z:0}, {e:"H", x:0.8, y:1.6, z:0}, {e:"C", x:-1.2, y:-0.8, z:-0.8}, {e:"O", x:-1.4, y:-0.6, z:-1.9}, {e:"O", x:-2.0, y:-1.5, z:-0.2}, {e:"H", x:-2.7, y:-1.9, z:-0.6}, {e:"C", x:1.2, y:-0.8, z:-0.8}, {e:"H", x:1.0, y:-1.8, z:-0.8}, {e:"H", x:1.5, y:-0.5, z:-1.8}, {e:"C", x:2.5, y:-0.5, z:0.1}, {e:"O", x:3.0, y:0.6, z:0.1}, {e:"O", x:3.0, y:-1.5, z:0.8}, {e:"H", x:3.8, y:-1.3, z:1.2}, {e:"C", x:0, y:-0.5, z:1.4}, {e:"H", x:-0.9, y:-0.3, z:1.9}, {e:"H", x:0.9, y:-0.3, z:1.9}, {e:"C", x:0, y:-2.0, z:1.6}, {e:"O", x:-1.0, y:-2.6, z:1.8}, {e:"O", x:1.1, y:-2.6, z:1.8}, {e:"H", x:1.0, y:-3.5, z:1.9}], bonds: [[0,1,1], [1,2,1], [0,3,1], [3,4,2], [3,5,1], [5,6,1], [0,7,1], [7,8,1], [7,9,1], [7,10,1], [10,11,2], [10,12,1], [12,13,1], [0,14,1], [14,15,1], [14,16,1], [14,17,1], [17,18,2], [17,19,1], [19,20,1]] },
    "benzoic_acid": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}, {e:"C", x:2.9, y:0, z:0}, {e:"O", x:3.6, y:1.1, z:0}, {e:"O", x:3.5, y:-1.1, z:0}, {e:"H", x:4.4, y:-1.0, z:0}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [1,6,1], [2,7,1], [3,8,1], [4,9,1], [5,10,1], [0,11,1], [11,12,2], [11,13,1], [13,14,1]] },
    "CH2=CHCOOH": { atoms: [{e:"C", x:-1.8, y:-0.5, z:0}, {e:"C", x:-0.6, y:0.2, z:0}, {e:"C", x:0.7, y:-0.2, z:0}, {e:"O", x:1.1, y:-1.3, z:0}, {e:"O", x:1.6, y:0.8, z:0}, {e:"H", x:-1.9, y:-1.5, z:0}, {e:"H", x:-2.7, y:0.1, z:0}, {e:"H", x:-0.5, y:1.2, z:0}, {e:"H", x:2.5, y:0.5, z:0}], bonds: [[0,1,2], [1,2,1], [2,3,2], [2,4,1], [0,5,1], [0,6,1], [1,7,1], [4,8,1]] },
    "lactic_acid": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.1, z:0}, {e:"C", x:-1.4, y:-0.5, z:0.5}, {e:"O", x:0.8, y:-0.5, z:1.0}, {e:"C", x:0.5, y:-0.3, z:-1.4}, {e:"H", x:0.5, y:0, z:1.8}, {e:"H", x:-2.1, y:0.1, z:0.1}, {e:"H", x:-1.4, y:-1.5, z:0.1}, {e:"H", x:-1.6, y:-0.4, z:1.6}, {e:"O", x:1.5, y:0.3, z:-1.8}, {e:"O", x:-0.2, y:-1.1, z:-2.1}, {e:"H", x:0.2, y:-1.3, z:-2.9}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [3,5,1], [2,6,1], [2,7,1], [2,8,1], [4,9,2], [4,10,1], [10,11,1]]},

    // --- ESTERS ---
    "HCOOCH3": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:0, y:1.2, z:0}, {e:"O", x:1.1, y:-0.5, z:0}, {e:"H", x:-0.9, y:-0.5, z:0}, {e:"C", x:2.3, y:0.2, z:0}, {e:"H", x:3.1, y:-0.4, z:0}, {e:"H", x:2.3, y:0.8, z:0.9}, {e:"H", x:2.3, y:0.8, z:-0.9}], bonds: [[0,1,2], [0,2,1], [0,3,1], [2,4,1], [4,5,1], [4,6,1], [4,7,1]] },
    "CH3COOCH3": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:0, y:1.2, z:0}, {e:"O", x:1.1, y:-0.5, z:0}, {e:"C", x:-1.3, y:-0.6, z:0}, {e:"C", x:2.3, y:0.2, z:0}, {e:"H", x:-1.3, y:-1.7, z:0}, {e:"H", x:-1.8, y:-0.2, z:0.9}, {e:"H", x:-1.8, y:-0.2, z:-0.9}, {e:"H", x:3.1, y:-0.4, z:0}, {e:"H", x:2.3, y:0.8, z:0.9}, {e:"H", x:2.3, y:0.8, z:-0.9}], bonds: [[0,1,2], [0,2,1], [0,3,1], [3,5,1], [3,6,1], [3,7,1], [2,4,1], [4,8,1], [4,9,1], [4,10,1]] },
    "CH3COOC2H5": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"O", x:0, y:1.2, z:0}, {e:"O", x:1.1, y:-0.5, z:0}, {e:"C", x:-1.3, y:-0.6, z:0}, {e:"C", x:2.4, y:0.1, z:0}, {e:"C", x:3.6, y:-0.8, z:0}, {e:"H", x:-1.3, y:-1.7, z:0}, {e:"H", x:-1.8, y:-0.2, z:0.9}, {e:"H", x:-1.8, y:-0.2, z:-0.9}, {e:"H", x:2.4, y:0.7, z:0.9}, {e:"H", x:2.4, y:0.7, z:-0.9}, {e:"H", x:3.6, y:-1.4, z:0.9}, {e:"H", x:3.6, y:-1.4, z:-0.9}, {e:"H", x:4.5, y:-0.2, z:0}], bonds: [[0,1,2], [0,2,1], [0,3,1], [3,6,1], [3,7,1], [3,8,1], [2,4,1], [4,5,1], [4,9,1], [4,10,1], [5,11,1], [5,12,1], [5,13,1]] },
    "isoamyl_acetate": { atoms: [{e:"C", x:-3.2, y:0.3, z:0}, {e:"O", x:-3.2, y:1.5, z:0}, {e:"O", x:-2.1, y:-0.4, z:0}, {e:"C", x:-4.5, y:-0.5, z:0}, {e:"H", x:-4.5, y:-1.6, z:0}, {e:"H", x:-5.0, y:-0.1, z:0.9}, {e:"H", x:-5.0, y:-0.1, z:-0.9}, {e:"C", x:-0.8, y:-0.1, z:0}, {e:"H", x:-0.8, y:1.0, z:0}, {e:"H", x:-0.5, y:-0.4, z:0.9}, {e:"C", x:0.5, y:-0.8, z:-0.5}, {e:"H", x:0.2, y:-1.8, z:-0.5}, {e:"H", x:0.5, y:-0.4, z:-1.5}, {e:"C", x:1.8, y:-0.1, z:0}, {e:"H", x:1.8, y:-0.1, z:1.1}, {e:"C", x:1.8, y:1.4, z:0}, {e:"H", x:1.3, y:1.8, z:-0.9}, {e:"H", x:2.8, y:1.8, z:0}, {e:"H", x:1.3, y:1.8, z:0.9}, {e:"C", x:3.1, y:-0.7, z:-0.5}, {e:"H", x:3.1, y:-1.8, z:-0.5}, {e:"H", x:3.6, y:-0.3, z:0.4}, {e:"H", x:3.6, y:-0.3, z:-1.4}], bonds: [[0,1,2], [0,2,1], [0,3,1], [3,4,1], [3,5,1], [3,6,1], [2,7,1], [7,10,1], [7,8,1], [7,9,1], [10,13,1], [10,11,1], [10,12,1], [13,15,1], [13,19,1], [13,14,1], [15,16,1], [15,17,1], [15,18,1], [19,20,1], [19,21,1], [19,22,1]] },

    // --- AMINES ---
    "CH3NH2": { atoms: [{e:"C", x:-0.7, y:0, z:0}, {e:"N", x:0.7, y:0, z:0}, {e:"H", x:-1.1, y:1.0, z:0}, {e:"H", x:-1.1, y:-0.5, z:0.87}, {e:"H", x:-1.1, y:-0.5, z:-0.87}, {e:"H", x:1.0, y:-0.4, z:0.8}, {e:"H", x:1.0, y:-0.4, z:-0.8}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,4,1], [1,5,1], [1,6,1]] },
    "C2H5NH2": { atoms: [{e:"C", x:-1.5, y:0.2, z:0}, {e:"C", x:-0.2, y:-0.5, z:0}, {e:"N", x:1.0, y:0.1, z:0}, {e:"H", x:-1.5, y:1.3, z:0}, {e:"H", x:-2.3, y:-0.2, z:0.9}, {e:"H", x:-2.3, y:-0.2, z:-0.9}, {e:"H", x:-0.2, y:-1.1, z:0.9}, {e:"H", x:-0.2, y:-1.1, z:-0.9}, {e:"H", x:1.8, y:-0.4, z:0}, {e:"H", x:1.1, y:0.4, z:0.9}], bonds: [[0,1,1], [1,2,1], [0,3,1], [0,4,1], [0,5,1], [1,6,1], [1,7,1], [2,8,1], [2,9,1]] },
    "CH3NHCH3": { atoms: [{e:"N", x:0, y:0.5, z:0}, {e:"H", x:0, y:-0.2, z:-1.0}, {e:"C", x:-1.3, y:-0.3, z:0.7}, {e:"H", x:-1.3, y:-1.4, z:0.7}, {e:"H", x:-1.8, y:0.1, z:1.5}, {e:"H", x:-2.0, y:-0.1, z:-0.1}, {e:"C", x:1.3, y:-0.3, z:0.7}, {e:"H", x:1.3, y:-1.4, z:0.7}, {e:"H", x:1.8, y:0.1, z:1.5}, {e:"H", x:2.0, y:-0.1, z:-0.1}], bonds: [[0,1,1], [0,2,1], [0,6,1], [2,3,1], [2,4,1], [2,5,1], [6,7,1], [6,8,1], [6,9,1]] },
    "(CH3)3N": { atoms: [{e:"N", x:0, y:0.4, z:0}, {e:"C", x:0, y:-0.2, z:1.38}, {e:"C", x:1.2, y:-0.2, z:-0.7}, {e:"C", x:-1.2, y:-0.2, z:-0.7}, {e:"H", x:0, y:-1.3, z:1.4}, {e:"H", x:0.9, y:0.1, z:1.9}, {e:"H", x:-0.9, y:0.1, z:1.9}, {e:"H", x:1.3, y:-1.3, z:-0.7}, {e:"H", x:2.1, y:0.2, z:-0.3}, {e:"H", x:1.2, y:0.1, z:-1.7}, {e:"H", x:-1.3, y:-1.3, z:-0.7}, {e:"H", x:-2.1, y:0.2, z:-0.3}, {e:"H", x:-1.2, y:0.1, z:-1.7}], bonds: [[0,1,1], [0,2,1], [0,3,1], [1,4,1], [1,5,1], [1,6,1], [2,7,1], [2,8,1], [2,9,1], [3,10,1], [3,11,1], [3,12,1]] },
    "C6H5NH2": { atoms: [{e:"C", x:1.4, y:0, z:0}, {e:"C", x:0.7, y:1.21, z:0}, {e:"C", x:-0.7, y:1.21, z:0}, {e:"C", x:-1.4, y:0, z:0}, {e:"C", x:-0.7, y:-1.21, z:0}, {e:"C", x:0.7, y:-1.21, z:0}, {e:"N", x:2.8, y:0, z:0.2}, {e:"H", x:3.3, y:0.8, z:0.6}, {e:"H", x:3.3, y:-0.8, z:0.6}, {e:"H", x:1.24, y:2.15, z:0}, {e:"H", x:-1.24, y:2.15, z:0}, {e:"H", x:-2.48, y:0, z:0}, {e:"H", x:-1.24, y:-2.15, z:0}, {e:"H", x:1.24, y:-2.15, z:0}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [0,6,1], [6,7,1], [6,8,1], [1,9,1], [2,10,1], [3,11,1], [4,12,1], [5,13,1]] },

    // --- CARBOHYDRATES ---
    "alpha_glucose": { atoms: [{e:"O", x:0.9, y:-0.5, z:-0.5}, {e:"C", x:1.1, y:0.7, z:0.2}, {e:"C", x:0, y:1.3, z:-0.6}, {e:"C", x:-1.1, y:0.7, z:0.2}, {e:"C", x:-1.1, y:-0.7, z:-0.4}, {e:"C", x:0, y:-1.2, z:0.4}, {e:"C", x:-0.1, y:-2.7, z:0.0}, {e:"O", x:-0.2, y:-3.3, z:1.3}, {e:"O", x:1.3, y:0.8, z:1.6}, {e:"O", x:0, y:2.7, z:-0.4}, {e:"O", x:-2.3, y:1.3, z:-0.2}, {e:"O", x:-2.3, y:-1.1, z:0.2}, {e:"H", x:2.0, y:1.0, z:-0.3}, {e:"H", x:0, y:1.1, z:-1.7}, {e:"H", x:-1.1, y:0.7, z:1.3}, {e:"H", x:-1.1, y:-0.7, z:-1.5}, {e:"H", x:0, y:-1.0, z:1.5}, {e:"H", x:0.8, y:-3.0, z:-0.5}, {e:"H", x:-1.0, y:-3.0, z:-0.5}, {e:"H", x:2.1, y:0.4, z:1.8}, {e:"H", x:0.8, y:3.1, z:-0.1}, {e:"H", x:-3.0, y:0.9, z:0.3}, {e:"H", x:-2.5, y:-0.4, z:0.8}, {e:"H", x:-1.0, y:-3.1, z:1.8}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [5,6,1], [6,7,1], [1,8,1], [2,9,1], [3,10,1], [4,11,1], [1,12,1], [2,13,1], [3,14,1], [4,15,1], [5,16,1], [6,17,1], [6,18,1], [8,19,1], [9,20,1], [10,21,1], [11,22,1], [7,23,1]] },
    "beta_glucose": { atoms: [{e:"O", x:0.9, y:-0.5, z:-0.5}, {e:"C", x:1.1, y:0.7, z:0.2}, {e:"C", x:0, y:1.3, z:-0.6}, {e:"C", x:-1.1, y:0.7, z:0.2}, {e:"C", x:-1.1, y:-0.7, z:-0.4}, {e:"C", x:0, y:-1.2, z:0.4}, {e:"C", x:-0.1, y:-2.7, z:0.0}, {e:"O", x:-0.2, y:-3.3, z:1.3}, {e:"O", x:2.3, y:0.9, z:-0.4}, {e:"O", x:0, y:2.7, z:-0.4}, {e:"O", x:-2.3, y:1.3, z:-0.2}, {e:"O", x:-2.3, y:-1.1, z:0.2}, {e:"H", x:1.1, y:0.7, z:1.3}, {e:"H", x:0, y:1.1, z:-1.7}, {e:"H", x:-1.1, y:0.7, z:1.3}, {e:"H", x:-1.1, y:-0.7, z:-1.5}, {e:"H", x:0, y:-1.0, z:1.5}, {e:"H", x:0.8, y:-3.0, z:-0.5}, {e:"H", x:-1.0, y:-3.0, z:-0.5}, {e:"H", x:3.0, y:0.3, z:0.0}, {e:"H", x:0.8, y:3.1, z:-0.1}, {e:"H", x:-3.0, y:0.9, z:0.3}, {e:"H", x:-2.5, y:-0.4, z:0.8}, {e:"H", x:-1.0, y:-3.1, z:1.8}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,5,1], [5,0,1], [5,6,1], [6,7,1], [1,8,1], [2,9,1], [3,10,1], [4,11,1], [1,12,1], [2,13,1], [3,14,1], [4,15,1], [5,16,1], [6,17,1], [6,18,1], [8,19,1], [9,20,1], [10,21,1], [11,22,1], [7,23,1]] },
    "alpha_fructose": { atoms: [{e:"O", x:0, y:-1.0, z:-0.5}, {e:"C", x:1.0, y:0, z:0}, {e:"C", x:0.3, y:1.3, z:0.3}, {e:"C", x:-0.8, y:1.1, z:-0.4}, {e:"C", x:-1.1, y:-0.3, z:0.2}, {e:"C", x:2.2, y:-0.5, z:0.6}, {e:"O", x:3.2, y:0.4, z:0.8}, {e:"C", x:-2.4, y:-0.8, z:-0.4}, {e:"O", x:-3.4, y:-0.2, z:0.3}, {e:"O", x:1.4, y:0.3, z:-1.4}, {e:"O", x:0.6, y:2.5, z:-0.4}, {e:"O", x:-1.5, y:1.8, z:0.5}, {e:"H", x:0.2, y:1.3, z:1.4}, {e:"H", x:-0.6, y:1.1, z:-1.5}, {e:"H", x:-1.2, y:-0.3, z:1.3}, {e:"H", x:1.9, y:-0.9, z:1.6}, {e:"H", x:2.5, y:-1.3, z:0.0}, {e:"H", x:-2.3, y:-1.9, z:-0.3}, {e:"H", x:-2.7, y:-0.6, z:-1.4}, {e:"H", x:3.8, y:0.1, z:0.1}, {e:"H", x:2.3, y:0.6, z:-1.5}, {e:"H", x:1.5, y:2.5, z:-0.7}, {e:"H", x:-1.1, y:2.7, z:0.3}, {e:"H", x:-3.1, y:-0.3, z:1.2}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,0,1], [1,5,1], [5,6,1], [4,7,1], [7,8,1], [1,9,1], [2,10,1], [3,11,1], [2,12,1], [3,13,1], [4,14,1], [5,15,1], [5,16,1], [7,17,1], [7,18,1], [6,19,1], [9,20,1], [10,21,1], [11,22,1], [8,23,1]] },
    "beta_fructose": { atoms: [{e:"O", x:0, y:-1.0, z:-0.5}, {e:"C", x:1.0, y:0, z:0}, {e:"C", x:0.3, y:1.3, z:0.3}, {e:"C", x:-0.8, y:1.1, z:-0.4}, {e:"C", x:-1.1, y:-0.3, z:0.2}, {e:"C", x:2.2, y:-0.5, z:-0.6}, {e:"O", x:3.2, y:0.4, z:-0.8}, {e:"C", x:-2.4, y:-0.8, z:-0.4}, {e:"O", x:-3.4, y:-0.2, z:0.3}, {e:"O", x:1.4, y:0.3, z:1.4}, {e:"O", x:0.6, y:2.5, z:-0.4}, {e:"O", x:-1.5, y:1.8, z:0.5}, {e:"H", x:0.2, y:1.3, z:1.4}, {e:"H", x:-0.6, y:1.1, z:-1.5}, {e:"H", x:-1.2, y:-0.3, z:1.3}, {e:"H", x:1.9, y:-0.9, z:-1.6}, {e:"H", x:2.5, y:-1.3, z:0.0}, {e:"H", x:-2.3, y:-1.9, z:-0.3}, {e:"H", x:-2.7, y:-0.6, z:-1.4}, {e:"H", x:3.8, y:0.1, z:-0.1}, {e:"H", x:2.3, y:0.6, z:1.2}, {e:"H", x:1.5, y:2.5, z:-0.7}, {e:"H", x:-1.1, y:2.8, z:0.3}, {e:"H", x:-3.1, y:-0.3, z:1.2}], bonds: [[0,1,1], [1,2,1], [2,3,1], [3,4,1], [4,0,1], [1,5,1], [5,6,1], [4,7,1], [7,8,1], [1,9,1], [2,10,1], [3,11,1], [2,12,1], [3,13,1], [4,14,1], [5,15,1], [5,16,1], [7,17,1], [7,18,1], [6,19,1], [9,20,1], [10,21,1], [11,22,1], [8,23,1]] },

    // --- AMINO ACIDS ---
    "Gly": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.1, z:0}, {e:"H", x:0, y:-0.5, z:1.0}, {e:"N", x:-1.4, y:-0.2, z:-0.5}, {e:"H", x:-1.7, y:0.6, z:-0.8}, {e:"H", x:-2.0, y:-0.8, z:-0.2}, {e:"C", x:1.2, y:-0.4, z:-0.8}, {e:"O", x:1.4, y:-1.5, z:-1.0}, {e:"O", x:2.0, y:0.6, z:-1.2}, {e:"H", x:2.8, y:0.3, z:-1.4}], bonds: [[0,1,1], [0,2,1], [0,3,1], [0,6,1], [3,4,1], [3,5,1], [6,7,2], [6,8,1], [8,9,1]] },
    "Ala": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.1, z:0}, {e:"C", x:0, y:-0.6, z:1.4}, {e:"H", x:0, y:0.2, z:2.2}, {e:"H", x:0.9, y:-1.2, z:1.6}, {e:"H", x:-0.9, y:-1.2, z:1.6}, {e:"N", x:-1.4, y:-0.2, z:-0.5}, {e:"H", x:-1.7, y:0.6, z:-0.8}, {e:"H", x:-2.0, y:-0.8, z:-0.2}, {e:"C", x:1.2, y:-0.4, z:-0.8}, {e:"O", x:1.4, y:-1.5, z:-1.0}, {e:"O", x:2.0, y:0.6, z:-1.2}, {e:"H", x:2.8, y:0.3, z:-1.4}], bonds: [[0,1,1], [0,2,1], [0,6,1], [0,9,1], [2,3,1], [2,4,1], [2,5,1], [6,7,1], [6,8,1], [9,10,2], [9,11,1], [11,12,1]] },
    "Val": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.0, z:0}, {e:"N", x:-1.3, y:-0.5, z:0.5}, {e:"H", x:-1.3, y:-1.5, z:0.5}, {e:"H", x:-2.0, y:-0.1, z:0}, {e:"C", x:1.2, y:-0.5, z:0.5}, {e:"O", x:1.5, y:-0.3, z:1.6}, {e:"O", x:1.8, y:-1.2, z:-0.4}, {e:"H", x:2.6, y:-1.4, z:-0.1}, {e:"C", x:-0.2, y:-0.3, z:-1.5}, {e:"H", x:-0.2, y:0.8, z:-1.5}, {e:"C", x:-1.6, y:-0.8, z:-2.0}, {e:"H", x:-1.7, y:-1.9, z:-1.8}, {e:"H", x:-2.4, y:-0.3, z:-1.6}, {e:"H", x:-1.7, y:-0.6, z:-3.1}, {e:"C", x:0.9, y:-0.9, z:-2.3}, {e:"H", x:0.9, y:-2.0, z:-2.1}, {e:"H", x:1.9, y:-0.5, z:-2.0}, {e:"H", x:0.8, y:-0.7, z:-3.4}], bonds: [[0,1,1], [0,2,1], [0,5,1], [0,9,1], [2,3,1], [2,4,1], [5,6,2], [5,7,1], [7,8,1], [9,10,1], [9,11,1], [9,15,1], [11,12,1], [11,13,1], [11,14,1], [15,16,1], [15,17,1], [15,18,1]] },
    "Lys": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.0, z:0}, {e:"N", x:-1.4, y:-0.5, z:0}, {e:"H", x:-1.4, y:-1.5, z:0}, {e:"H", x:-2.1, y:-0.1, z:-0.5}, {e:"C", x:1.2, y:-0.5, z:0}, {e:"O", x:1.2, y:-1.7, z:0}, {e:"O", x:2.3, y:0.2, z:0}, {e:"H", x:3.0, y:-0.3, z:0}, {e:"C", x:0, y:0.5, z:1.5}, {e:"H", x:-0.9, y:0.2, z:1.9}, {e:"H", x:0.9, y:0.2, z:1.9}, {e:"C", x:0, y:2.0, z:1.5}, {e:"H", x:-0.9, y:2.4, z:1.0}, {e:"H", x:0.9, y:2.4, z:1.0}, {e:"C", x:0, y:2.6, z:3.0}, {e:"H", x:-0.9, y:2.2, z:3.5}, {e:"H", x:0.9, y:2.2, z:3.5}, {e:"C", x:0, y:4.1, z:3.0}, {e:"H", x:-0.9, y:4.5, z:2.5}, {e:"H", x:0.9, y:4.5, z:2.5}, {e:"N", x:0, y:4.7, z:4.4}, {e:"H", x:-0.8, y:4.5, z:5.0}, {e:"H", x:0.8, y:4.5, z:5.0}], bonds: [[0,1,1], [0,2,1], [0,5,1], [0,9,1], [2,3,1], [2,4,1], [5,6,2], [5,7,1], [7,8,1], [9,10,1], [9,11,1], [9,12,1], [12,13,1], [12,14,1], [12,15,1], [15,16,1], [15,17,1], [15,18,1], [18,19,1], [18,20,1], [18,21,1], [21,22,1], [21,23,1]] },
    "Glu": { atoms: [{e:"C", x:0, y:0, z:0}, {e:"H", x:0, y:1.0, z:0}, {e:"N", x:-1.4, y:-0.5, z:0}, {e:"H", x:-1.4, y:-1.5, z:0}, {e:"H", x:-2.1, y:-0.1, z:-0.5}, {e:"C", x:1.2, y:-0.5, z:0}, {e:"O", x:1.2, y:-1.7, z:0}, {e:"O", x:2.3, y:0.2, z:0}, {e:"H", x:3.0, y:-0.3, z:0}, {e:"C", x:0, y:0.5, z:1.5}, {e:"H", x:-0.9, y:0.2, z:1.9}, {e:"H", x:0.9, y:0.2, z:1.9}, {e:"C", x:0, y:2.0, z:1.5}, {e:"H", x:-0.9, y:2.4, z:1.0}, {e:"H", x:0.9, y:2.4, z:1.0}, {e:"C", x:0, y:2.7, z:2.9}, {e:"O", x:-1.1, y:2.7, z:3.5}, {e:"O", x:1.1, y:3.2, z:3.4}, {e:"H", x:1.0, y:3.6, z:4.2}], bonds: [[0,1,1], [0,2,1], [0,5,1], [0,9,1], [2,3,1], [2,4,1], [5,6,2], [5,7,1], [7,8,1], [9,10,1], [9,11,1], [9,12,1], [12,13,1], [12,14,1], [12,15,1], [15,16,2], [15,17,1], [17,18,1]] }
};

function preload() {
    myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
    const container = document.getElementById('canvas-container');
    let cWidth = container.offsetWidth;
    let cHeight = container.offsetHeight;

    const canvas = createCanvas(cWidth, cHeight, WEBGL);
    canvas.parent('canvas-container');
    document.oncontextmenu = () => false;
    
    if (window.devicePixelRatio > 1) pixelDensity(1.5); 
    else pixelDensity(1);

    textFont(myFont);
    textSize(16);
    textAlign(CENTER, CENTER);
    
    // --- DOM EVENTS ---
    document.getElementById('molecule-select').addEventListener('change', function() { 
        loadMolecule(this.value);
        this.classList.add('has-value');
        if (window.innerWidth <= 768) toggleMenu(false);
    });

    document.getElementById('toggle-rotate').addEventListener('click', function() { 
        isRotating = !isRotating; 
        updateButtonsText(); 
        this.classList.toggle('active');
    });
    document.getElementById('toggle-labels').addEventListener('click', function() { 
        showLabels = !showLabels; 
        updateButtonsText(); 
        this.classList.toggle('active');
    });
    document.getElementById('language-select').addEventListener('change', function() {
        setLanguage(this.value);
    });
    document.getElementById('btn-save-image').addEventListener('click', captureImageDesktop);
    
    // --- MOBILE EVENTS ---
    document.getElementById('mobile-menu-btn').addEventListener('click', () => toggleMenu(true));
    document.getElementById('close-menu-btn').addEventListener('click', () => toggleMenu(false));
    document.getElementById('menu-overlay').addEventListener('click', () => toggleMenu(false));

    // Popup Camera Logic
    const popup = document.getElementById('save-popup-overlay');
    document.getElementById('quick-snap-btn').addEventListener('click', () => {
        popup.classList.remove('hidden');
        isRotating = false;
        document.getElementById('toggle-rotate').classList.remove('active');
    });
    document.getElementById('mobile-cancel-btn').addEventListener('click', () => {
        popup.classList.add('hidden');
        isRotating = true; 
        document.getElementById('toggle-rotate').classList.add('active');
    });
    document.getElementById('mobile-save-btn').addEventListener('click', () => {
        captureImageMobile();
        popup.classList.add('hidden');
    });

    setTimeout(windowResized, 100);
    setLanguage('vi');
}

function toggleMenu(show) {
    const ui = document.getElementById('ui-container');
    const overlay = document.getElementById('menu-overlay');
    if (show) {
        ui.classList.add('open');
        overlay.classList.add('active');
    } else {
        ui.classList.remove('open');
        overlay.classList.remove('active');
    }
}

function touchStarted() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        // preventDefault handled by css touch-action
    }
    
    if (touches.length === 1) {
        isDragging = true;
        lastX = touches[0].x;
        lastY = touches[0].y;
    } else if (touches.length === 2) {
        isDragging = false;
        let dx = touches[1].x - touches[0].x;
        let dy = touches[1].y - touches[0].y;
        initialDist = Math.sqrt(dx*dx + dy*dy);
        initialZoom = zoom;
        initialPanX = panX;
        initialPanY = panY;
        lastX = (touches[0].x + touches[1].x) / 2;
        lastY = (touches[0].y + touches[1].y) / 2;
    }
}

function touchMoved() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return true;

    if (touches.length === 1 && isDragging) {
        let dx = touches[0].x - lastX;
        let dy = touches[0].y - lastY;
        rotY += dx * 0.015; 
        rotX += dy * 0.015;
        lastX = touches[0].x;
        lastY = touches[0].y;
    } else if (touches.length === 2) {
        let dx = touches[1].x - touches[0].x;
        let dy = touches[1].y - touches[0].y;
        let currentDist = Math.sqrt(dx*dx + dy*dy);
        
        if (initialDist > 0) {
            let scale = currentDist / initialDist;
            zoom = constrain(initialZoom * scale, 0.1, 5);
        }
        
        let currentCenterX = (touches[0].x + touches[1].x) / 2;
        let currentCenterY = (touches[0].y + touches[1].y) / 2;
        panX = initialPanX + (currentCenterX - lastX);
        panY = initialPanY + (currentCenterY - lastY);
    }
    return false;
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        isDragging = true;
        lastX = mouseX;
        lastY = mouseY;
    }
}
function mouseReleased() { isDragging = false; }
function mouseDragged() {
    if (isDragging && touches.length === 0) {
        let dx = mouseX - lastX;
        let dy = mouseY - lastY;
        if (mouseButton === LEFT) {
            rotY += dx * 0.01;
            rotX += dy * 0.01;
        } else if (mouseButton === RIGHT) {
            panX += dx;
            panY += dy;
        }
        lastX = mouseX;
        lastY = mouseY;
    }
}
function mouseWheel(event) {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        zoom += event.delta * -0.001;
        zoom = constrain(zoom, 0.1, 5);
        return false;
    }
    return true;
}

function renderScene(pg, w, h, sFactor = 1, isSnapshot = false) {
    pg.clear(); 
    
    if (document.getElementById('snap-format').value === 'jpg' || sFactor === 1) {
         pg.background(0); 
    }
    
    if (isSnapshot) {
        const fov = PI / 6; 
        const camZ = (h / 2.0) / Math.tan(fov / 2.0);
        pg.camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
        pg.perspective(fov, w / h, 10, 500000);
    }

    pg.noStroke();    
    pg.ambientLight(100); 
    pg.directionalLight(180, 180, 180, 0.5, 1, -1); 
    pg.pointLight(100, 100, 100, 0, 0, 500); 

    pg.push();
    pg.translate(panX * sFactor, panY * sFactor, 0);
    pg.scale(zoom * sFactor);
    pg.rotateX(rotX);
    pg.rotateY(rotY);
    pg.rotateY(autoRotationAngle);

    if (!currentMoleculeKey) {
        pg.push();
        pg.fill(100); 
        pg.rotateY(-(rotY + autoRotationAngle)); 
        pg.rotateX(-rotX);
        pg.scale(1 / (zoom * sFactor)); 
        if (sFactor === 1) {
            let gl = pg._renderer.GL;
            gl.disable(gl.DEPTH_TEST);
            pg.textSize(14); 
            pg.fill(150);
            pg.text(TRANSLATIONS[currentLang].canvasMsg, 0, 0);
            gl.enable(gl.DEPTH_TEST);
        }
        pg.pop();
        pg.pop();
        return;
    }

    for (let b of bonds) {
        let a1 = atoms[b[0]];
        let a2 = atoms[b[1]];
        let order = b[2] || 1;
        let p1 = createVector(a1.x * SCALE, a1.y * SCALE, a1.z * SCALE);
        let p2 = createVector(a2.x * SCALE, a2.y * SCALE, a2.z * SCALE);
        drawBondMulti(pg, p1, p2, order);
    }
    
    if (["C6H6", "C6H5OH", "C6H5CH3", "styrene", "C6H5NH2", "benzoic_acid"].includes(currentMoleculeKey)) {
        drawAromaticRing(pg);
    }
    
    for (let atom of atoms) {
        let x = atom.x * SCALE;
        let y = atom.y * SCALE;
        let z = atom.z * SCALE;
        let elemInfo = ELEMENTS[atom.e] || { color: [200, 200, 200], radius: 30, textColor: [0,0,0] };

        pg.push();
        pg.translate(x, y, z);
        
        pg.fill(elemInfo.color);
        pg.ambientMaterial(elemInfo.color);
        pg.specularMaterial(60); 
        pg.shininess(20);
        
        let detail = isSnapshot ? 80 : (window.innerWidth < 768 ? 24 : 40); 
        pg.sphere(elemInfo.radius, detail, detail);

        if (showLabels) {
            pg.rotateY(-(rotY + autoRotationAngle));
            pg.rotateX(-rotX);
            pg.translate(0, 0, elemInfo.radius + 2); 
            pg.fill(elemInfo.textColor);
            pg.noLights(); 
            pg.scale(1 / (zoom * sFactor)); 
            let finalFontSize = 16 * zoom * sFactor;
            pg.textSize(finalFontSize);
            pg.textAlign(CENTER, CENTER);
            pg.text(atom.e, 0, 0);
        }
        pg.pop();
    }
    pg.pop();
}

function windowResized() { 
    const container = document.getElementById('canvas-container');
    if (container && container.offsetWidth > 0) {
         resizeCanvas(container.offsetWidth, container.offsetHeight); 
    }
}

function setLanguage(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

    setText('header-title', t.headerTitle);
    setText('header-sub', t.headerSub);
    const molSelect = document.getElementById('molecule-select');
    if(molSelect && molSelect.options.length > 0) molSelect.options[0].innerText = t.placeholder;
    updateButtonsText();
    setText('btn-save-image', t.btnSave);
    const resOpt = document.querySelector('#snap-res option[value="current"]');
    if(resOpt) resOpt.innerText = t.resCurrent;
    const pngOpt = document.querySelector('#snap-format option[value="png"]');
    if(pngOpt) pngOpt.innerText = t.fmtPNG;
    const jpgOpt = document.querySelector('#snap-format option[value="jpg"]');
    if(jpgOpt) jpgOpt.innerText = t.fmtJPG;
    setText('key-left', t.keyLeft); setText('ins-left-text', t.insLeft);
    setText('key-wheel', t.keyWheel); setText('ins-wheel-text', t.insWheel);
    setText('key-right', t.keyRight); setText('ins-right-text', t.insRight);
    for (const [id, label] of Object.entries(t.optgroups)) {
        const el = document.getElementById(id);
        if (el) el.label = label;
    }
}

function updateButtonsText() {
    const t = TRANSLATIONS[currentLang];
    const btnRotate = document.getElementById('toggle-rotate');
    const btnLabels = document.getElementById('toggle-labels');
    if(btnRotate) btnRotate.innerText = t.btnRotate;
    if(btnLabels) btnLabels.innerText = t.btnLabels;
}

function calculateOptimalZoom(currentAtoms) {
    if (!currentAtoms || currentAtoms.length === 0) return 1.0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let a of currentAtoms) {
        if (a.x < minX) minX = a.x; if (a.x > maxX) maxX = a.x;
        if (a.y < minY) minY = a.y; if (a.y > maxY) maxY = a.y;
    }
    if (minX === Infinity) return 1.5;
    let marginBuffer = 1.2; 
    let contentWidth = (maxX - minX + marginBuffer) * SCALE;
    let contentHeight = (maxY - minY + marginBuffer) * SCALE;
    let canvasW = width; let canvasH = height;
    let coverageRatio = 0.55; 
    let zoomX = (canvasW * coverageRatio) / contentWidth;
    let zoomY = (canvasH * coverageRatio) / contentHeight;
    return constrain(Math.min(zoomX, zoomY), 0.3, 2.5);
}

function loadMolecule(type) {
    currentMoleculeKey = type;
    const data = MOLECULE_DATA[type];
    if (data) {
        atoms = JSON.parse(JSON.stringify(data.atoms));
        bonds = data.bonds;
        autoRotationAngle = 0;
        rotX = 0; rotY = 0; panX = 0; panY = 0; 
        zoom = calculateOptimalZoom(atoms);
        if(window.innerWidth < 768) zoom *= 0.8;
    }
}

function captureImageDesktop() {
    const resValue = document.getElementById('snap-res').value;
    const formatValue = document.getElementById('snap-format').value;
    performCapture(resValue, formatValue);
}

function captureImageMobile() {
    const resValue = document.getElementById('mobile-snap-res').value;
    const formatValue = document.getElementById('mobile-snap-format').value;
    performCapture(resValue, formatValue);
}

function performCapture(resValue, formatValue) {
    const molName = currentMoleculeKey || 'molecule';
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const filename = `${molName}_${timestamp}`;

    const isMobile = window.innerWidth <= 768;

    if (resValue === "current") {
        if (!isMobile) {
            saveCanvas(filename, formatValue);
        } else {
            // Mobile: Render Blob và hiển thị lên modal
            const canvas = document.getElementById('defaultCanvas0'); // p5js tạo id này
            if(canvas) {
                canvas.toBlob(function(blob) {
                    showMobileSaveModal(blob, filename, formatValue);
                }, `image/${formatValue === 'jpg' ? 'jpeg' : 'png'}`);
            }
        }
    } else {
        const dims = resValue.split('x');
        let targetW = parseInt(dims[0]);
        let targetH = parseInt(dims[1]);
        let pg = createGraphics(targetW, targetH, WEBGL);
        pg.pixelDensity(1); 
        pg.textFont(myFont);
        renderScene(pg, targetW, targetH, targetH / height, true);
        
        if (!isMobile) {
            save(pg, filename + '.' + formatValue);
            pg.remove();
        } else {
            // Mobile High Res
            pg.canvas.toBlob(function(blob) {
                showMobileSaveModal(blob, filename, formatValue);
                pg.remove();
            }, `image/${formatValue === 'jpg' ? 'jpeg' : 'png'}`);
        }
    }
}

// Hàm hiển thị modal lưu ảnh trên mobile (CẬP NHẬT)
function showMobileSaveModal(blob, filename, ext) {
    const imageUrl = URL.createObjectURL(blob);
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    
    modal.style.touchAction = 'auto'; 

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '65%';
    img.style.border = '2px solid #555';
    img.style.borderRadius = '8px';
    img.style.marginBottom = '15px';
    img.style.pointerEvents = 'auto';
    img.style.userSelect = 'auto';
    img.style.webkitUserSelect = 'auto';

    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.gap = '10px';
    actionContainer.style.flexDirection = 'column';
    actionContainer.style.width = '100%';
    actionContainer.style.maxWidth = '300px';

    // Nút 1: Chia sẻ (Chuẩn Mobile)
    const shareBtn = document.createElement('button');
    shareBtn.innerText = 'Chia sẻ / Lưu Ảnh (Khuyên dùng)';
    shareBtn.style.padding = '12px';
    shareBtn.style.backgroundColor = '#3794ff';
    shareBtn.style.color = 'white';
    shareBtn.style.border = 'none';
    shareBtn.style.borderRadius = '8px';
    shareBtn.style.fontSize = '15px';
    shareBtn.style.fontWeight = 'bold';
    shareBtn.onclick = async function() {
        try {
            const file = new File([blob], `${filename}.${ext}`, { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Cấu trúc phân tử',
                    text: `Hình ảnh phân tử ${filename}`
                });
            } else {
                alert("Trình duyệt không hỗ trợ chia sẻ. Hãy dùng nút Tải xuống bên dưới.");
            }
        } catch (err) {
            console.log("Lỗi chia sẻ:", err);
        }
    };

    // Nút 2: Tải xuống (Cưỡng ép tải về Files)
    const downloadBtn = document.createElement('button');
    downloadBtn.innerText = 'Tải xuống Tệp (Files)';
    downloadBtn.style.padding = '12px';
    downloadBtn.style.backgroundColor = '#28a745';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '8px';
    downloadBtn.style.fontSize = '15px';
    downloadBtn.style.fontWeight = 'bold';
    downloadBtn.onclick = function() {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${filename}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Thông báo nhỏ cho người dùng biết
        alert("Đã bắt đầu tải xuống. Vui lòng kiểm tra thư mục Tệp/Downloads.");
    };

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Đóng';
    closeBtn.style.padding = '12px';
    closeBtn.style.backgroundColor = '#444';
    closeBtn.style.color = 'white';
    closeBtn.style.border = '1px solid #555';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.fontSize = '15px';
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
        URL.revokeObjectURL(imageUrl);
    };

    modal.appendChild(img);
    
    if (navigator.canShare) actionContainer.appendChild(shareBtn);
    actionContainer.appendChild(downloadBtn); // Luôn hiện nút download
    actionContainer.appendChild(closeBtn);
    modal.appendChild(actionContainer);

    document.body.appendChild(modal);
}

function drawAromaticRing(pg) {
    const radius = 0.9 * SCALE;
    const dashCount = 8; const gapRatio = 0.2; 
    const segmentAngle = TWO_PI / dashCount;
    const drawAngle = segmentAngle * (1 - gapRatio); 
    pg.fill(150); pg.specularMaterial(50); pg.noStroke();
    const stepsPerDash = 6; 
    const tubeRadius = 2.5; 
    for (let i = 0; i < dashCount; i++) {
        let startTheta = i * segmentAngle;
        for (let j = 0; j < stepsPerDash; j++) {
            let t1 = startTheta + (drawAngle * j / stepsPerDash);
            let t2 = startTheta + (drawAngle * (j + 1) / stepsPerDash);
            drawCylinderBetweenPoints(pg, createVector(cos(t1)*radius,sin(t1)*radius,0), createVector(cos(t2)*radius,sin(t2)*radius,0), tubeRadius);
        }
    }
}

function drawCylinderBetweenPoints(pg, p1, p2, r) {
    let v = p5.Vector.sub(p2, p1);
    let len = v.mag();
    pg.push();
    pg.translate(p1.x + v.x/2, p1.y + v.y/2, p1.z + v.z/2);
    let axis = createVector(0, 1, 0).cross(v);
    let angle = acos(createVector(0, 1, 0).dot(v.copy().normalize()));
    if (axis.mag() > 0.001) pg.rotate(angle, axis); else if (v.y < 0) pg.rotateX(PI);
    pg.cylinder(r, len, 6, 1); 
    pg.pop();
}

function drawBondMulti(pg, p1, p2, order) {
    let dist = p1.dist(p2); if (dist < 0.1) return;
    pg.push();
    pg.translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
    let v = p5.Vector.sub(p2, p1);
    let yAxis = createVector(0, 1, 0); v.normalize(); 
    let axis = yAxis.cross(v);
    let angle = acos(yAxis.dot(v));
    if (axis.mag() > 0.001) pg.rotate(angle, axis); else if (v.y < 0) pg.rotateX(PI);
    pg.fill(150); pg.specularMaterial(30);
    let bondRadius = 5; let gap = 12; 
    let detail = (window.innerWidth < 768) ? 12 : 24;
    if (order === 1) pg.cylinder(bondRadius, dist, detail, 1); 
    else if (order === 2) {
        pg.push(); pg.translate(gap/2, 0, 0); pg.cylinder(bondRadius, dist, detail, 1); pg.pop();
        pg.push(); pg.translate(-gap/2, 0, 0); pg.cylinder(bondRadius, dist, detail, 1); pg.pop();
    } else if (order === 3) {
        pg.cylinder(bondRadius, dist, detail, 1);
        pg.push(); pg.translate(gap, 0, 0); pg.cylinder(bondRadius, dist, detail, 1); pg.pop();
        pg.push(); pg.translate(-gap, 0, 0); pg.cylinder(bondRadius, dist, detail, 1); pg.pop();
    }
    pg.pop();
}

function draw() {
    if (isRotating) autoRotationAngle += 0.01;
    renderScene(this, width, height, 1);
}