import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const defaultPassword = "Agragati@2025";
const schoolId = "11111111-1111-1111-1111-111111111111";
const ayId = "22222222-2222-2222-2222-222222222222";
const termId = "33333333-3333-3333-3333-333333333333";
const classId = "44444444-4444-4444-4444-444444444444";
const sectionId = "55555555-5555-5555-5555-555555555555";
const subjectId = "66666666-6666-6666-6666-666666666666";

const usersToSeed = [
  {
    role: "SUPER_ADMIN",
    email: "superadmin@agragati.edu",
    fullName: "Eleanor Vance",
    title: "Platform Lead & Super Admin",
    schoolId: null,
  },
  {
    role: "OWNER",
    email: "owner@kingscollege.edu",
    fullName: "Julian Vance-Moreau, D.Phil",
    title: "Chancellor & CFO",
    schoolId: schoolId,
  },
  {
    role: "PRINCIPAL",
    email: "principal@kingscollege.edu",
    fullName: "Mme. Claire De La Tour",
    title: "Head of School / Principal",
    schoolId: schoolId,
  },
  {
    role: "SCHOOL_ADMIN",
    email: "admin@kingscollege.edu",
    fullName: "Henrietta Sterling",
    title: "School Operations Administrator",
    schoolId: schoolId,
  },
  {
    role: "TEACHER",
    email: "teacher@kingscollege.edu",
    fullName: "Dr. Alistair Finch",
    title: "Senior Faculty • Physics",
    schoolId: schoolId,
  },
  {
    role: "ACCOUNTANT",
    email: "finance@kingscollege.edu",
    fullName: "Arthur M. Vance",
    title: "Chief Bursar & Comptroller",
    schoolId: schoolId,
  },
  {
    role: "PARENT",
    email: "parent@kingscollege.edu",
    fullName: "Marcus Laurent",
    title: "Guardian • Senior Form",
    schoolId: schoolId,
  },
  {
    role: "STUDENT",
    email: "student@kingscollege.edu",
    fullName: "Genevieve Laurent",
    title: "Scholar • Grade 11-IB",
    schoolId: schoolId,
  },
];

