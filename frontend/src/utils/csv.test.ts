import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadCsv } from "./csv";

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsText(blob);
  });

const readBytes = (blob: Blob) =>
  new Promise<Uint8Array>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(new Uint8Array(r.result as ArrayBuffer));
    r.readAsArrayBuffer(blob);
  });

async function exported(header: string[], rows: unknown[][]) {
  let captured: Blob | undefined;
  URL.createObjectURL = vi.fn((b: Blob) => { captured = b; return "blob:x"; });
  URL.revokeObjectURL = vi.fn();
  downloadCsv("t.csv", header, rows);
  return readBlob(captured!);
}

afterEach(() => vi.restoreAllMocks());

describe("downloadCsv", () => {
  it("writes a header and quoted cells", async () => {
    const text = await exported(["A", "B"], [["hello, world", 'say "hi"']]);
    expect(text).toContain("A,B");
    expect(text).toContain('"hello, world","say ""hi"""');
  });

  it("neutralises spreadsheet formulas", async () => {
    const text = await exported(["Name"], [["=HYPERLINK(\"http://evil\")"], ["+1+1"], ["@cmd"]]);
    expect(text).toContain("'=HYPERLINK");
    expect(text).toContain("'+1+1");
    expect(text).toContain("'@cmd");
  });

  it("keeps negative numbers as numbers", async () => {
    expect(await exported(["N"], [[-5]])).toContain("\r\n-5");
  });

  it("starts with a UTF-8 BOM so Excel reads Arabic correctly", async () => {
    let captured: Blob | undefined;
    URL.createObjectURL = vi.fn((b: Blob) => { captured = b; return "blob:x"; });
    URL.revokeObjectURL = vi.fn();
    downloadCsv("t.csv", ["N"], [["مرحبا"]]);
    const bytes = await readBytes(captured!);
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });
});
