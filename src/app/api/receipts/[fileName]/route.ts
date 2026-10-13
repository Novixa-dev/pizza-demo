import { isAuthorizedStaff } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const receiptTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  if (!(await isAuthorizedStaff(["ADMIN", "CASHIER"]))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { fileName } = await params;
  const match = /^receipt_[0-9a-f-]{36}\.(jpg|png|webp)$/.exec(fileName);
  if (!match) return new NextResponse("Not found", { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "storage", "receipts", fileName);
    const image = await fs.readFile(filePath);
    return new NextResponse(image, {
      headers: {
        "Content-Type": receiptTypes[match[1]],
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}