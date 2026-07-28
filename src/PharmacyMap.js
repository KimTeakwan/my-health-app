import React, { useState, useEffect, useCallback } from 'react'; // 👈 useCallback 추가
import styled from 'styled-components';
import axios from 'axios';
import { PHARMACY_KEY } from './ApiConfig';

// 🌏 대한민국 행정구역 데이터 (생략 없이 그대로 유지)
const AREA_DATA = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시', '광주시', '이천시', '양주시', '오산시', '구리시', '안성시', '포천시', '의왕시', '하남시', '여주시', '양평군', '동두천시', '과천시', '가평군', '연천군'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '인천': ['강화군', '계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산': ['남구', '동구', '북구', '울주군', '중구'],
  '강원': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
  '제주': ['서귀포시', '제주시']
};

// 💅 스타일 (기존 디자인 유지)
const SearchBox = styled.div` background: #e3f2fd; padding: 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: center; gap: 10px; align-items: center; flex-wrap: wrap; `;
const Select = styled.select` padding: 10px 15px; font-size: 16px; border-radius: 8px; border: 1px solid #ddd; outline: none; cursor: pointer; background: white; font-weight: bold; color: #333; min-width: 120px; &:hover { border-color: #4A90E2; } `;
const SearchButton = styled.button` background: #4A90E2; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #357abd; } &:active { transform: scale(0.95); } `;
const ListContainer = styled.ul` list-style: none; padding: 0; margin: 0; `;
const ListItem = styled.li` display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #eee; padding: 20px; margin-bottom: 10px; border-radius: 12px; &:hover { border-color: #4A90E2; box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1); } `;
const Info = styled.div` h3 { margin: 0 0 5px 0; font-size: 18px; color: #333; } p { margin: 0; color: #888; font-size: 14px; } `;
const Badge = styled.span` background-color: #ffecec; color: #ff4757; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; `;

// 영업 상태를 계산하는 헬퍼 함수
const checkIsOpen = (item) => {
  const now = new Date();
  const day = now.getDay(); // 0: 일요일, 1: 월요일 ... 6: 토요일
  
  // API의 요일 인덱스에 맞게 변환 (API는 1:월 ~ 7:일)
  const apiDayIndex = day === 0 ? 7 : day; 
  
  const startTime = item[`dutyTime${apiDayIndex}s`];
  const closeTime = item[`dutyTime${apiDayIndex}c`];

  // 해당 요일에 운영 시간이 없으면 휴무
  if (!startTime || !closeTime) return false;

  const currentHourMinute = 
    String(now.getHours()).padStart(2, '0') + 
    String(now.getMinutes()).padStart(2, '0');

  // 현재 시간이 오픈 시간과 종료 시간 사이인지 확인
  return currentHourMinute >= startTime && currentHourMinute <= closeTime;
};

const PharmacyMap = () => {
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sido, setSido] = useState('서울'); 
  const [gugun, setGugun] = useState('강남구');
  const [dongList, setDongList] = useState([]); 
  const [selectedDong, setSelectedDong] = useState('전체');

  const handleSidoChange = (e) => {
    const newSido = e.target.value;
    setSido(newSido);
    if (AREA_DATA[newSido]) {
      setGugun(AREA_DATA[newSido][0]);
    } else {
      setGugun('');
    }
    setAllPharmacies([]);
    setFilteredPharmacies([]);
    setDongList([]);
    setSelectedDong('전체');
  };

  // 🔥 Vercel 에러 해결의 핵심: useCallback으로 함수 감싸기
  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setSelectedDong('전체');
    try {
      const url = 'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire';
      const response = await axios.get(url, {
        params: {
          serviceKey: PHARMACY_KEY,
          Q0: sido,   
          Q1: gugun, 
          numOfRows: '500', 
          pageNo: '1'
        }
      });

      const items = response.data.response.body.items;
      if (items) {
        const list = items.item ? (Array.isArray(items.item) ? items.item : [items.item]) : [];
        setAllPharmacies(list);      
        setFilteredPharmacies(list); 
        
        const dongs = new Set();
        list.forEach(item => {
            const addrParts = item.dutyAddr.split(' ');
            if (addrParts[2]) { dongs.add(addrParts[2]); }
        });
        setDongList([...dongs].sort());
      } else {
        setAllPharmacies([]);
        setFilteredPharmacies([]);
        setDongList([]);
      }
    } catch (e) {
      console.error("에러:", e);
      alert("데이터 불러오기 실패 ㅠㅠ");
    } finally {
      setLoading(false);
    }
  }, [sido, gugun]); // 👈 의존성 추가

  const handleDongChange = (e) => {
    const dong = e.target.value;
    setSelectedDong(dong);
    if (dong === '전체') {
        setFilteredPharmacies(allPharmacies);
    } else {
        const filtered = allPharmacies.filter(item => item.dutyAddr.includes(dong));
        setFilteredPharmacies(filtered);
    }
  };

  // 🔥 빌드 에러 해결 포인트: fetchPharmacy를 의존성 배열에 포함시킴
  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]); 

  return (
    <div>
      <h2 style={{color: '#333'}}>🏥 동네 약국 찾기</h2>
      <SearchBox>
        <Select value={sido} onChange={handleSidoChange}>
          {Object.keys(AREA_DATA).map(area => ( <option key={area} value={area}>{area}</option> ))}
        </Select>
        <Select value={gugun} onChange={(e) => setGugun(e.target.value)}>
          {AREA_DATA[sido] ? AREA_DATA[sido].map(gu => ( <option key={gu} value={gu}>{gu}</option> )) : <option>지역 선택</option>}
        </Select>
        <SearchButton onClick={fetchPharmacy}>조회 🔍</SearchButton>
      </SearchBox>

      {dongList.length > 0 && (
          <div style={{marginBottom: '20px', textAlign: 'right'}}>
              <span style={{marginRight: '10px', fontWeight:'bold'}}>동네 선택:</span>
              <Select value={selectedDong} onChange={handleDongChange} style={{border:'2px solid #4A90E2'}}>
                  <option value="전체">전체 보기 ({allPharmacies.length}개)</option>
                  {dongList.map(dong => ( <option key={dong} value={dong}>{dong}</option> ))}
              </Select>
          </div>
      )}
      
      {loading ? <p>약국 데이터 분석 중... 🧩</p> : (
        <ListContainer>
          {filteredPharmacies.length > 0 ? filteredPharmacies.map((item, index) => {
            const isOpen = checkIsOpen(item); // 실시간 영업 상태 계산
            
            return (
              <ListItem key={index}>
                <Info>
                  <h3>{item.dutyName}</h3>
                  <p>📍 {item.dutyAddr}</p>
                  <p style={{marginTop: '5px'}}>📞 {item.dutyTel1}</p>
                </Info>
                <Badge style={{ 
                  backgroundColor: isOpen ? '#e3f2fd' : '#ffecec', 
                  color: isOpen ? '#4A90E2' : '#ff4757' 
                }}>
                  {isOpen ? '영업중' : '영업종료'}
                </Badge>
              </ListItem>
            );
          }) : <p style={{marginTop: '20px', color:'#999'}}>데이터가 없습니다.</p>}
        </ListContainer>
      )}
    </div>
  );
};

export default PharmacyMap;