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

  revalidatePath(`/pages/${data.pageId}`);
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

  revalidatePath(`/pages/${block.pageId}`);
  return {
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  };
}

// 블록 삭제
export async function deleteBlock(blockId: string) {
  const block = await prisma.block.delete({
    where: { id: blockId },
  });

  revalidatePath(`/pages/${block.pageId}`);
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

  revalidatePath(`/pages/${pageId}`);
}

// 블록 타입 변경
export async function changeBlockType(blockId: string, newType: string) {
  const block = await prisma.block.update({
    where: { id: blockId },
    data: { type: newType },
  });

  revalidatePath(`/pages/${block.pageId}`);
  return {
    ...block,
    props: JSON.parse(block.props) as BlockProps,
  };
}

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
