'use client';

import { useState } from 'react';

// Icons
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 18l-9.5-9.5-5 5L1 6" />
    <path d="M17 18h6v-6" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Sample data
const statsData = [
  {
    label: '이번 달 매출',
    value: '₩24,580,000',
    change: '+12.5%',
    positive: true,
    accent: '#D4A574',
  },
  {
    label: '진행 중 주문',
    value: '23',
    change: '+3',
    positive: true,
    accent: '#FFB84D',
  },
  {
    label: '신규 고객',
    value: '18',
    change: '+28%',
    positive: true,
    accent: '#4DAFFF',
  },
  {
    label: '완료된 프로젝트',
    value: '156',
    change: '+8',
    positive: true,
    accent: '#4DFF88',
  },
];

const timelineData = [
  {
    id: 'ORD-2024-0892',
    title: '김민준 & 이수진',
    type: '본식 영상',
    status: 'editing',
    progress: 65,
    dueDate: '2024.01.28',
    editor: '박영수',
  },
  {
    id: 'ORD-2024-0891',
    title: '최현우 & 박지영',
    type: '식전 영상',
    status: 'review',
    progress: 90,
    dueDate: '2024.01.25',
    editor: '김철수',
  },
  {
    id: 'ORD-2024-0890',
    title: '정태희 & 한소영',
    type: '하이라이트',
    status: 'recording',
    progress: 25,
    dueDate: '2024.02.05',
    editor: '이민호',
  },
  {
    id: 'ORD-2024-0889',
    title: '이준서 & 김예린',
    type: '본식 영상',
    status: 'complete',
    progress: 100,
    dueDate: '2024.01.20',
    editor: '박영수',
  },
];

const chartData = [
  { month: 'Aug', value: 18500000 },
  { month: 'Sep', value: 21200000 },
  { month: 'Oct', value: 19800000 },
  { month: 'Nov', value: 22100000 },
  { month: 'Dec', value: 25400000 },
  { month: 'Jan', value: 24580000 },
];

