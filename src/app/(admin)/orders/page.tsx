'use client';

import { useState } from 'react';

// Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Sample data - Extended orders list
const ordersData = [
  {
    id: 'ORD-2024-0895',
    customer: '박성민 & 김하은',
    email: 'park.sm@email.com',
    phone: '010-1234-5678',
    type: '본식 영상',
    package: '프리미엄',
    status: 'pending',
    weddingDate: '2024.03.15',
    orderDate: '2024.01.22',
    price: 1800000,
    venue: '더채플앳청담',
    notes: '신랑 입장 장면 특별히 강조 요청',
  },
  {
    id: 'ORD-2024-0894',
    customer: '조영훈 & 이미래',
    email: 'cho.yh@email.com',
    phone: '010-2345-6789',
    type: '식전 영상 + 본식',
    package: '올인원',
    status: 'recording',
    weddingDate: '2024.02.24',
    orderDate: '2024.01.21',
    price: 2500000,
    venue: '반얀트리 클럽 앤 스파',
    notes: '해외 촬영 포함 (발리)',
  },
  {
    id: 'ORD-2024-0893',
    customer: '강동현 & 신유진',
    email: 'kang.dh@email.com',
    phone: '010-3456-7890',
    type: '하이라이트',
    package: '베이직',
    status: 'editing',
    weddingDate: '2024.02.10',
    orderDate: '2024.01.20',
    price: 800000,
    venue: '아펠가모 청담',
    notes: '',
  },
  {
    id: 'ORD-2024-0892',
    customer: '김민준 & 이수진',
    email: 'kim.mj@email.com',
    phone: '010-4567-8901',
    type: '본식 영상',
    package: '시그니처',
    status: 'editing',
    weddingDate: '2024.01.28',
    orderDate: '2024.01.15',
    price: 2200000,
    venue: '포시즌스 호텔',
    notes: '드론 촬영 추가',
  },
  {
    id: 'ORD-2024-0891',
    customer: '최현우 & 박지영',
    email: 'choi.hw@email.com',
    phone: '010-5678-9012',
    type: '식전 영상',
    package: '스탠다드',
    status: 'review',
    weddingDate: '2024.02.03',
    orderDate: '2024.01.14',
    price: 1200000,
    venue: '라움 아트센터',
    notes: '신부 솔로 컷 추가 요청',
  },
  {
    id: 'ORD-2024-0890',
    customer: '정태희 & 한소영',
    email: 'jung.th@email.com',
    phone: '010-6789-0123',
    type: '하이라이트',
    package: '베이직',
    status: 'recording',
    weddingDate: '2024.02.05',
    orderDate: '2024.01.12',
    price: 800000,
    venue: '그랜드 인터컨티넨탈',
    notes: '',
  },
  {
    id: 'ORD-2024-0889',
    customer: '이준서 & 김예린',
    email: 'lee.js@email.com',
    phone: '010-7890-1234',
    type: '본식 영상',
    package: '프리미엄',
    status: 'complete',
    weddingDate: '2024.01.20',
    orderDate: '2024.01.05',
    price: 1800000,
    venue: '신라호텔',
    notes: '완료 - 고객 만족',
  },
  {
    id: 'ORD-2024-0888',
    customer: '윤성호 & 장미경',
    email: 'yoon.sh@email.com',
    phone: '010-8901-2345',
    type: '식전 영상 + 본식',
    package: '올인원',
    status: 'complete',
    weddingDate: '2024.01.13',
    orderDate: '2023.12.28',
    price: 2500000,
    venue: '롯데호텔 월드',
    notes: '추가 수정 완료',
  },
];

type OrderStatus = 'all' | 'pending' | 'recording' | 'editing' | 'review' | 'complete';

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  type: string;
  package: string;
  status: string;
  weddingDate: string;
  orderDate: string;
  price: number;
  venue: string;
  notes: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const statusFilters: { value: OrderStatus; label: string; count: number }[] = [
    { value: 'all', label: '전체', count: ordersData.length },
    { value: 'pending', label: '대기 중', count: ordersData.filter(o => o.status === 'pending').length },
    { value: 'recording', label: '촬영 중', count: ordersData.filter(o => o.status === 'recording').length },
    { value: 'editing', label: '편집 중', count: ordersData.filter(o => o.status === 'editing').length },
    { value: 'review', label: '검토 중', count: ordersData.filter(o => o.status === 'review').length },
    { value: 'complete', label: '완료', count: ordersData.filter(o => o.status === 'complete').length },
  ];

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">주문 관리</h1>
            <p className="page-subtitle">웨딩 영상 주문 현황을 관리하세요</p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon />
            새 주문 등록
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <div className="frame-card" style={{ marginBottom: 'var(--frame-gap)' }}>
        <div className="frame-card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search */}
            <div className="search-container">
              <span className="search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="search-input"
                placeholder="주문번호, 고객명, 장소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Pills */}
            <div className="filter-pills" style={{ margin: 0 }}>
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`filter-pill ${statusFilter === filter.value ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
                >
                  {filter.label}
                  <span style={{ marginLeft: '6px', opacity: 0.7 }}>({filter.count})</span>
                </button>
              ))}
            </div>

            {/* Filter Button */}
            <button className="btn btn-secondary btn-icon" style={{ padding: '10px' }}>
              <FilterIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="frame-card">
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>상품</th>
                <th>패키지</th>
                <th>예식일</th>
                <th>상태</th>
                <th>금액</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} onClick={() => openOrderDetail(order)} style={{ cursor: 'pointer' }}>
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
                        <span className="customer-email">{order.venue}</span>
                      </div>
                    </div>
                  </td>
                  <td>{order.type}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(212, 165, 116, 0.15)',
                      color: 'var(--amber)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}>
                      {order.package}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon />
                      {order.weddingDate}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="price-cell">{formatPrice(order.price)}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Action menu
                      }}
                    >
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--frame-gap)', marginTop: 'var(--frame-gap)' }}>
        <div className="stat-card" style={{ '--stat-accent': '#D4A574' } as React.CSSProperties}>
          <div className="stat-label">이번 달 주문</div>
          <div className="stat-value">23</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#FFB84D' } as React.CSSProperties}>
          <div className="stat-label">진행 중</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#4DAFFF' } as React.CSSProperties}>
          <div className="stat-label">검토 대기</div>
          <div className="stat-value">3</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#4DFF88' } as React.CSSProperties}>
          <div className="stat-label">완료</div>
          <div className="stat-value">8</div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedOrder.customer}</div>
                <div style={{ fontSize: '13px', color: 'var(--cream-muted)', marginTop: '4px' }}>
                  {selectedOrder.id}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              {/* Order Status Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className={`status-badge ${selectedOrder.status}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--cream-muted)' }}>
                    주문일: {selectedOrder.orderDate}
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">상품</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.type}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">패키지</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.package}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">예식일</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.weddingDate}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">금액</label>
                  <div style={{ color: 'var(--amber)', fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {formatPrice(selectedOrder.price)}
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">예식장</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.venue}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">이메일</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.email}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">연락처</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedOrder.phone}</div>
                </div>
                {selectedOrder.notes && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">메모</label>
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--cinema-elevated)',
                      borderRadius: '4px',
                      color: 'var(--cream-soft)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}>
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>닫기</button>
              <button className="btn btn-primary">상태 변경</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
