// 🔑 우리집 열쇠 보관함 (React CRA 버전)

// 1. 미세먼지용 키 (Vite 방식인 import.meta 대신 process.env 사용!)
export const DUST_KEY = process.env.REACT_APP_DUST_KEY;

// 2. 약국용 키 (PharmacyMap.js에서 부르는 이름과 맞춰줌!)
export const PHARMACY_KEY = process.env.REACT_APP_HEALTH_KEY;

export const WE_ARE_READY = true;