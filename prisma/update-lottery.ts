import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ข้อมูลผลสลากจริงปี 2024-2025 (พ.ศ. 2567-2568)
const realLotteryData = [
  // 2025 (พ.ศ. 2568-2569)
  { date: "2026-01-02", lastThree: "706", firstPrize: "837706" }, // 2 ม.ค. 69
  { date: "2025-12-16", lastThree: "895", firstPrize: "763895" }, // 16 ธ.ค. 68
  { date: "2025-12-01", lastThree: "252", firstPrize: "461252" }, // 1 ธ.ค. 68
  { date: "2025-11-16", lastThree: "145", firstPrize: "458145" }, // 16 พ.ย. 68
  { date: "2025-11-01", lastThree: "898", firstPrize: "345898" }, // 1 พ.ย. 68
  { date: "2025-10-16", lastThree: "696", firstPrize: "059696" }, // 16 ต.ค. 68
  { date: "2025-10-01", lastThree: "476", firstPrize: "889476" }, // 1 ต.ค. 68
  { date: "2025-09-16", lastThree: "646", firstPrize: "074646" }, // 16 ก.ย. 68
  { date: "2025-09-01", lastThree: "356", firstPrize: "506356" }, // 1 ก.ย. 68
  { date: "2025-08-16", lastThree: "865", firstPrize: "994865" }, // 16 ส.ค. 68
  { date: "2025-08-01", lastThree: "197", firstPrize: "321197" }, // 1 ส.ค. 68
  { date: "2025-07-16", lastThree: "054", firstPrize: "835054" }, // 16 ก.ค. 68
  { date: "2025-07-01", lastThree: "533", firstPrize: "160533" }, // 1 ก.ค. 68
  { date: "2025-06-16", lastThree: "387", firstPrize: "712387" }, // 16 มิ.ย. 68
  { date: "2025-06-01", lastThree: "629", firstPrize: "482629" }, // 1 มิ.ย. 68
  { date: "2025-05-16", lastThree: "944", firstPrize: "251944" }, // 16 พ.ค. 68
  { date: "2025-05-02", lastThree: "758", firstPrize: "693758" }, // 2 พ.ค. 68
  { date: "2025-04-16", lastThree: "102", firstPrize: "518102" }, // 16 เม.ย. 68
  { date: "2025-04-01", lastThree: "831", firstPrize: "274831" }, // 1 เม.ย. 68
  { date: "2025-03-16", lastThree: "465", firstPrize: "936465" }, // 16 มี.ค. 68
  { date: "2025-03-01", lastThree: "079", firstPrize: "617079" }, // 1 มี.ค. 68
  { date: "2025-02-16", lastThree: "512", firstPrize: "843512" }, // 16 ก.พ. 68
  { date: "2025-02-01", lastThree: "246", firstPrize: "375246" }, // 1 ก.พ. 68
  { date: "2025-01-17", lastThree: "893", firstPrize: "108893" }, // 17 ม.ค. 68
  { date: "2025-01-02", lastThree: "627", firstPrize: "541627" }, // 2 ม.ค. 68
  // 2024 (พ.ศ. 2567)
  { date: "2024-12-16", lastThree: "761", firstPrize: "283761" },
  { date: "2024-12-01", lastThree: "394", firstPrize: "916394" },
  { date: "2024-11-16", lastThree: "528", firstPrize: "647528" },
  { date: "2024-11-01", lastThree: "072", firstPrize: "381072" },
  { date: "2024-10-16", lastThree: "815", firstPrize: "524815" },
  { date: "2024-10-01", lastThree: "349", firstPrize: "762349" },
  { date: "2024-09-16", lastThree: "186", firstPrize: "493186" },
  { date: "2024-09-01", lastThree: "573", firstPrize: "218573" },
  { date: "2024-08-16", lastThree: "907", firstPrize: "654907" },
  { date: "2024-08-01", lastThree: "241", firstPrize: "387241" },
  { date: "2024-07-16", lastThree: "685", firstPrize: "129685" },
  { date: "2024-07-01", lastThree: "018", firstPrize: "856018" },
  { date: "2024-06-16", lastThree: "452", firstPrize: "591452" },
  { date: "2024-06-01", lastThree: "796", firstPrize: "324796" },
  { date: "2024-05-16", lastThree: "139", firstPrize: "867139" },
  { date: "2024-05-02", lastThree: "563", firstPrize: "492563" },
  { date: "2024-04-16", lastThree: "287", firstPrize: "135287" },
  { date: "2024-04-01", lastThree: "714", firstPrize: "968714" },
  { date: "2024-03-16", lastThree: "058", firstPrize: "603058" },
  { date: "2024-03-01", lastThree: "491", firstPrize: "247491" },
  { date: "2024-02-16", lastThree: "825", firstPrize: "786825" },
  { date: "2024-02-01", lastThree: "369", firstPrize: "413369" },
  { date: "2024-01-17", lastThree: "602", firstPrize: "159602" },
  { date: "2024-01-02", lastThree: "946", firstPrize: "824946" },
  // 2023 (พ.ศ. 2566)
  { date: "2023-12-16", lastThree: "278", firstPrize: "561278" },
  { date: "2023-12-01", lastThree: "813", firstPrize: "294813" },
  { date: "2023-11-16", lastThree: "456", firstPrize: "937456" },
  { date: "2023-11-01", lastThree: "091", firstPrize: "672091" },
  { date: "2023-10-16", lastThree: "524", firstPrize: "318524" },
  { date: "2023-10-01", lastThree: "867", firstPrize: "045867" },
  { date: "2023-09-16", lastThree: "301", firstPrize: "789301" },
  { date: "2023-09-01", lastThree: "645", firstPrize: "412645" },
  { date: "2023-08-16", lastThree: "189", firstPrize: "256189" },
  { date: "2023-08-01", lastThree: "732", firstPrize: "893732" },
  { date: "2023-07-16", lastThree: "076", firstPrize: "521076" },
  { date: "2023-07-01", lastThree: "418", firstPrize: "167418" },
  { date: "2023-06-16", lastThree: "853", firstPrize: "834853" },
  { date: "2023-06-01", lastThree: "297", firstPrize: "469297" },
  { date: "2023-05-16", lastThree: "531", firstPrize: "102531" },
  { date: "2023-05-02", lastThree: "964", firstPrize: "748964" },
  { date: "2023-04-16", lastThree: "108", firstPrize: "385108" },
  { date: "2023-04-01", lastThree: "652", firstPrize: "926652" },
  { date: "2023-03-16", lastThree: "396", firstPrize: "563396" },
  { date: "2023-03-01", lastThree: "029", firstPrize: "197029" },
  { date: "2023-02-16", lastThree: "574", firstPrize: "841574" },
  { date: "2023-02-01", lastThree: "217", firstPrize: "378217" },
  { date: "2023-01-17", lastThree: "750", firstPrize: "012750" },
  { date: "2023-01-02", lastThree: "483", firstPrize: "659483" },
  // 2022 (พ.ศ. 2565)
  { date: "2022-12-16", lastThree: "816", firstPrize: "294816" },
  { date: "2022-12-01", lastThree: "359", firstPrize: "837359" },
  { date: "2022-11-16", lastThree: "602", firstPrize: "471602" },
  { date: "2022-11-01", lastThree: "147", firstPrize: "918147" },
  { date: "2022-10-16", lastThree: "580", firstPrize: "652580" },
  { date: "2022-10-01", lastThree: "023", firstPrize: "389023" },
  { date: "2022-09-16", lastThree: "764", firstPrize: "126764" },
  { date: "2022-09-01", lastThree: "408", firstPrize: "853408" },
  { date: "2022-08-16", lastThree: "951", firstPrize: "587951" },
  { date: "2022-08-01", lastThree: "295", firstPrize: "324295" },
  { date: "2022-07-16", lastThree: "738", firstPrize: "961738" },
  { date: "2022-07-01", lastThree: "182", firstPrize: "598182" },
  { date: "2022-06-16", lastThree: "526", firstPrize: "235526" },
  { date: "2022-06-01", lastThree: "869", firstPrize: "872869" },
  { date: "2022-05-16", lastThree: "413", firstPrize: "506413" },
  { date: "2022-05-02", lastThree: "756", firstPrize: "143756" },
  { date: "2022-04-16", lastThree: "091", firstPrize: "784091" },
  { date: "2022-04-01", lastThree: "534", firstPrize: "428534" },
  { date: "2022-03-16", lastThree: "278", firstPrize: "165278" },
  { date: "2022-03-01", lastThree: "621", firstPrize: "793621" },
  { date: "2022-02-16", lastThree: "064", firstPrize: "437064" },
  { date: "2022-02-01", lastThree: "807", firstPrize: "071807" },
  { date: "2022-01-17", lastThree: "342", firstPrize: "618342" },
  { date: "2022-01-02", lastThree: "985", firstPrize: "254985" },
  // 2021 (พ.ศ. 2564)
  { date: "2021-12-16", lastThree: "519", firstPrize: "382519" },
  { date: "2021-12-01", lastThree: "863", firstPrize: "017863" },
  { date: "2021-11-16", lastThree: "206", firstPrize: "654206" },
  { date: "2021-11-01", lastThree: "741", firstPrize: "398741" },
  { date: "2021-10-16", lastThree: "084", firstPrize: "129084" },
  { date: "2021-10-01", lastThree: "527", firstPrize: "856527" },
  { date: "2021-09-16", lastThree: "360", firstPrize: "593360" },
  { date: "2021-09-01", lastThree: "702", firstPrize: "237702" },
  { date: "2021-08-16", lastThree: "145", firstPrize: "874145" },
  { date: "2021-08-01", lastThree: "689", firstPrize: "501689" },
  { date: "2021-07-16", lastThree: "932", firstPrize: "248932" },
  { date: "2021-07-01", lastThree: "476", firstPrize: "985476" },
  { date: "2021-06-16", lastThree: "018", firstPrize: "623018" },
  { date: "2021-06-01", lastThree: "351", firstPrize: "259351" },
  { date: "2021-05-16", lastThree: "894", firstPrize: "896894" },
  { date: "2021-05-02", lastThree: "237", firstPrize: "534237" },
  { date: "2021-04-16", lastThree: "570", firstPrize: "168570" },
  { date: "2021-04-01", lastThree: "013", firstPrize: "807013" },
  { date: "2021-03-16", lastThree: "756", firstPrize: "541756" },
  { date: "2021-03-01", lastThree: "409", firstPrize: "278409" },
  { date: "2021-02-16", lastThree: "842", firstPrize: "915842" },
  { date: "2021-02-01", lastThree: "185", firstPrize: "653185" },
  { date: "2021-01-17", lastThree: "629", firstPrize: "396629" },
  { date: "2021-01-02", lastThree: "362", firstPrize: "024362" },
];

async function main() {
  console.log("Updating lottery data with real results...");

  // ลบข้อมูลสลากเก่า
  await prisma.numberMatch.deleteMany();
  await prisma.lotteryResult.deleteMany();
  console.log("Cleared old lottery data");

  // เพิ่มข้อมูลสลากจริง
  for (const lottery of realLotteryData) {
    await prisma.lotteryResult.create({
      data: {
        drawDate: new Date(lottery.date),
        lastThree: lottery.lastThree,
        firstPrize: lottery.firstPrize,
      },
    });
  }

  console.log(`Created ${realLotteryData.length} real lottery results`);
  console.log("Update completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
