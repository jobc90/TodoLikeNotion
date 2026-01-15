"use server";

import prisma from "@/lib/prisma";
import type { CreatePageDto, UpdatePageDto, PageListItem } from "@/types/page";
import { revalidatePath } from "next/cache";

// ==================== Page CRUD ====================

// 페이지 목록 조회 (아카이브 제외)
export async function getPages(): Promise<PageListItem[]> {
  const pages = await prisma.page.findMany({
    where: { archived: false },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
      archived: true,
    },
  });
  return pages;
}

// 아카이브된 페이지 목록
export async function getArchivedPages(): Promise<PageListItem[]> {
  const pages = await prisma.page.findMany({
    where: { archived: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
      archived: true,
    },
  });
  return pages;
}

// 단일 페이지 조회 (블록 포함)
export async function getPageWithBlocks(pageId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
      tags: {
        include: { tag: true },
      },
    },
  });
  return page;
}

// 페이지 생성
export async function createPage(data: CreatePageDto = {}) {
  const page = await prisma.page.create({
    data: {
      title: data.title || "Untitled",
      icon: data.icon || "📄",
      // 기본 paragraph 블록 추가
      blocks: {
        create: {
          type: "paragraph",
          props: JSON.stringify({ text: "" }),
          order: 0,
        },
      },
    },
  });
  revalidatePath("/");
  return page;
}

// 페이지 수정
export async function updatePage(pageId: string, data: UpdatePageDto) {
  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.cover !== undefined && { cover: data.cover }),
      ...(data.archived !== undefined && { archived: data.archived }),
    },
  });
  revalidatePath("/");
  revalidatePath(`/workspace/${pageId}`, "page");
  return page;
}

// 페이지 아카이브 (소프트 삭제)
export async function archivePage(pageId: string) {
  return updatePage(pageId, { archived: true });
}

// 페이지 복원
export async function restorePage(pageId: string) {
  return updatePage(pageId, { archived: false });
}

// 페이지 영구 삭제
export async function deletePage(pageId: string) {
  await prisma.page.delete({
    where: { id: pageId },
  });
  revalidatePath("/");
}

// 페이지 검색
export async function searchPages(query: string): Promise<PageListItem[]> {
  const pages = await prisma.page.findMany({
    where: {
      archived: false,
      OR: [
        { title: { contains: query } },
        {
          blocks: {
            some: {
              plainText: { contains: query },
            },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
      archived: true,
    },
  });
  return pages;
}
