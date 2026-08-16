require("dotenv").config();
const connectDB = require("../config/db");
const Building = require("../models/Building");
const Room = require("../models/Room");
const User = require("../models/User");

const buildingData = [
  {
    building_name: "อาคารเรียนรวม",
    location: "อาคารกลาง",
    rooms: [
      { room_name: "ห้อง 29101", room_type: "ห้องเรียน", capacity: 40 },
      { room_name: "ห้อง 29105", room_type: "ห้องเรียน", capacity: 40 },
      { room_name: "ห้อง 29109", room_type: "ห้องเรียน", capacity: 40 },
      { room_name: "ห้อง 29112-29113", room_type: "ห้องเรียน", capacity: 60 },
      { room_name: "ห้องประชุมอาคารรวมประสงค์", room_type: "ห้องประชุม", capacity: 30 },
      { room_name: "ห้องปฏิบัติการคอมพิวเตอร์ 29103", room_type: "ห้องปฏิบัติการคอมพิวเตอร์", capacity: 50 },
    ],
  },
  {
    building_name: "อาคารปฏิบัติการวิทยาศาสตร์",
    location: "อาคารวิทยาศาสตร์",
    rooms: [
      { room_name: "ห้องคอมพิวเตอร์สำหรับงานกราฟิกระดับสูง 45303", room_type: "ห้องปฏิบัติการคอมพิวเตอร์", capacity: 35 },
      { room_name: "Mobile Science", room_type: "ห้องปฏิบัติการเคลื่อนที่", capacity: 25 },
    ],
  },
];

async function seed() {
  await connectDB();

  for (const b of buildingData) {
    let building = await Building.findOne({ building_name: b.building_name });
    if (!building) {
      building = await Building.create({ building_name: b.building_name, location: b.location });
      console.log(`Created building: ${building.building_name}`);
    }

    for (const r of b.rooms) {
      const exists = await Room.findOne({ building_id: building._id, room_name: r.room_name });
      if (!exists) {
        await Room.create({ ...r, building_id: building._id, status: "available" });
        console.log(`  + Room: ${r.room_name}`);
      }
    }
  }

  const adminEmail = "admin@example.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      full_name: "System Admin",
      email: adminEmail,
      password: "Admin@1234",
      role: "admin",
    });
    console.log(`Created default admin: ${adminEmail} / Admin@1234 (please change after first login)`);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
