
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Order database...");

  // 1. Clean up existing "주문정보" database if it exists
  const existingDb = await prisma.database.findFirst({
    where: { title: "주문정보" },
  });

  if (existingDb) {
    console.log("Deleting existing '주문정보' database...");
    await prisma.database.delete({
      where: { id: existingDb.id },
    });
  }

  // 2. Create Database
  const db = await prisma.database.create({
    data: {
      title: "주문정보",
      icon: "📋",
      views: {
        create: {
          name: "기본 뷰",
          type: "table",
          order: 0,
        },
      },
    },
  });

  console.log(`Created database: ${db.id}`);

  // 3. Define Properties (16 columns)
  const properties = [
    { name: "진행단계", type: "select", width: 120, options: JSON.stringify({ options: [
      { id: "opt_status_complete", name: "주문 완료", color: "red" },
      { id: "opt_status_making", name: "제작 시작", color: "yellow" },
      { id: "opt_status_final", name: "최종본 전달", color: "green" },
      { id: "opt_status_promo", name: "홍보 중", color: "blue" },
    ]}) },
    { name: "주문일", type: "date", width: 120 },
    { name: "구매자명", type: "text", width: 100 },
    { name: "신부", type: "text", width: 100 },
    { name: "신랑", type: "text", width: 100 },
    { name: "영상버전", type: "select", width: 120, options: JSON.stringify({ options: [
      { id: "opt_ver_1", name: "식전 - 1", color: "yellow" },
      { id: "opt_ver_2", name: "식전 - 2", color: "orange" },
      { id: "opt_ver_3", name: "식전 - 3", color: "brown" },
      { id: "opt_ver_4", name: "식전 - 4", color: "green" },
    ]}) },
    { name: "제작옵션", type: "select", width: 100, options: JSON.stringify({ options: [
      { id: "opt_opt_3day", name: "3일", color: "yellow" },
      { id: "opt_opt_normal", name: "일반", color: "default" },
      { id: "opt_opt_1day", name: "1일", color: "red" },
      { id: "opt_opt_5day", name: "5일", color: "green" },
    ]}) },
    { name: "결혼날짜", type: "date", width: 120 },
    { name: "사진제출", type: "date", width: 120 }, // 사진제출날짜 shortened
    { name: "마감일", type: "date", width: 120 },
    { name: "영상전달", type: "date", width: 120 }, // 영상전달날짜 shortened
    { name: "SNS 동의", type: "select", width: 100, options: JSON.stringify({ options: [
      { id: "opt_sns_o", name: "O", color: "red" },
      { id: "opt_sns_x", name: "X", color: "gray" },
    ]}) },
    { name: "구분", type: "select", width: 100, options: JSON.stringify({ options: [
      { id: "opt_type_order", name: "주문", color: "green" },
    ]}) },
    { name: "상담", type: "select", width: 120, options: JSON.stringify({ options: [ // 상담채널 shortened
      { id: "opt_ch_naver", name: "네이버", color: "default" },
      { id: "opt_ch_kakao", name: "카카오톡", color: "brown" }, // approximated
      { id: "opt_ch_email", name: "이메일", color: "default" },
      { id: "opt_ch_kmong", name: "크몽", color: "default" },
    ]}) },
    { name: "음원 변경", type: "text", width: 200 }, // 음원변경
    { name: "메모", type: "text", width: 200 }, // 특이사항/메모
  ];

  const createdProps = [];
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const created = await prisma.property.create({
      data: {
        databaseId: db.id,
        name: prop.name,
        type: prop.type,
        width: prop.width,
        options: prop.options || "{}",
        order: i,
      },
    });
    createdProps.push(created);
  }

  // Helper to find prop ID by name
  const p = (name: string) => createdProps.find((cp) => cp.name === name)?.id!;

  // 4. Insert Rows (Data from screenshot)
  const rowsData = [
    {
      "진행단계": "opt_status_complete", "주문일": "2026-01-12", "구매자명": "박소진", "신부": "박소진", "신랑": "임재광",
      "영상버전": "opt_ver_1", "제작옵션": "opt_opt_3day", "결혼날짜": "2026-01-25", "사진제출": "2026-01-14", "마감일": "2026-01-17",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_naver", "메모": "가사 상단"
    },
    {
      "진행단계": "opt_status_complete", "주문일": "2025-12-31", "구매자명": "김보연", "신부": "김보연", "신랑": "차재선",
      "영상버전": "opt_ver_4", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-03-07", "사진제출": "2026-01-03", "마감일": "2026-01-17",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_naver"
    },
    {
      "진행단계": "opt_status_complete", "주문일": "2026-01-05", "구매자명": "이제희", "신부": "이제희", "신랑": "김성진",
      "영상버전": "opt_ver_3", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-03-07", "사진제출": "2026-01-05", "마감일": "2026-01-19",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_kakao", "음원 변경": "이 세상 누구보다 사랑해 (세상 그 누구보다 소중한)", "메모": "가사 상단 / 친아버지"
    },
    {
      "진행단계": "opt_status_complete", "주문일": "2026-01-03", "구매자명": "최유림", "신부": "최유림", "신랑": "장병윤",
      "영상버전": "opt_ver_2", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-02-28", "사진제출": "2026-01-05", "마감일": "2026-01-20",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_kakao", "메모": "버전 1 취소 후 재구매"
    },
    {
      "진행단계": "opt_status_complete", "주문일": "2026-01-05", "구매자명": "한수미", "신부": "한수미", "신랑": "맹진영",
      "영상버전": "opt_ver_1", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-02-07", "사진제출": "2026-01-06", "마감일": "2026-01-20",
      "SNS 동의": "opt_sns_x", "구분": "opt_type_order", "상담": "opt_ch_naver", "음원 변경": "히계단 - 115만 킬로의 필름", "메모": "5분 이상 추가금 (3만원)"
    },
    {
      "진행단계": "opt_status_complete", "주문일": "2025-12-30", "구매자명": "정하윤", "신부": "정하윤", "신랑": "조영빈",
      "영상버전": "opt_ver_4", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-01-24", "사진제출": "2026-01-06", "마감일": "2026-01-21",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_naver", "메모": "20만원까지 1차분 답례"
    },
    {
      "진행단계": "opt_status_making", "주문일": "2025-12-28", "구매자명": "서채아", "신부": "서채아", "신랑": "임제형",
      "영상버전": "opt_ver_1", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-02-07", "사진제출": "2026-01-01", "마감일": "2026-01-15", "영상전달": "2026-01-15",
      "SNS 동의": "opt_sns_x", "구분": "opt_type_order", "상담": "opt_ch_kakao", "음원 변경": "데이식스 - Welcome to the show (멜키 MR)", "메모": "뒷부분은 프러포즈 + 초음파"
    },
    {
      "진행단계": "opt_status_final", "주문일": "2026-01-11", "구매자명": "조아라", "신부": "조아라", "신랑": "박기덕",
      "영상버전": "opt_ver_4", "제작옵션": "opt_opt_1day", "결혼날짜": "2026-01-25", "사진제출": "2026-01-11", "마감일": "2026-01-13", "영상전달": "2026-01-12",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_naver", "메모": "가사 상단 / 소낭판 서비스 감사카드"
    },
    {
      "진행단계": "opt_status_final", "주문일": "2026-01-04", "구매자명": "이지수", "신부": "이지수", "신랑": "김현기",
      "영상버전": "opt_ver_2", "제작옵션": "opt_opt_5day", "결혼날짜": "2026-01-31", "사진제출": "2026-01-09", "마감일": "2026-01-14", "영상전달": "2026-01-14",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_email"
    },
    {
      "진행단계": "opt_status_final", "주문일": "2025-12-30", "구매자명": "이현이", "신부": "이현이", "신랑": "김우성",
      "영상버전": "opt_ver_4", "제작옵션": "opt_opt_normal", "결혼날짜": "2026-01-31", "사진제출": "2025-12-30", "마감일": "2026-01-14", "영상전달": "2026-01-11",
      "SNS 동의": "opt_sns_x", "구분": "opt_type_order"
    },
    {
      "진행단계": "opt_status_promo", "주문일": "2025-03-29", "구매자명": "신화평", "신부": "권혜린", "신랑": "신화평",
      "영상버전": "opt_ver_1", "제작옵션": "opt_opt_3day", "결혼날짜": "2025-04-12", "사진제출": "2025-03-31", "마감일": "2025-04-03", "영상전달": "2025-04-02",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "음원 변경": "윤하 - 사계"
    },
     {
      "진행단계": "opt_status_promo", "주문일": "2025-03-24", "구매자명": "이진아", "신부": "이진아", "신랑": "남경국",
      "영상버전": "opt_ver_1", "제작옵션": "opt_opt_normal", "결혼날짜": "2025-04-13", "사진제출": "2025-03-25", "마감일": "2025-04-04", "영상전달": "2025-04-02",
      "SNS 동의": "opt_sns_o", "구분": "opt_type_order", "상담": "opt_ch_naver"
    }
  ];

  for (let i = 0; i < rowsData.length; i++) {
    const data = rowsData[i];
    const row = await prisma.row.create({
      data: {
        databaseId: db.id,
        order: i,
        cells: {
          create: Object.entries(data).map(([key, value]) => ({
            propertyId: p(key),
            value: value,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${rowsData.length} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
