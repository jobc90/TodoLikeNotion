'use client';

import { useState } from 'react';

// Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Sample customer data
const customersData = [
  {
    id: 'CUS-001',
    name: '박성민 & 김하은',
    email: 'park.sm@email.com',
    phone: '010-1234-5678',
    totalOrders: 2,
    totalSpent: 3600000,
    lastOrder: '2024.01.22',
    firstOrder: '2023.09.15',
    tags: ['VIP', '재구매'],
    notes: '신랑측 어머니가 소개로 방문. 본식 + 식전 영상 모두 제작.',
    rating: 5,
    status: 'active',
  },
  {
    id: 'CUS-002',
    name: '조영훈 & 이미래',
    email: 'cho.yh@email.com',
    phone: '010-2345-6789',
    totalOrders: 1,
    totalSpent: 2500000,
    lastOrder: '2024.01.21',
    firstOrder: '2024.01.21',
    tags: ['신규'],
    notes: '해외 웨딩 촬영 요청. 발리 여행 일정에 맞춰 진행.',
    rating: 0,
    status: 'active',
  },
  {
    id: 'CUS-003',
    name: '강동현 & 신유진',
    email: 'kang.dh@email.com',
    phone: '010-3456-7890',
    totalOrders: 1,
    totalSpent: 800000,
    lastOrder: '2024.01.20',
    firstOrder: '2024.01.20',
    tags: ['신규'],
    notes: '',
    rating: 0,
    status: 'active',
  },
  {
    id: 'CUS-004',
    name: '김민준 & 이수진',
    email: 'kim.mj@email.com',
    phone: '010-4567-8901',
    totalOrders: 3,
    totalSpent: 5800000,
    lastOrder: '2024.01.15',
    firstOrder: '2022.11.20',
    tags: ['VIP', '추천인'],
    notes: '지인 3팀 소개해주심. 특별 할인 제공.',
    rating: 5,
    status: 'active',
  },
  {
    id: 'CUS-005',
    name: '최현우 & 박지영',
    email: 'choi.hw@email.com',
    phone: '010-5678-9012',
    totalOrders: 1,
    totalSpent: 1200000,
    lastOrder: '2024.01.14',
    firstOrder: '2024.01.14',
    tags: ['신규'],
    notes: '신부측 친구 소개로 방문.',
    rating: 4,
    status: 'active',
  },
  {
    id: 'CUS-006',
    name: '정태희 & 한소영',
    email: 'jung.th@email.com',
    phone: '010-6789-0123',
    totalOrders: 1,
    totalSpent: 800000,
    lastOrder: '2024.01.12',
    firstOrder: '2024.01.12',
    tags: ['신규'],
    notes: '',
    rating: 0,
    status: 'active',
  },
  {
    id: 'CUS-007',
    name: '이준서 & 김예린',
    email: 'lee.js@email.com',
    phone: '010-7890-1234',
    totalOrders: 2,
    totalSpent: 3200000,
    lastOrder: '2024.01.05',
    firstOrder: '2023.06.10',
    tags: ['재구매'],
    notes: '식전 영상 먼저 제작 후 본식 추가 주문.',
    rating: 5,
    status: 'active',
  },
  {
    id: 'CUS-008',
    name: '윤성호 & 장미경',
    email: 'yoon.sh@email.com',
    phone: '010-8901-2345',
    totalOrders: 1,
    totalSpent: 2500000,
    lastOrder: '2023.12.28',
    firstOrder: '2023.12.28',
    tags: ['신규'],
    notes: '추가 수정 요청 2회 있었음.',
    rating: 4,
    status: 'active',
  },
];

