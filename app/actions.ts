"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getItemsByDate(dateString: string) {
  try {
    const items = await prisma.item.findMany({
      where: { dateString },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, items };
  } catch (error) {
    console.error("Error fetching items:", error);
    return { success: false, items: [], error: "Failed to fetch items" };
  }
}

export async function addItem(dateString: string, name: string = "", price: number = 0) {
  try {
    const item = await prisma.item.create({
      data: {
        name,
        price,
        dateString,
        checked: false,
      },
    });
    return { success: true, item };
  } catch (error) {
    console.error("Error adding item:", error);
    return { success: false, error: "Failed to add item" };
  }
}

export async function updateItem(
  id: string,
  data: { name?: string; price?: number; checked?: boolean }
) {
  try {
    const item = await prisma.item.update({
      where: { id },
      data,
    });
    return { success: true, item };
  } catch (error) {
    console.error("Error updating item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function clearItemsByDate(dateString: string) {
  try {
    await prisma.item.deleteMany({
      where: { dateString },
    });
    return { success: true };
  } catch (error) {
    console.error("Error clearing items:", error);
    return { success: false, error: "Failed to clear items" };
  }
}
