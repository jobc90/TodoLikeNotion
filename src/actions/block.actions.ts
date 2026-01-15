"use server";

import prisma from "@/lib/prisma";
import type { CreateBlockDto, UpdateBlockDto, BlockProps } from "@/types/block";
import { extractPlainText } from "@/types/block";
import { revalidatePath } from "next/cache";

// ==================== Block CRUD (부분 저장) ====================

// 페이지의 모든 블록 조회
export async function getBlocksByPage(pageId: string) {
  const blocks = await prisma.block.findMany({
    where: { pageId },
    orderBy: { order: "asc" },
  });

  // props JSON 파싱
  return blocks.map((block) => ({
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  }));
}

// 블록 생성
export async function createBlock(data: CreateBlockDto) {
  // 현재 페이지의 마지막 order 가져오기
  const lastBlock = await prisma.block.findFirst({
    where: {
      pageId: data.pageId,
      parentBlockId: data.parentBlockId || null,
    },
    orderBy: { order: "desc" },
  });

  const newOrder = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);
  const props = data.props || { text: "" };

  const block = await prisma.block.create({
    data: {
      pageId: data.pageId,
      parentBlockId: data.parentBlockId || null,
      type: data.type,
      props: JSON.stringify(props),
      plainText: extractPlainText(props),
      order: newOrder,
    },
  });

  revalidatePath(`/workspace/${data.pageId}`);
  return {
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  };
}

// 블록 수정 (부분 업데이트)
export async function updateBlock(blockId: string, data: UpdateBlockDto) {
  // 기존 블록 조회
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    throw new Error("Block not found");
  }

  const existingProps = JSON.parse(existingBlock.props) as BlockProps;
  const newProps = data.props ? { ...existingProps, ...data.props } : existingProps;

  const block = await prisma.block.update({
    where: { id: blockId },
    data: {
      ...(data.type && { type: data.type }),
      props: JSON.stringify(newProps),
      plainText: extractPlainText(newProps),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  revalidatePath(`/workspace/${block.pageId}`);
  return {
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  };
}

// 블록 삭제
export async function deleteBlock(blockId: string) {
  // 먼저 블록 존재 여부 확인
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    // 이미 삭제된 블록이면 무시
    return null;
  }

  const block = await prisma.block.delete({
    where: { id: blockId },
  });

  revalidatePath(`/workspace/${block.pageId}`);
  return block;
}

// 블록 순서 재정렬
export async function reorderBlocks(
  pageId: string,
  blockOrders: { id: string; order: number }[]
) {
  await prisma.$transaction(
    blockOrders.map(({ id, order }) =>
      prisma.block.update({
        where: { id },
        data: { order },
      })
    )
  );

  revalidatePath(`/workspace/${pageId}`);
}

// 블록 타입 변경
export async function changeBlockType(blockId: string, newType: string) {
  const block = await prisma.block.update({
    where: { id: blockId },
    data: { type: newType },
  });

  revalidatePath(`/workspace/${block.pageId}`);
  return {
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  };
}

// ==================== 경량 업데이트 (revalidatePath 없음) ====================
// 텍스트 입력 시 사용 - 로컬 상태가 이미 최신이므로 페이지 갱신 불필요

/**
 * 블록 텍스트만 업데이트 (revalidatePath 호출 안 함)
 * - 텍스트 입력 시 디바운스된 자동 저장에 사용
 * - 로컬 상태가 이미 최신이므로 서버 갱신만 수행
 */
export async function updateBlockText(blockId: string, text: string) {
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    throw new Error("Block not found");
  }

  const existingProps = JSON.parse(existingBlock.props) as BlockProps;
  const newProps = { ...existingProps, text };

  await prisma.block.update({
    where: { id: blockId },
    data: {
      props: JSON.stringify(newProps),
      plainText: extractPlainText(newProps),
    },
  });

  // revalidatePath 호출하지 않음!
  // 로컬 상태가 이미 최신이므로 페이지 갱신 불필요
}

/**
 * 블록 props만 업데이트 (revalidatePath 호출 안 함)
 * - 체크박스 토글, 토글 확장 등에 사용
 * - 로컬 상태가 이미 최신이므로 서버 갱신만 수행
 */
export async function updateBlockProps(
  blockId: string,
  propsUpdate: Partial<BlockProps>
) {
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    throw new Error("Block not found");
  }

  const existingProps = JSON.parse(existingBlock.props) as BlockProps;
  const newProps = { ...existingProps, ...propsUpdate };

  await prisma.block.update({
    where: { id: blockId },
    data: {
      props: JSON.stringify(newProps),
      plainText: extractPlainText(newProps),
    },
  });

  // revalidatePath 호출하지 않음!
}

/**
 * 블록 순서만 재정렬 (revalidatePath 호출 안 함)
 * - 드래그앤드롭 시 사용
 * - 로컬 상태가 이미 최신이므로 서버 갱신만 수행
 */
export async function reorderBlocksQuiet(
  blockOrders: { id: string; order: number }[]
) {
  await prisma.$transaction(
    blockOrders.map(({ id, order }) =>
      prisma.block.update({
        where: { id },
        data: { order },
      })
    )
  );

  // revalidatePath 호출하지 않음!
}

/**
 * 블록 삭제 (revalidatePath 호출 안 함)
 * - optimistic update 후 사용
 * - 로컬 상태가 이미 업데이트되었으므로 서버만 동기화
 */
export async function deleteBlockQuiet(blockId: string) {
  // 먼저 블록 존재 여부 확인
  const existingBlock = await prisma.block.findUnique({
    where: { id: blockId },
  });

  if (!existingBlock) {
    // 이미 삭제된 블록이면 무시 (optimistic update로 인한 중복 요청 가능)
    return null;
  }

  const block = await prisma.block.delete({
    where: { id: blockId },
  });

  // revalidatePath 호출하지 않음!
  return block;
}

// ==================== 기존 함수 (구조 변경용) ====================

// 블록을 다른 위치에 삽입 (드래그 앤 드롭용)
export async function insertBlockAfter(
  pageId: string,
  blockId: string,
  afterBlockId: string | null
) {
  const blocks = await prisma.block.findMany({
    where: { pageId, parentBlockId: null },
    orderBy: { order: "asc" },
  });

  const blockToMove = blocks.find((b) => b.id === blockId);
  if (!blockToMove) return;

  const otherBlocks = blocks.filter((b) => b.id !== blockId);

  let newOrder: { id: string; order: number }[] = [];

  if (afterBlockId === null) {
    // 맨 앞으로 이동
    newOrder = [
      { id: blockId, order: 0 },
      ...otherBlocks.map((b, i) => ({ id: b.id, order: i + 1 })),
    ];
  } else {
    const afterIndex = otherBlocks.findIndex((b) => b.id === afterBlockId);
    const before = otherBlocks.slice(0, afterIndex + 1);
    const after = otherBlocks.slice(afterIndex + 1);

    newOrder = [
      ...before.map((b, i) => ({ id: b.id, order: i })),
      { id: blockId, order: before.length },
      ...after.map((b, i) => ({ id: b.id, order: before.length + 1 + i })),
    ];
  }

  await reorderBlocks(pageId, newOrder);
}
