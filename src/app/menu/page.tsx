import React from "react";
import { prisma } from "@/lib/prisma";
import MenuClientView from "./MenuClientView";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            optionGroups: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch (err) {
    console.error("Failed to load categories for MenuPage:", err);
  }

  return <MenuClientView categories={categories} />;
}
