"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== Database CRUD ====================

// 데이터베이스 생성
export async function createDatabase(title?: string, icon?: string) {
  const database = await prisma.database.create({
    data: {
      title: title || "Untitled",
      icon: icon || "📊",
      // 기본 "이름" 컬럼 추가
      properties: {
        create: {
          name: "이름",
          type: "text",
          order: 0,
          width: 200,
        },
      },
      // 기본 뷰 생성
      views: {
        create: {
          name: "기본 뷰",
          type: "table",
          order: 0,
        },
      },
    },
    include: {
      properties: true,
      views: true,
    },
  });

  revalidatePath("/");
  return database;
}

// 데이터베이스 조회 (전체 데이터 포함)
export async function getDatabase(id: string) {
  const database = await prisma.database.findUnique({
    where: { id },
    include: {
      properties: {
        orderBy: { order: "asc" },
      },
      rows: {
        orderBy: { order: "asc" },
        include: {
          cells: true,
        },
      },
      views: {
        orderBy: { order: "asc" },
      },
    },
  });

  return database;
}

// 데이터베이스 목록 조회
export async function getDatabases() {
  const databases = await prisma.database.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
    },
  });

  return databases;
}

// 데이터베이스 수정
export async function updateDatabase(
  id: string,
  data: { title?: string; icon?: string }
) {
  const database = await prisma.database.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.icon !== undefined && { icon: data.icon }),
    },
  });

  revalidatePath("/");
  return database;
}

// 데이터베이스 삭제
export async function deleteDatabase(id: string) {
  await prisma.database.delete({
    where: { id },
  });

  revalidatePath("/");
}

// ==================== Property (컬럼) CRUD ====================

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
}

// 컬럼 추가
export async function addProperty(
  databaseId: string,
  name: string,
  type: string,
  options?: PropertyOption[]
) {
  // 마지막 order 가져오기
  const lastProperty = await prisma.property.findFirst({
    where: { databaseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastProperty ? lastProperty.order + 1 : 0;

  const property = await prisma.property.create({
    data: {
      databaseId,
      name,
      type,
      options: options ? JSON.stringify({ options }) : "{}",
      order: newOrder,
    },
  });

  // 기존 모든 행에 빈 셀 추가
  const rows = await prisma.row.findMany({
    where: { databaseId },
  });

  if (rows.length > 0) {
    await prisma.cell.createMany({
      data: rows.map((row) => ({
        rowId: row.id,
        propertyId: property.id,
        value: "",
      })),
    });
  }

  revalidatePath("/");
  return property;
}

// 컬럼 수정
export async function updateProperty(
  id: string,
  data: {
    name?: string;
    type?: string;
    options?: PropertyOption[];
    width?: number;
  }
) {
  const property = await prisma.property.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.options !== undefined && {
        options: JSON.stringify({ options: data.options }),
      }),
      ...(data.width !== undefined && { width: data.width }),
    },
  });

  revalidatePath("/");
  return property;
}

// 컬럼 삭제
export async function deleteProperty(id: string) {
  await prisma.property.delete({
    where: { id },
  });

  revalidatePath("/");
}

// 컬럼 순서 재정렬
export async function reorderProperties(
  databaseId: string,
  propertyIds: string[]
) {
  await prisma.$transaction(
    propertyIds.map((id, index) =>
      prisma.property.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/");
}

// ==================== Row (행) CRUD ====================

// 행 추가
export async function addRow(
  databaseId: string,
  cells?: { propertyId: string; value: string }[]
) {
  // 마지막 order 가져오기
  const lastRow = await prisma.row.findFirst({
    where: { databaseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastRow ? lastRow.order + 1 : 0;

  // 모든 property 가져오기
  const properties = await prisma.property.findMany({
    where: { databaseId },
  });

  const row = await prisma.row.create({
    data: {
      databaseId,
      order: newOrder,
      cells: {
        create: properties.map((prop) => {
          const cellData = cells?.find((c) => c.propertyId === prop.id);
          return {
            propertyId: prop.id,
            value: cellData?.value || "",
          };
        }),
      },
    },
    include: {
      cells: true,
    },
  });

  revalidatePath("/");
  return row;
}

// 행 삭제
export async function deleteRow(id: string) {
  await prisma.row.delete({
    where: { id },
  });

  revalidatePath("/");
}

// 행 복제
export async function duplicateRow(id: string) {
  const existingRow = await prisma.row.findUnique({
    where: { id },
    include: { cells: true },
  });

  if (!existingRow) {
    throw new Error("Row not found");
  }

  // 마지막 order 가져오기
  const lastRow = await prisma.row.findFirst({
    where: { databaseId: existingRow.databaseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastRow ? lastRow.order + 1 : 0;

  const newRow = await prisma.row.create({
    data: {
      databaseId: existingRow.databaseId,
      order: newOrder,
      cells: {
        create: existingRow.cells.map((cell) => ({
          propertyId: cell.propertyId,
          value: cell.value,
        })),
      },
    },
    include: { cells: true },
  });

  revalidatePath("/");
  return newRow;
}

// 행 순서 재정렬
export async function reorderRows(databaseId: string, rowIds: string[]) {
  await prisma.$transaction(
    rowIds.map((id, index) =>
      prisma.row.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/");
}

// ==================== Cell (셀) CRUD ====================

// 셀 값 업데이트
export async function updateCell(
  rowId: string,
  propertyId: string,
  value: string
) {
  const cell = await prisma.cell.upsert({
    where: {
      rowId_propertyId: {
        rowId,
        propertyId,
      },
    },
    update: { value },
    create: {
      rowId,
      propertyId,
      value,
    },
  });

  revalidatePath("/");
  return cell;
}

// ==================== View (뷰) CRUD ====================

export interface ViewConfig {
  filters?: Array<{
    propertyId: string;
    operator: string;
    value: string;
  }>;
  sorts?: Array<{
    propertyId: string;
    direction: "asc" | "desc";
  }>;
  hiddenColumns?: string[];
  groupBy?: string;
}

// 뷰 생성
export async function createView(
  databaseId: string,
  name: string,
  type: string = "table"
) {
  const lastView = await prisma.view.findFirst({
    where: { databaseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastView ? lastView.order + 1 : 0;

  const view = await prisma.view.create({
    data: {
      databaseId,
      name,
      type,
      order: newOrder,
    },
  });

  revalidatePath("/");
  return view;
}

// 뷰 업데이트
export async function updateView(
  id: string,
  data: { name?: string; type?: string; config?: ViewConfig }
) {
  const view = await prisma.view.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.config !== undefined && {
        config: JSON.stringify(data.config),
      }),
    },
  });

  revalidatePath("/");
  return view;
}

// 뷰 삭제
export async function deleteView(id: string) {
  await prisma.view.delete({
    where: { id },
  });

  revalidatePath("/");
}