type ViewMode = 'grid' | 'list';
type CustomerTag = 'all' | 'VIP' | '재구매' | '신규';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  firstOrder: string;
  tags: string[];
  notes: string;
  rating: number;
  status: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tagFilter, setTagFilter] = useState<CustomerTag>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);

  const tagFilters: { value: CustomerTag; label: string }[] = [
    { value: 'all', label: '전체 고객' },
    { value: 'VIP', label: 'VIP' },
    { value: '재구매', label: '재구매' },
    { value: '신규', label: '신규' },
  ];

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesTag = tagFilter === 'all' || customer.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
  };

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Stats
  const totalCustomers = customersData.length;
  const vipCustomers = customersData.filter(c => c.tags.includes('VIP')).length;
  const repeatCustomers = customersData.filter(c => c.totalOrders > 1).length;
  const avgSpent = customersData.reduce((acc, c) => acc + c.totalSpent, 0) / totalCustomers;

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">고객 관리</h1>
            <p className="page-subtitle">소중한 고객 정보를 관리하세요</p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon />
            고객 추가
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--frame-gap)', marginBottom: 'var(--frame-gap)' }}>
        <div className="stat-card" style={{ '--stat-accent': '#D4A574' } as React.CSSProperties}>
          <div className="stat-label">전체 고객</div>
          <div className="stat-value">{totalCustomers}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#FFB84D' } as React.CSSProperties}>
          <div className="stat-label">VIP 고객</div>
          <div className="stat-value">{vipCustomers}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#4DAFFF' } as React.CSSProperties}>
          <div className="stat-label">재구매 고객</div>
          <div className="stat-value">{repeatCustomers}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#4DFF88' } as React.CSSProperties}>
          <div className="stat-label">평균 결제금액</div>
          <div className="stat-value" style={{ fontSize: '24px' }}>{formatPrice(avgSpent)}</div>
        </div>
      </div>

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
                placeholder="이름, 이메일, 연락처 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Tag Filters */}
              <div className="filter-pills" style={{ margin: 0 }}>
                {tagFilters.map((filter) => (
                  <button
                    key={filter.value}
                    className={`filter-pill ${tagFilter === filter.value ? 'active' : ''}`}
                    onClick={() => setTagFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--cinema-elevated)', borderRadius: '6px' }}>
                <button
                  className={`action-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? 'var(--cinema-card)' : 'transparent',
                    border: 'none',
                  }}
                >
                  <GridIcon />
                </button>
                <button
                  className={`action-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? 'var(--cinema-card)' : 'transparent',
                    border: 'none',
                  }}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid/List */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--frame-gap)',
        }}>
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="frame-card"
              style={{ cursor: 'pointer', transition: 'all var(--transition-smooth)' }}
              onClick={() => openCustomerDetail(customer)}
            >
              <div className="frame-card-body">
                {/* Customer Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div className="customer-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                    {customer.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--cream)', fontSize: '16px' }}>{customer.name}</span>
                      {customer.tags.includes('VIP') && (
                        <span style={{
                          padding: '2px 8px',
                          background: 'rgba(212, 165, 116, 0.2)',
                          color: 'var(--amber)',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                        }}>
                          VIP
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cream-muted)', fontSize: '13px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} filled={i < customer.rating} />
                      ))}
                      {customer.rating > 0 && <span style={{ marginLeft: '4px' }}>({customer.rating})</span>}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--cream-soft)' }}>
                    <MailIcon />
                    {customer.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--cream-soft)' }}>
                    <PhoneIcon />
                    {customer.phone}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--cinema-elevated)',
                  borderRadius: '6px',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      주문 횟수
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--cream)' }}>
                      {customer.totalOrders}회
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      총 결제금액
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--amber)' }}>
                      {formatPrice(customer.totalSpent)}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 10px',
                        background: tag === 'VIP' ? 'rgba(212, 165, 116, 0.15)' :
                                  tag === '재구매' ? 'rgba(77, 175, 255, 0.15)' :
                                  'rgba(160, 160, 165, 0.15)',
                        color: tag === 'VIP' ? 'var(--amber)' :
                              tag === '재구매' ? '#4DAFFF' :
                              'var(--cream-muted)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="frame-card">
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>고객</th>
                  <th>연락처</th>
                  <th>주문 횟수</th>
                  <th>총 결제금액</th>
                  <th>최근 주문</th>
                  <th>평점</th>
                  <th>태그</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} onClick={() => openCustomerDetail(customer)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="customer-info">
                          <span className="customer-name">{customer.name}</span>
                          <span className="customer-email">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{customer.totalOrders}회</span>
                    </td>
                    <td className="price-cell">{formatPrice(customer.totalSpent)}</td>
                    <td>{customer.lastOrder}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--amber)' }}>
                        {customer.rating > 0 ? (
                          <>
                            <StarIcon filled={true} />
                            <span style={{ marginLeft: '4px', fontWeight: 500 }}>{customer.rating}</span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--cream-muted)' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 8px',
                              background: tag === 'VIP' ? 'rgba(212, 165, 116, 0.15)' :
                                        tag === '재구매' ? 'rgba(77, 175, 255, 0.15)' :
                                        'rgba(160, 160, 165, 0.15)',
                              color: tag === 'VIP' ? 'var(--amber)' :
                                    tag === '재구매' ? '#4DAFFF' :
                                    'var(--cream-muted)',
                              borderRadius: '3px',
                              fontSize: '11px',
                              fontWeight: 500,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="customer-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="modal-title">{selectedCustomer.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--cream-muted)', marginTop: '2px' }}>
                    {selectedCustomer.id} | 첫 주문: {selectedCustomer.firstOrder}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              {/* Stats Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                padding: '20px',
                background: 'var(--cinema-elevated)',
                borderRadius: '8px',
                marginBottom: '24px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    주문 횟수
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--cream)' }}>
                    {selectedCustomer.totalOrders}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    총 결제금액
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--amber)' }}>
                    {formatPrice(selectedCustomer.totalSpent)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    평점
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--amber)' }}>
                    {selectedCustomer.rating > 0 ? (
                      <>
                        <StarIcon filled={true} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600 }}>{selectedCustomer.rating}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-display)', fontSize: '24px' }}>-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">이메일</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cream)', fontSize: '15px' }}>
                    <MailIcon />
                    {selectedCustomer.email}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">연락처</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cream)', fontSize: '15px' }}>
                    <PhoneIcon />
                    {selectedCustomer.phone}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">최근 주문일</label>
                  <div style={{ color: 'var(--cream)', fontSize: '15px' }}>{selectedCustomer.lastOrder}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">태그</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedCustomer.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '4px 10px',
                          background: tag === 'VIP' ? 'rgba(212, 165, 116, 0.15)' :
                                    tag === '재구매' ? 'rgba(77, 175, 255, 0.15)' :
                                    tag === '추천인' ? 'rgba(77, 255, 136, 0.15)' :
                                    'rgba(160, 160, 165, 0.15)',
                          color: tag === 'VIP' ? 'var(--amber)' :
                                tag === '재구매' ? '#4DAFFF' :
                                tag === '추천인' ? '#4DFF88' :
                                'var(--cream-muted)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="form-group">
                  <label className="form-label">메모</label>
                  <div style={{
                    padding: '16px',
                    background: 'var(--cinema-card)',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 240, 232, 0.06)',
                    color: 'var(--cream-soft)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}>
                    {selectedCustomer.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>닫기</button>
              <button className="btn btn-primary">수정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
