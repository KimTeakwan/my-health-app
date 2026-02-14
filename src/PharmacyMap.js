import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { PHARMACY_KEY } from './ApiConfig';

// 🌏 대한민국 행정구역 데이터 (주요 도시 위주)
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

// 💅 스타일
const SearchBox = styled.div`
  background: #e3f2fd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  outline: none;
  cursor: pointer;
  background: white;
  font-weight: bold;
  color: #333;
  min-width: 120px;
  
  &:hover { border-color: #4A90E2; }
`;

const SearchButton = styled.button`
  background: #4A90E2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  
  &:hover { background: #357abd; }
  &:active { transform: scale(0.95); }
`;

const ListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 12px;
  
  &:hover {
    border-color: #4A90E2;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1);
  }
`;

const Info = styled.div`
  h3 { margin: 0 0 5px 0; font-size: 18px; color: #333; }
  p { margin: 0; color: #888; font-size: 14px; }
`;

const Badge = styled.span`
  background-color: #ffecec;
  color: #ff4757;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
`;

const PharmacyMap = () => {
  // 전체 데이터 (필터링 전 원본)
  const [allPharmacies, setAllPharmacies] = useState([]);
  // 화면에 보여줄 데이터 (필터링 후)
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  
  const [loading, setLoading] = useState(false);
  
  // 선택 상태
  const [sido, setSido] = useState('서울'); 
  const [gugun, setGugun] = useState('강남구');
  
  // 🔥 동 목록과 선택된 동
  const [dongList, setDongList] = useState([]); 
  const [selectedDong, setSelectedDong] = useState('전체');

  // 시/도 변경 핸들러
  const handleSidoChange = (e) => {
    const newSido = e.target.value;
    setSido(newSido);
    if (AREA_DATA[newSido]) {
      setGugun(AREA_DATA[newSido][0]);
    } else {
      setGugun('');
    }
    // 지역 바뀌면 기존 데이터 초기화
    setAllPharmacies([]);
    setFilteredPharmacies([]);
    setDongList([]);
    setSelectedDong('전체');
  };

  // 🔥 API 호출 (구 단위로 왕창 가져오기)
  const fetchPharmacy = async () => {
    setLoading(true);
    // 검색 시작하면 기존 필터 초기화
    setSelectedDong('전체');
    
    try {
      const url = 'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire';
      const response = await axios.get(url, {
        params: {
          serviceKey: PHARMACY_KEY,
          Q0: sido,   
          Q1: gugun, 
          numOfRows: '500', // 🔥 500개 정도 가져와야 모든 동이 커버됨!
          pageNo: '1'
        }
      });

      const items = response.data.response.body.items;
      if (items) {
        const list = items.item ? (Array.isArray(items.item) ? items.item : [items.item]) : [];
        
        setAllPharmacies(list);      // 원본 저장
        setFilteredPharmacies(list); // 일단 다 보여줌
        
        // 🔥 주소 분석해서 '동' 목록 만들기 (여기가 핵심 기술!)
        const dongs = new Set(); // 중복 제거를 위해 Set 사용
        list.forEach(item => {
            // 주소 예시: "서울특별시 강남구 테헤란로 123" -> 공백으로 자름
            const addrParts = item.dutyAddr.split(' ');
            // 보통 3번째 단어가 '동'이나 '로'임 (0:서울, 1:강남구, 2:역삼동)
            if (addrParts[2]) {
                dongs.add(addrParts[2]);
            }
        });
        // 가나다순 정렬해서 목록 저장
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
  };

  // 🔥 동 선택했을 때 필터링하는 함수
  const handleDongChange = (e) => {
    const dong = e.target.value;
    setSelectedDong(dong);

    if (dong === '전체') {
        setFilteredPharmacies(allPharmacies);
    } else {
        // 주소에 내가 선택한 동 이름이 포함된 애들만 남김
        const filtered = allPharmacies.filter(item => item.dutyAddr.includes(dong));
        setFilteredPharmacies(filtered);
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, []);

  return (
    <div>
      <h2 style={{color: '#333'}}>🏥 동네 약국 찾기</h2>
      
      <SearchBox>
        {/* 1. 시/도 선택 */}
        <Select value={sido} onChange={handleSidoChange}>
          {Object.keys(AREA_DATA).map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </Select>

        {/* 2. 구/군 선택 */}
        <Select value={gugun} onChange={(e) => setGugun(e.target.value)}>
          {AREA_DATA[sido] ? AREA_DATA[sido].map(gu => (
            <option key={gu} value={gu}>{gu}</option>
          )) : <option>지역 선택</option>}
        </Select>

        <SearchButton onClick={fetchPharmacy}>조회 🔍</SearchButton>
      </SearchBox>

      {/* 🔥 3. 동 선택 (조회 후에 생김!) */}
      {dongList.length > 0 && (
          <div style={{marginBottom: '20px', textAlign: 'right'}}>
              <span style={{marginRight: '10px', fontWeight:'bold'}}>동네 선택:</span>
              <Select value={selectedDong} onChange={handleDongChange} style={{border:'2px solid #4A90E2'}}>
                  <option value="전체">전체 보기 ({allPharmacies.length}개)</option>
                  {dongList.map(dong => (
                      <option key={dong} value={dong}>{dong}</option>
                  ))}
              </Select>
          </div>
      )}
      
      {loading ? <p>약국 데이터 분석 중... 🧩</p> : (
        <ListContainer>
          {filteredPharmacies.length > 0 ? filteredPharmacies.map((item, index) => (
            <ListItem key={index}>
              <Info>
                <h3>{item.dutyName}</h3>
                <p>📍 {item.dutyAddr}</p>
                <p style={{marginTop: '5px'}}>📞 {item.dutyTel1}</p>
              </Info>
              <Badge>영업중</Badge>
            </ListItem>
          )) : <p style={{marginTop: '20px', color:'#999'}}>데이터가 없습니다.</p>}
        </ListContainer>
      )}
    </div>
  );
};

export default PharmacyMap;