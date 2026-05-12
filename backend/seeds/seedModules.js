const mongoose = require('mongoose');
const Module = require('../models/Module.js');

const seedModules = async (teacherId) => {
  if (!teacherId) throw new Error("teacherId is required to seed modules");

  // Ensure teacherId is an ObjectId
  const objTeacherId = new mongoose.Types.ObjectId(teacherId);

  const modules = [
    { name: "Mathematics", description: "Algebra & Calculus", questionCount: 25, color: "#ff0000", teacherId: objTeacherId },
    { name: "Physics", description: "Mechanics & Thermodynamics", questionCount: 18, color: "#0000ff", teacherId: objTeacherId },
    { name: "Chemistry", description: "Organic & Inorganic basics", questionCount: 20, color: "#00ff00", teacherId: objTeacherId }
  ];

  // Remove previous modules for this teacher
  await Module.deleteMany({ teacherId: objTeacherId });

  const insertedModules = await Module.insertMany(modules);
  console.log("Modules seeded:", insertedModules.map(m => ({ name: m.name, teacherId: m.teacherId })));
  return insertedModules;
};

module.exports = { seedModules };