const recentOrders = [
  {
    id: 'ORD-2024-0895',
    customer: '박성민 & 김하은',
    email: 'park.sm@email.com',
    type: '본식 영상',
    status: 'pending',
    date: '2024.01.22',
    price: '₩1,800,000',
  },
  {
    id: 'ORD-2024-0894',
    customer: '조영훈 & 이미래',
    email: 'cho.yh@email.com',
    type: '식전 영상 + 본식',
    status: 'recording',
    date: '2024.01.21',
    price: '₩2,500,000',
  },
  {
    id: 'ORD-2024-0893',
    customer: '강동현 & 신유진',
    email: 'kang.dh@email.com',
    type: '하이라이트',
    status: 'editing',
    date: '2024.01.20',
    price: '₩800,000',
  },
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const today = new Date();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const maxChartValue = Math.max(...chartData.map(d => d.value));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return '#FF4D4D';
      case 'editing': return '#FFB84D';
      case 'review': return '#4DAFFF';
      case 'complete': return '#4DFF88';
      default: return '#A0A0A5';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'recording': return '촬영 중';
      case 'editing': return '편집 중';
      case 'review': return '검토 중';
      case 'complete': return '완료';
      default: return status;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">대시보드</h1>
            <p className="page-subtitle">웨딩 스튜디오 운영 현황을 한눈에 확인하세요</p>
          </div>
          <div className="date-display">
            <span className="day">{today.getDate()}</span>
            <span>{monthNames[today.getMonth()]} {today.getFullYear()} ({dayOfWeek})</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="stat-card animate-fadeIn"
            style={{ '--stat-accent': stat.accent } as React.CSSProperties}
          >
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.positive ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{stat.change} 전월 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        {/* Production Timeline */}
        <div className="frame-card">
          <div className="frame-card-header">
            <span className="frame-card-title">제작 타임라인</span>
            <div className="tabs" style={{ margin: 0 }}>
              <button className={`tab ${selectedPeriod === 'week' ? 'active' : ''}`} onClick={() => setSelectedPeriod('week')}>이번 주</button>
              <button className={`tab ${selectedPeriod === 'month' ? 'active' : ''}`} onClick={() => setSelectedPeriod('month')}>이번 달</button>
            </div>
          </div>
          <div className="timeline-track">
            {timelineData.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className={`timeline-marker ${item.status}`}>
                  {item.progress}%
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    {item.title}
                    <span className="project-type">{item.type}</span>
                  </div>
                  <div className="timeline-meta">
                    <span>{item.id}</span>
                    <span>담당: {item.editor}</span>
                    <span>마감: {item.dueDate}</span>
                  </div>
                  <div className="timeline-progress">
                    <div
                      className="timeline-progress-bar"
                      style={{
                        width: `${item.progress}%`,
                        background: getStatusColor(item.status),
                      }}
                    />
                  </div>
                </div>
                <div className="timeline-actions">
                  <button className="action-btn" title="미리보기">
                    <EyeIcon />
                  </button>
                  <button className="action-btn" title="재생">
                    <PlayIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="frame-card">
          <div className="frame-card-header">
            <span className="frame-card-title">프로젝트 현황</span>
          </div>
          <div className="frame-card-body">
            <div className="quick-stats">
              <div className="quick-stat-item">
                <div className="quick-stat-label">촬영 대기</div>
                <div className="quick-stat-value">5</div>
                <div className="quick-stat-bar">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`quick-stat-segment ${i <= 5 ? 'active' : ''}`}
                      style={{ background: '#A0A0A5' }}
                    />
                  ))}
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-label">편집 진행</div>
                <div className="quick-stat-value">8</div>
                <div className="quick-stat-bar">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div
                      key={i}
                      className={`quick-stat-segment ${i <= 8 ? 'active' : ''}`}
                      style={{ background: '#FFB84D' }}
                    />
                  ))}
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-label">검토 대기</div>
                <div className="quick-stat-value">3</div>
                <div className="quick-stat-bar">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`quick-stat-segment ${i <= 3 ? 'active' : ''}`}
                      style={{ background: '#4DAFFF' }}
                    />
                  ))}
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-label">이번 주 완료</div>
                <div className="quick-stat-value">7</div>
                <div className="quick-stat-bar">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div
                      key={i}
                      className={`quick-stat-segment ${i <= 7 ? 'active' : ''}`}
                      style={{ background: '#4DFF88' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="content-grid">
        <div className="frame-card">
          <div className="frame-card-header">
            <span className="frame-card-title">월별 매출 추이</span>
          </div>
          <div className="frame-card-body">
            <div className="chart-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {chartData.map((data, index) => (
                    <div key={index} className="chart-bar-group">
                      <div
                        className="chart-bar"
                        style={{ height: `${(data.value / maxChartValue) * 180}px` }}
                        data-value={`₩${(data.value / 1000000).toFixed(1)}M`}
                      />
                      <span className="chart-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Mix */}
        <div className="frame-card">
          <div className="frame-card-header">
            <span className="frame-card-title">상품별 매출 비중</span>
          </div>
          <div className="frame-card-body">
            <div className="quick-stats">
              <div className="quick-stat-item" style={{ borderLeft: '3px solid #D4A574' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="quick-stat-label">본식 영상</div>
                    <div className="quick-stat-value" style={{ fontSize: '24px' }}>₩15.2M</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--amber)' }}>62%</div>
                </div>
              </div>
              <div className="quick-stat-item" style={{ borderLeft: '3px solid #4DAFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="quick-stat-label">식전 영상</div>
                    <div className="quick-stat-value" style={{ fontSize: '24px' }}>₩6.8M</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#4DAFFF' }}>28%</div>
                </div>
              </div>
              <div className="quick-stat-item" style={{ borderLeft: '3px solid #4DFF88' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="quick-stat-label">하이라이트</div>
                    <div className="quick-stat-value" style={{ fontSize: '24px' }}>₩2.5M</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#4DFF88' }}>10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="frame-card full-width-section">
        <div className="frame-card-header">
          <span className="frame-card-title">최근 주문</span>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            전체 보기
          </button>
        </div>
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>상품</th>
                <th>상태</th>
                <th>주문일</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">{order.id}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {order.customer.charAt(0)}
                      </div>
                      <div className="customer-info">
                        <span className="customer-name">{order.customer}</span>
                        <span className="customer-email">{order.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{order.type}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td className="price-cell">{order.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
