const DIGITS = "०१२३४५६७८९";
export const ne = (n: number | string) => String(n).replace(/[0-9]/g, (d) => DIGITS[Number(d)]);

const MONTHS_NE = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};
export const dateNe = (iso: string) => {
  if (!iso) return "";
  const { y, m, d } = parts(iso);
  return `${ne(d)} ${MONTHS_NE[m - 1]} ${ne(y)}`;
};
export const dateEn = (iso: string) => {
  if (!iso) return "";
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_EN[m - 1]} ${y}`;
};

/** Build-time "today" in Nepal (UTC+5:45). */
export const todayNepal = () => new Date(Date.now() + (5 * 60 + 45) * 60000).toISOString().slice(0, 10);

export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
