/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { Coffee, RotateCcw, CheckCircle2 } from 'lucide-react';

// ==========================================
// 1. 타입 정의 및 기본 상수 데이터
// ==========================================

// 음료 메뉴 항목 정의
interface BeverageItem {
  id: string;
  name: string;
  price: number;
}

// 음료 목록 데이터 (단위: 원)
const BEVERAGE_LIST: BeverageItem[] = [
  { id: 'americano', name: '아메리카노', price: 3500 },
  { id: 'caffe_latte', name: '카페라떼', price: 4000 },
  { id: 'caffe_mocha', name: '카페모카', price: 4500 },
  { id: 'vanilla_latte', name: '바닐라라떼', price: 4500 },
  { id: 'green_tea_latte', name: '녹차라떼', price: 4500 },
];

// 사이즈 옵션 데이터 (단위: 원)
interface SizeOption {
  id: string;
  name: string;
  price: number;
}

const SIZE_OPTIONS: SizeOption[] = [
  { id: 'S', name: 'S', price: 0 },
  { id: 'M', name: 'M', price: 500 }, // 기본 선택 (+500원)
  { id: 'L', name: 'L', price: 1000 },
];

// 추가 옵션 데이터 (단위: 원)
interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

const EXTRA_OPTIONS: ExtraOption[] = [
  { id: 'shot', name: '샷 추가', price: 500 },
  { id: 'cream', name: '크림 추가', price: 500 },
  { id: 'syrup', name: '시럽 추가', price: 300 },
  { id: 'decaf', name: '디카페인', price: 0 },
];

// 접수된 주문 기록 타입
interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  beverageName: string;
  sizeName: string;
  selectedOptionsText: string;
  quantity: number;
  totalPrice: number;
  requests: string;
  orderTime: string;
}

