import { NextResponse } from "next/server";
import { getProperty, deleteProperty } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = getProperty(id);

    if (!property) {
      return NextResponse.json(
        { error: "指定された物件が見つかりません。" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property GET API error:", error);

    return NextResponse.json(
      { error: "物件の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = deleteProperty(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "指定された物件が見つかりません。" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "物件を削除しました。" });
  } catch (error) {
    console.error("Property DELETE API error:", error);

    return NextResponse.json(
      { error: "物件の削除中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
