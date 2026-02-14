import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { DUST_KEY } from './ApiConfig';

// 💅 스타일 (검색창 추가됨!)
const SearchArea = styled.div`
  background: #f1f3f5;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  text-align: center;
  
  select {
    padding: 10px 15px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ddd;
    outline: none;
    cursor: pointer;
    background: white;
    font-weight: bold;
    color: #333;
    
    &:hover { border-color: #4A90E2; }
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: ${props => props.bg}; 
  color: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s;
  
  &:hover { transform: translateY(-5px); }
  h3 { margin: 0 0 10px 0; font-size: 18px; opacity: 0.9; }
  h2 { margin: 10px 0; font-size: 32px; font-weight: 800; }
  p { margin: 0; opacity: 0.8; font-size: 14px; }
`;

// 공공데이터 포털에서 정해준 지역 이름들
const SIDO_LIST = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];

const DustViewer = () => {
  const [dustData, setDustData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSido, setSelectedSido] = useState('서울'); // 기본값: 서울

  useEffect(() => {
    const fetchDust = async () => {
      setLoading(true); // 로딩 시작!
      try {
        const url = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';
        const response = await axios.get(url, {
          params: {
            serviceKey: DUST_KEY, 
            returnType: 'json',
            numOfRows: '20',
            pageNo: '1',
            sidoName: selectedSido, // 🔥 여기가 핵심! 선택한 지역으로 바뀜
            ver: '1.0'
          }
        });
        const items = response.data.response.body.items;
        if (items) setDustData(items);
      } catch (e) {
        console.error("에러:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDust();
  }, [selectedSido]); // 🔥 [selectedSido]가 바뀔 때마다 실행됨!

  const getCardStyle = (grade) => {
    if (grade === '1') return 'linear-gradient(135deg, #2ecc71, #27ae60)'; 
    if (grade === '2') return 'linear-gradient(135deg, #f1c40f, #f39c12)';
    if (grade === '3') return 'linear-gradient(135deg, #e67e22, #d35400)';
    if (grade === '4') return 'linear-gradient(135deg, #e74c3c, #c0392b)';
    return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
  };

  const getStatusText = (grade) => {
    if (grade === '1') return '좋음 😄';
    if (grade === '2') return '보통 😐';
    if (grade === '3') return '나쁨 😷';
    if (grade === '4') return '최악 😱';
    return '측정중';
  };

  return (
    <div>
      <h2 style={{color: '#333'}}>🌏 지역별 미세먼지 조회</h2>
      
      {/* 지역 선택 박스 */}
      <SearchArea>
        <span style={{marginRight: '10px', fontWeight:'bold'}}>어디를 조회할까요?</span>
        <select value={selectedSido} onChange={(e) => setSelectedSido(e.target.value)}>
          {SIDO_LIST.map((sido) => (
            <option key={sido} value={sido}>{sido}</option>
          ))}
        </select>
      </SearchArea>

      {loading ? <p>데이터 불러오는 중... ⏳</p> : (
        <GridContainer>
          {dustData.map((data, index) => (
            <Card key={index} bg={getCardStyle(data.pm10Grade)}>
              <h3>{data.stationName}</h3>
              <h2>{getStatusText(data.pm10Grade)}</h2>
              <p>미세먼지: {data.pm10Value} ㎍/m³</p>
            </Card>
          ))}
        </GridContainer>
      )}
    </div>
  );
};

export default DustViewer;