export default function App() {
  // ==========================================
  // 2. 상태 관리 (React State)
  // ==========================================
  // 주문자 정보
  const [customerName, setCustomerName] = useState<string>(''); // 1. 이름 (필수)
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // 2. 전화번호

  // 주문 음료 및 옵션
  const [selectedBeverageId, setSelectedBeverageId] = useState<string>(''); // 3. 음료 선택 (드롭다운)
  const [selectedSize, setSelectedSize] = useState<string>('M'); // 4. 사이즈 (기본값 'M')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // 5. 추가 옵션 목록 (체크박스)
  const [quantity, setQuantity] = useState<number>(1); // 6. 수량 (기본값 1, 범위: 1~10)
  const [requests, setRequests] = useState<string>(''); // 7. 요청사항

  // 주문 접수 결과 메시지 및 최근 주문 저장
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);

  // 고유 ID 생성 (접근성: label - input 연결용)
  const nameInputId = useId();
  const phoneInputId = useId();
  const beverageSelectId = useId();
  const quantityInputId = useId();
  const requestsTextareaId = useId();

  // ==========================================
  // 3. 실시간 금액 계산 (JavaScript 기능)
  // ==========================================
  // 선택된 음료 객체 조회
  const selectedBeverage = BEVERAGE_LIST.find((item) => item.id === selectedBeverageId);
  const beveragePrice = selectedBeverage ? selectedBeverage.price : 0;

  // 선택된 사이즈 추가 금액 조회
  const currentSizeObj = SIZE_OPTIONS.find((s) => s.id === selectedSize);
  const sizeExtraPrice = currentSizeObj ? currentSizeObj.price : 0;

  // 선택된 추가 옵션들의 합산 금액 계산
  const optionsExtraPrice = selectedOptions.reduce((total, optId) => {
    const opt = EXTRA_OPTIONS.find((o) => o.id === optId);
    return total + (opt ? opt.price : 0);
  }, 0);

  // 1잔당 단가 (음료가 선택되지 않았으면 0원 기준 계산)
  const unitPrice = beveragePrice > 0 ? beveragePrice + sizeExtraPrice + optionsExtraPrice : 0;

  // 최종 예상 금액 = 1잔 단가 * 수량
  const expectedTotalPrice = unitPrice * quantity;

  // ==========================================
  // 4. 이벤트 핸들러
  // ==========================================

  // 추가 옵션 체크박스 변경 핸들러
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  // 수량 변경 핸들러 (1 ~ 10 제한)
  const handleQuantityChange = (value: number) => {
    if (isNaN(value)) return;
    const clamped = Math.max(1, Math.min(10, value));
    setQuantity(clamped);
  };

  // 다시 작성 (초기화) 버튼 클릭 핸들러
  const handleReset = () => {
    setCustomerName('');
    setPhoneNumber('');
    setSelectedBeverageId('');
    setSelectedSize('M');
    setSelectedOptions([]);
    setQuantity(1);
    setRequests('');
    setConfirmationMessage(null);
  };

  // 주문하기 버튼 클릭 핸들러 (유효성 검사 및 확인 메시지 표시)
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1) 이름 필수 입력 확인
    if (!customerName.trim()) {
      alert('이름을 입력해주세요');
      const nameInput = document.getElementById(nameInputId);
      nameInput?.focus();
      return;
    }

    // 2) 음료 선택 확인
    if (!selectedBeverageId || !selectedBeverage) {
      alert('음료를 선택해주세요');
      const beverageSelect = document.getElementById(beverageSelectId);
      beverageSelect?.focus();
      return;
    }

    // 추가 옵션 이름 텍스트 포맷 (예: "(샷 추가, 크림 추가)" 또는 추가옵션 없을 시 빈칸)
    const selectedOptionNames = selectedOptions
      .map((optId) => EXTRA_OPTIONS.find((o) => o.id === optId)?.name)
      .filter(Boolean);

    const optionsText =
      selectedOptionNames.length > 0 ? ` (${selectedOptionNames.join(', ')})` : '';

    // 주문 확인 메시지 포맷:
    // "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
    const formattedPrice = expectedTotalPrice.toLocaleString('ko-KR');
    const message = `${customerName.trim()}님, ${selectedBeverage.name} ${selectedSize}사이즈${optionsText} ${quantity}잔, 총 ${formattedPrice}원 주문이 접수되었습니다!`;

    // 상태 업데이트
    setConfirmationMessage(message);

    // 최신 주문 내역 객체 보관
    const newOrder: OrderRecord = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      phone: phoneNumber.trim() || '미입력',
      beverageName: selectedBeverage.name,
      sizeName: selectedSize,
      selectedOptionsText: selectedOptionNames.join(', ') || '없음',
      quantity,
      totalPrice: expectedTotalPrice,
      requests: requests.trim() || '없음',
      orderTime: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setLatestOrder(newOrder);

    // 확인 메시지 영역으로 부드러운 스크롤 이동
    setTimeout(() => {
      document.getElementById('confirmation-box')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#3e2723] flex flex-col justify-between py-8 px-4 font-sans selection:bg-[#6b4226] selection:text-white">
      {/* 최대 너비 520px 가운데 정렬 컨테이너 */}
      <div className="w-full max-w-[520px] mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(107,66,38,0.08)] border border-[#ebd8c8] overflow-hidden transition-all">
        
        {/* 카페 주문서 본문 영역 */}
        <div className="p-6 sm:p-7">
          {/* [페이지 상단 헤더 영역] */}
          <header className="text-center pb-6 border-b border-[#f5ede4]">
            {/* 카페 로고: ☕ 이모지 크게 */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fdf5ed] text-4xl mb-3 shadow-inner">
              ☕
            </div>
            {/* 카페 이름: 바이브 카페 */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6b4226] tracking-tight">
              바이브 카페
            </h1>
            {/* 부제: "당신의 하루에 바이브를 더하다" */}
            <p className="text-sm sm:text-base text-[#8d6e63] mt-1 font-medium">
              당신의 하루에 바이브를 더하다
            </p>
          </header>

          {/* [주문서 폼 시작] */}
          <form onSubmit={handleOrderSubmit} className="mt-6 space-y-5" noValidate>
            
            {/* 1. 이름 (필수, text) */}
            <div>
              <label
                htmlFor={nameInputId}
                className="block text-sm font-bold text-[#5d4037] mb-1.5"
              >
                주문자 이름 <span className="text-[#d32f2f]">*</span>
              </label>
              <input
                id={nameInputId}
                type="text"
                required
                placeholder="예: 홍길동"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-[10px] rounded-[8px] border border-[#d7ccc8] text-[#3e2723] bg-[#fdfbf9] focus:bg-white focus:outline-none focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 transition-all text-sm"
              />
            </div>

            {/* 2. 전화번호 (tel) */}
            <div>
              <label
                htmlFor={phoneInputId}
                className="block text-sm font-bold text-[#5d4037] mb-1.5"
              >
                전화번호
              </label>
              <input
                id={phoneInputId}
                type="tel"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-[10px] rounded-[8px] border border-[#d7ccc8] text-[#3e2723] bg-[#fdfbf9] focus:bg-white focus:outline-none focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 transition-all text-sm"
              />
            </div>

            {/* 3. 음료 선택 (드롭다운) */}
            <div>
              <label
                htmlFor={beverageSelectId}
                className="block text-sm font-bold text-[#5d4037] mb-1.5"
              >
                음료 선택 <span className="text-[#d32f2f]">*</span>
              </label>
              <select
                id={beverageSelectId}
                value={selectedBeverageId}
                onChange={(e) => setSelectedBeverageId(e.target.value)}
                className="w-full p-[10px] rounded-[8px] border border-[#d7ccc8] text-[#3e2723] bg-[#fdfbf9] focus:bg-white focus:outline-none focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 transition-all text-sm cursor-pointer"
              >
                <option value="">-- 음료를 선택해주세요 --</option>
                {BEVERAGE_LIST.map((bev) => (
                  <option key={bev.id} value={bev.id}>
                    {bev.name} ({bev.price.toLocaleString('ko-KR')}원)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
            <div>
              <span className="block text-sm font-bold text-[#5d4037] mb-2">
                사이즈 선택
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {SIZE_OPTIONS.map((size) => {
                  const radioId = `size-option-${size.id}`;
                  const isChecked = selectedSize === size.id;
                  return (
                    <label
                      key={size.id}
                      htmlFor={radioId}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-[#6b4226]/10 border-[#6b4226] font-semibold text-[#6b4226]'
                          : 'border-[#e0d6ce] bg-[#fdfbf9] text-[#5d4037] hover:bg-[#f7efe8]'
                      }`}
                    >
                      <input
                        id={radioId}
                        type="radio"
                        name="size-group"
                        value={size.id}
                        checked={isChecked}
                        onChange={() => setSelectedSize(size.id)}
                        className="accent-[#6b4226] cursor-pointer"
                      />
                      <span>
                        {size.name}{' '}
                        <span className="text-xs text-[#8d6e63]">
                          (+{size.price.toLocaleString('ko-KR')}원)
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
            <div>
              <span className="block text-sm font-bold text-[#5d4037] mb-2">
                추가 옵션
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {EXTRA_OPTIONS.map((opt) => {
                  const checkboxId = `extra-opt-${opt.id}`;
                  const isChecked = selectedOptions.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      htmlFor={checkboxId}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-[#6b4226]/10 border-[#6b4226] font-semibold text-[#6b4226]'
                          : 'border-[#e0d6ce] bg-[#fdfbf9] text-[#5d4037] hover:bg-[#f7efe8]'
                      }`}
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleOptionToggle(opt.id)}
                        className="accent-[#6b4226] cursor-pointer rounded"
                      />
                      <span>
                        {opt.name}{' '}
                        <span className="text-xs text-[#8d6e63]">
                          (+{opt.price.toLocaleString('ko-KR')}원)
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
            <div>
              <label
                htmlFor={quantityInputId}
                className="block text-sm font-bold text-[#5d4037] mb-1.5"
              >
                수량 (최소 1잔, 최대 10잔)
              </label>
              <div className="flex items-center gap-2 max-w-[180px]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  aria-label="수량 감소"
                  className="w-10 h-10 flex items-center justify-center rounded-[8px] border border-[#d7ccc8] bg-[#fdfbf9] text-[#6b4226] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5ede4] active:scale-95 transition-all cursor-pointer"
                >
                  -
                </button>
                <input
                  id={quantityInputId}
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                  className="w-full text-center p-[10px] rounded-[8px] border border-[#d7ccc8] text-[#3e2723] font-bold bg-[#fdfbf9] focus:bg-white focus:outline-none focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  aria-label="수량 증가"
                  className="w-10 h-10 flex items-center justify-center rounded-[8px] border border-[#d7ccc8] bg-[#fdfbf9] text-[#6b4226] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5ede4] active:scale-95 transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 7. 요청사항 (textarea) */}
            <div>
              <label
                htmlFor={requestsTextareaId}
                className="block text-sm font-bold text-[#5d4037] mb-1.5"
              >
                요청사항
              </label>
              <textarea
                id={requestsTextareaId}
                rows={3}
                placeholder="예: 얼음 적게 넣어주세요, 텀블러 할인 부탁드립니다 등"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                className="w-full p-[10px] rounded-[8px] border border-[#d7ccc8] text-[#3e2723] bg-[#fdfbf9] focus:bg-white focus:outline-none focus:border-[#6b4226] focus:ring-2 focus:ring-[#6b4226]/20 transition-all text-sm resize-none"
              />
            </div>

            {/* [실시간 예상 금액 표시 영역] */}
            {/* 주문하기 버튼 바로 위에 큰 글씨(24px), 갈색(#6b4226), 굵게, 가운데 정렬 */}
            <div className="pt-3 pb-1 border-t border-[#f5ede4]">
              <div className="text-[24px] text-[#6b4226] font-bold text-center tracking-tight py-2 bg-[#fbf7f2] rounded-xl border border-[#ebd8c8]/60">
                <span className="text-base font-medium text-[#8d6e63] block text-xs sm:text-sm">
                  {selectedBeverage ? '실시간 계산 금액' : '음료를 선택해주세요'}
                </span>
                예상 금액: {expectedTotalPrice.toLocaleString('ko-KR')}원
              </div>
            </div>

            {/* [버튼 그룹] */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {/* 8. 주문하기 버튼: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게 */}
              <button
                type="submit"
                className="flex-1 bg-[#6b4226] text-white py-3.5 px-6 rounded-[8px] font-bold text-base shadow-md hover:bg-[#7d4e2d] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Coffee className="w-5 h-5" />
                주문하기
              </button>

              {/* 9. 다시 작성 버튼: 초기화 */}
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#f5ede4] text-[#6b4226] py-3.5 px-5 rounded-[8px] font-semibold text-sm hover:bg-[#ede0d4] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#ebd8c8]"
              >
                <RotateCcw className="w-4 h-4" />
                다시 작성
              </button>
            </div>
          </form>

          {/* [주문 확인 메시지 영역] */}
          {/* 연두색 배경, 초록 글씨, 둥근 모서리 */}
          {confirmationMessage && (
            <div
              id="confirmation-box"
              className="mt-6 p-4 rounded-[8px] bg-[#edf7ed] text-[#2e7d32] border border-[#c8e6c9] text-center shadow-sm animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-center gap-2 mb-1.5 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0" />
                <span>주문 접수가 성공적으로 완료되었습니다!</span>
              </div>
              <p className="text-sm font-semibold break-keep leading-relaxed text-[#1b5e20]">
                {confirmationMessage}
              </p>
              {latestOrder?.requests && latestOrder.requests !== '없음' && (
                <p className="text-xs text-[#388e3c] mt-2 pt-2 border-t border-[#c8e6c9]/60">
                  요청사항: {latestOrder.requests}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 푸터 영역 */}
        <footer className="bg-[#fcf9f5] border-t border-[#f0e4d8] py-3 text-center text-xs text-[#a1887f]">
          ☕ 바이브 카페 (Vibe Cafe) &bull; 따뜻한 여유를 전합니다
        </footer>
      </div>
    </div>
  );
}
