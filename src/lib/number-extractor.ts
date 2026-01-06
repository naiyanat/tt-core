export interface ExtractedNumberResult {
  number: string;
  method: "direct";
  reasoning: string;
  confidence: number;
}

// ดึงตัวเลขจากข้อความโดยตรง
export function extractDirectNumbers(text: string): ExtractedNumberResult[] {
  const results: ExtractedNumberResult[] = [];
  const seenNumbers = new Set<string>();

  // Pattern สำหรับเลขทะเบียนรถ (เช่น กข 1234, 1กข 234)
  const licensePlatePattern = /[ก-ฮ]{1,2}\s*(\d{1,4})/g;
  let match;
  while ((match = licensePlatePattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `เลขทะเบียนรถ: ${match[0]}`,
        confidence: 85,
      });
    }
  }

  // Pattern สำหรับเลขที่บ้าน
  const housePattern = /(?:บ้านเลขที่|เลขที่)\s*(\d{1,4})/g;
  while ((match = housePattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `เลขที่บ้าน: ${match[1]}`,
        confidence: 80,
      });
    }
  }

  // Pattern สำหรับวันที่ (dd/mm หรือ dd เดือน)
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const datePattern = new RegExp(
    `(\\d{1,2})\\s*(${thaiMonths.join("|")})`,
    "g"
  );
  while ((match = datePattern.exec(text)) !== null) {
    const day = match[1];
    const monthIndex = thaiMonths.indexOf(match[2]) + 1;
    const num = `${day.padStart(2, "0")}${monthIndex}`.slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `วันที่: ${match[0]} (${day}/${monthIndex})`,
        confidence: 75,
      });
    }
  }

  // Pattern สำหรับอายุ
  const agePattern = /อายุ\s*(\d{1,3})\s*ปี/g;
  while ((match = agePattern.exec(text)) !== null) {
    const num = match[1].padStart(3, "0").slice(-3);
    if (!seenNumbers.has(num) && parseInt(match[1]) < 150) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `อายุ: ${match[1]} ปี`,
        confidence: 70,
      });
    }
  }

  // Pattern สำหรับจำนวนผู้เสียชีวิต/บาดเจ็บ
  const casualtyPattern = /(เสียชีวิต|ดับ|ตาย|บาดเจ็บ)\s*(\d{1,3})\s*(คน|ราย|ศพ)/g;
  while ((match = casualtyPattern.exec(text)) !== null) {
    const num = match[2].padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `${match[1]} ${match[2]} ${match[3]}`,
        confidence: 80,
      });
    }
  }

  // Pattern สำหรับหมายเลขเที่ยวบิน
  const flightPattern = /(?:เที่ยวบิน|flight)\s*(?:[A-Z]{2})?\s*(\d{3,4})/gi;
  while ((match = flightPattern.exec(text)) !== null) {
    const num = match[1].slice(-3).padStart(3, "0");
    if (!seenNumbers.has(num)) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `หมายเลขเที่ยวบิน: ${match[0]}`,
        confidence: 85,
      });
    }
  }

  // Pattern สำหรับเลขทั่วไป 3 หลัก
  const generalPattern = /(?<!\d)(\d{3})(?!\d)/g;
  while ((match = generalPattern.exec(text)) !== null) {
    const num = match[1];
    if (
      !seenNumbers.has(num) &&
      results.length < 10 &&
      !["000", "111", "222", "333", "444", "555", "666", "777", "888", "999"].includes(num)
    ) {
      seenNumbers.add(num);
      results.push({
        number: num,
        method: "direct",
        reasoning: `เลข 3 หลักที่พบในข่าว`,
        confidence: 50,
      });
    }
  }

  return results.slice(0, 10); // จำกัดสูงสุด 10 เลขต่อข่าว
}