async function seedDatabase() {
  console.log("==================================================");
  console.log("🏛️  AGRAGATI DIRECT SUPABASE SEED DISPATCHER");
  console.log("==================================================\n");

  // 1. Seed School
  console.log("1. Upserting School Tenant...");
  const { data: schoolData, error: schoolErr } = await supabase
    .from("schools")
    .upsert({
      id: schoolId,
      legal_name: "The King's College & Academy",
      slug: "kingscollege",
      domain: "kingscollege.agragati.edu",
      institution_type: "K-12 Independent Boarding & Day School",
      curriculum_framework: "IB & Cambridge IGCSE",
      jurisdiction: "Geneva, Switzerland",
      base_currency: "CHF",
      capacity_target: 2500,
      status: "ACTIVE",
    })
    .select();

  if (schoolErr) {
    console.error("❌ School upsert error:", schoolErr.message);
  } else {
    console.log("✅ School tenant seeded successfully!");
  }

  // 2. Seed Academic Year & Term
  console.log("\n2. Upserting Academic Year & Term...");
  await supabase.from("academic_years").upsert({
    id: ayId,
    school_id: schoolId,
    name: "Academic Year 2024–2025",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    is_current: true,
  });

  await supabase.from("academic_terms").upsert({
    id: termId,
    academic_year_id: ayId,
    name: "Term 3 Cycle (Trinity / Michaelmas)",
    term_code: "TERM-3-2025",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    is_current: true,
  });
  console.log("✅ Academic Year & Term seeded!");

  // 3. Seed Class & Subject
  console.log("\n3. Upserting Class & Subject...");
  await supabase.from("classes").upsert({
    id: classId,
    school_id: schoolId,
    academic_year_id: ayId,
    name: "Grade 11",
    grade_level: 11,
    curriculum_code: "IB_DIPLOMA",
  });

  await supabase.from("subjects").upsert({
    id: subjectId,
    school_id: schoolId,
    name: "Higher Level Physics",
    code: "PHY-HL-301",
    department: "Natural Sciences",
    credits: 1.0,
  });

  // 4. Create Users in Auth & Profiles
  console.log("\n4. Provisioning Auth Users & Linked Profiles...");
  const createdProfiles = {};

  for (const u of usersToSeed) {
    let authUserId = null;

    // Check if user exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((x) => x.email === u.email);

    if (existing) {
      authUserId = existing.id;
      // Update password
      await supabase.auth.admin.updateUserById(authUserId, {
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { full_name: u.fullName, role: u.role },
      });
      console.log(`   🔄 Updated existing auth user: ${u.email}`);
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { full_name: u.fullName, role: u.role },
      });

      if (createErr) {
        console.error(`   ❌ Failed to create auth user ${u.email}:`, createErr.message);
        continue;
      }
      authUserId = newUser.user.id;
      console.log(`   ✨ Created auth user: ${u.email} (ID: ${authUserId})`);
    }

    // Upsert into users_profiles
    const { data: prof, error: profErr } = await supabase
      .from("users_profiles")
      .upsert({
        auth_user_id: authUserId,
        school_id: u.schoolId,
        role: u.role,
        full_name: u.fullName,
        email: u.email,
        title: u.title,
        status: "ACTIVE",
      }, { onConflict: "auth_user_id" })
      .select();

    if (profErr) {
      console.error(`   ❌ Profile upsert error for ${u.email}:`, profErr.message);
    } else {
      createdProfiles[u.role] = prof?.[0] || { id: authUserId, auth_user_id: authUserId };
      console.log(`   👤 Profile linked for ${u.role}: ${u.fullName}`);
    }
  }

  // 5. Seed Teachers, Sections & Roster
  console.log("\n5. Linking Faculty & Student Roster...");
  const teacherProfile = createdProfiles["TEACHER"];
  const studentProfile = createdProfiles["STUDENT"];
  const parentProfile = createdProfiles["PARENT"];

  if (teacherProfile) {
    const teacherId = "c0000000-0000-0000-0000-000000000005";
    await supabase.from("teachers").upsert({
      id: teacherId,
      school_id: schoolId,
      profile_id: teacherProfile.id,
      employee_id: "EMP-PHYS-042",
      department: "Natural Sciences & Physics",
      qualification: "Ph.D. Theoretical Physics (ETH Zürich)",
      title: "Senior Lecturer",
    });

    await supabase.from("sections").upsert({
      id: sectionId,
      class_id: classId,
      name: "Grade 11-A — Classical & Sciences",
      room_number: "Newton Hall Lab 304",
      max_capacity: 28,
      form_tutor_id: teacherId,
    });

    await supabase.from("teacher_assignments").upsert({
      school_id: schoolId,
      teacher_id: teacherId,
      section_id: sectionId,
      subject_id: subjectId,
      academic_year_id: ayId,
    });
    console.log("   🎓 Teacher (Dr. Finch) assigned to Section 11-A");
  }

  if (studentProfile && parentProfile) {
    const studentId = "c0000000-0000-0000-0000-000000000008";
    const guardianId = "c0000000-0000-0000-0000-000000000007";

    await supabase.from("students").upsert({
      id: studentId,
      school_id: schoolId,
      profile_id: studentProfile.id,
      admission_number: "KC-2025-0842",
      house: "House Valois",
      date_of_birth: "2008-04-16",
      gender: "Female",
      status: "ACTIVE",
    });

    await supabase.from("guardians").upsert({
      id: guardianId,
      school_id: schoolId,
      profile_id: parentProfile.id,
      relationship_type: "Father",
      occupation: "Managing Director, Pictet Asset Management",
      emergency_contact: "+41 22 705 2211",
      address: "Chemin de la Colline 14, 1223 Cologny, Geneva",
    });

    await supabase.from("student_guardians").upsert({
      student_id: studentId,
      guardian_id: guardianId,
      is_primary_guarantor: true,
      authorization_level: "FULL_CUSTODIAL",
    });

    await supabase.from("enrollments").upsert({
      school_id: schoolId,
      student_id: studentId,
      section_id: sectionId,
      academic_year_id: ayId,
      roll_number: 14,
      status: "ACTIVE",
    });
    console.log("   🎒 Student (Genevieve) enrolled and linked to Guardian (Marcus)");
  }

  console.log("\n==================================================");
  console.log("🎉 ALL DUMMY USERS & ROLES PUSHED TO SUPABASE!");
  console.log("==================================================");
}

seedDatabase();
