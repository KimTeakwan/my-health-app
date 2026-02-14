// App.js 내용을 이걸로 덮어씌워!

import React, { useState } from 'react';
import styled from 'styled-components';
import DustViewer from './DustViewer';
import PharmacyMap from './PharmacyMap';

// 💅 전체 배경을 은은한 회색으로 깔아서 컨텐츠가 눈에 띄게!
const Background = styled.div`
  background-color: #f0f2f5;
  min-height: 100vh;
  padding: 40px 0;
`;

const Container = styled.div`
  max-width: 800px; /* 웹사이트니까 좀 넓게 */
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); /* 고급진 그림자 */
  overflow: hidden;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

const Header = styled.header`
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  span { color: #4A90E2; } /* 포인트 컬러 */
`;

const Nav = styled.nav`
  display: flex;
  background: #fff;
`;

const NavItem = styled.button`
  flex: 1; /* 반반 나눠가지기 */
  padding: 18px;
  border: none;
  background: ${props => props.active ? 'white' : '#f8f9fa'};
  color: ${props => props.active ? '#4A90E2' : '#868e96'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-bottom: 3px solid ${props => props.active ? '#4A90E2' : 'transparent'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f5;
  }
`;

const Content = styled.div`
  padding: 30px;
  min-height: 400px;
`;

function App() {
  const [menu, setMenu] = useState('dust');

  return (
    <Background>
      <Container>
        <Header>
          <Title>🌏 우리동네 <span>생활정보</span></Title>
        </Header>
        <Nav>
          <NavItem active={menu === 'dust'} onClick={() => setMenu('dust')}>
            😷 미세먼지 확인
          </NavItem>
          <NavItem active={menu === 'pharmacy'} onClick={() => setMenu('pharmacy')}>
            💊 24시 약국 찾기
          </NavItem>
        </Nav>
        <Content>
          {menu === 'dust' ? <DustViewer /> : <PharmacyMap />}
        </Content>
      </Container>
    </Background>
  );
}

export default App;