require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Role = require('../src/models/Role');
const Application = require('../src/models/Application');
const Notification = require('../src/models/Notification');

(async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Role.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin Organizer',
      email: 'admin@evp.com',
      password: 'admin123',
      role: 'admin',
    });

    const students = await User.create([
      { name: 'Nithin Reddy', email: 'nithin@evp.com', password: 'student123', role: 'student' },
      { name: 'Priya Sharma', email: 'priya@evp.com', password: 'student123', role: 'student' },
      { name: 'Arjun Mehta', email: 'arjun@evp.com', password: 'student123', role: 'student' },
      { name: 'Sana Iyer', email: 'sana@evp.com', password: 'student123', role: 'student' },
    ]);

    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 24 * 3600 * 1000);

    const events = await Event.create([
      {
        title: 'TechFest 2026 — AI & Robotics Expo',
        description:
          'A flagship 3-day student-led technology festival featuring workshops, live demos, a hackathon finale, and a startup pitch night. Volunteers are the backbone of this event.',
        date: future(14),
        location: 'Main Auditorium, Campus Block A',
        bannerColor: '#7c5cff',
        createdBy: admin._id,
      },
      {
        title: 'GreenEarth Tree Plantation Drive',
        description:
          'Help us plant 2,000 saplings across the city. Includes logistics, crowd guidance, and media coverage volunteers.',
        date: future(7),
        location: 'Lakeside Park',
        bannerColor: '#22c55e',
        createdBy: admin._id,
      },
      {
        title: 'Cultural Night — Rangmanch',
        description:
          'An evening of dance, drama, and music. We need hospitality, stage, and backstage volunteers.',
        date: future(21),
        location: 'Open Air Theatre',
        bannerColor: '#f59e0b',
        createdBy: admin._id,
      },
      {
        title: 'Blood Donation Camp',
        description:
          'In partnership with the Red Cross. Volunteer to guide donors, assist medical staff, and manage the refreshment counter.',
        date: future(4),
        location: 'Health Centre',
        bannerColor: '#ef4444',
        createdBy: admin._id,
      },
    ]);

    const rolesData = [
      // TechFest
      { eventIdx: 0, roleName: 'Registration Desk', maxSlots: 6, description: 'Welcome attendees and issue badges.' },
      { eventIdx: 0, roleName: 'Hackathon Support', maxSlots: 4, description: 'Assist hackathon teams with logistics.' },
      { eventIdx: 0, roleName: 'Media & Social', maxSlots: 3, description: 'Capture moments, post live updates.' },
      // Green Earth
      { eventIdx: 1, roleName: 'Plantation Lead', maxSlots: 5, description: 'Guide teams at plantation zones.' },
      { eventIdx: 1, roleName: 'Logistics', maxSlots: 4, description: 'Handle saplings, tools, transport.' },
      // Cultural Night
      { eventIdx: 2, roleName: 'Stage Crew', maxSlots: 4, description: 'Handle set changes and props.' },
      { eventIdx: 2, roleName: 'Hospitality', maxSlots: 3, description: 'Take care of artists & guests.' },
      { eventIdx: 2, roleName: 'Ushers', maxSlots: 6, description: 'Seat audience, manage aisles.' },
      // Blood Donation
      { eventIdx: 3, roleName: 'Donor Guide', maxSlots: 5, description: 'Walk donors through the process.' },
      { eventIdx: 3, roleName: 'Refreshments', maxSlots: 3, description: 'Serve post-donation refreshments.' },
    ];

    const roles = [];
    for (const r of rolesData) {
      const created = await Role.create({
        eventId: events[r.eventIdx]._id,
        roleName: r.roleName,
        description: r.description,
        maxSlots: r.maxSlots,
      });
      roles.push(created);
    }

    // Sample applications
    await Application.create({
      userId: students[0]._id,
      eventId: roles[0].eventId,
      roleId: roles[0]._id,
      status: 'confirmed',
      qrToken: 'seed-' + students[0]._id.toString().slice(-6),
    });
    await Role.findByIdAndUpdate(roles[0]._id, { $inc: { filledSlots: 1 } });

    await Application.create({
      userId: students[1]._id,
      eventId: roles[3].eventId,
      roleId: roles[3]._id,
      status: 'confirmed',
      qrToken: 'seed-' + students[1]._id.toString().slice(-6),
    });
    await Role.findByIdAndUpdate(roles[3]._id, { $inc: { filledSlots: 1 } });

    await Application.create({
      userId: students[2]._id,
      eventId: roles[5].eventId,
      roleId: roles[5]._id,
      status: 'confirmed',
      qrToken: 'seed-' + students[2]._id.toString().slice(-6),
    });
    await Role.findByIdAndUpdate(roles[5]._id, { $inc: { filledSlots: 1 } });

    console.log('\n✅ Seed complete!\n');
    console.log('🔑 Admin login:  admin@evp.com  /  admin123');
    console.log('🔑 Student login: nithin@evp.com / student123');
    console.log('   (Other students: priya@, arjun@, sana@ — all password student123)\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
})();
