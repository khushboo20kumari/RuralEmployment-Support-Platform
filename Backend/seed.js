const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');
const Employer = require('./models/Employer');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Payment = require('./models/Payment');
const { translateDescription } = require('./utils/translator');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear old demo data so seed can run repeatedly
    await Payment.deleteMany({});
    await Application.deleteMany({});
    await Job.deleteMany({});
    await Worker.deleteMany({});
    await Employer.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@ruralemp.com',
      phone: '9999999999',
      password: 'admin123',
      userType: 'admin',
      address: {
        village: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      },
      isVerified: true,
    });

    console.log('✅ Admin created: admin@ruralemp.com / admin123');

    // Create sample workers
    const workerUser = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@worker.com',
      phone: '9876543210',
      password: 'password123',
      userType: 'worker',
      address: {
        village: 'Rampur',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      },
      isVerified: true,
    });

    const worker1 = await Worker.create({
      userId: workerUser._id,
      skills: ['construction_labour', 'farm_worker'],
      experience: 5,
      experienceDetails: '5 years of construction and farming work',
      dailyRate: 500,
      monthlyRate: 12000,
      availability: 'full_time',
    });

    const workerUser2 = await User.create({
      name: 'Sita Devi',
      email: 'sita@worker.com',
      phone: '9876543220',
      password: 'password123',
      userType: 'worker',
      address: {
        village: 'Hadapsar',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411028',
      },
      isVerified: true,
    });

    const worker2 = await Worker.create({
      userId: workerUser2._id,
      skills: ['domestic_help', 'factory_helper'],
      experience: 4,
      experienceDetails: 'Housekeeping and packing work experience',
      dailyRate: 550,
      monthlyRate: 13500,
      availability: 'full_time',
    });

    const workerUser3 = await User.create({
      name: 'Mohan Patil',
      email: 'mohan@worker.com',
      phone: '9876543230',
      password: 'password123',
      userType: 'worker',
      address: {
        village: 'Bhosari',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411039',
      },
      isVerified: true,
    });

    const worker3 = await Worker.create({
      userId: workerUser3._id,
      skills: ['factory_helper', 'construction_labour'],
      experience: 3,
      experienceDetails: 'Factory loading, unloading and helper work',
      dailyRate: 500,
      monthlyRate: 12500,
      availability: 'part_time',
    });

    console.log('✅ Workers created: rajesh/sita/mohan@worker.com / password123');

    // Create sample employers
    const employerUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@employer.com',
      phone: '9876543211',
      password: 'password123',
      userType: 'employer',
      address: {
        village: 'Kharadi',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411014',
      },
      isVerified: true,
    });

    const employer = await Employer.create({
      userId: employerUser._id,
      companyName: 'Sharma Construction Co.',
      companyType: 'construction',
      contactPerson: 'Priya Sharma',
      isVerified: true,
    });

    const employerUser2 = await User.create({
      name: 'Amit Jadhav',
      email: 'amit@employer.com',
      phone: '9876543212',
      password: 'password123',
      userType: 'employer',
      address: {
        village: 'Chakan',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '410501',
      },
      isVerified: true,
    });

    const employer2 = await Employer.create({
      userId: employerUser2._id,
      companyName: 'Jadhav Agro Foods',
      companyType: 'farm',
      contactPerson: 'Amit Jadhav',
      isVerified: true,
    });

    console.log('✅ Employers created: priya/amit@employer.com / password123');

    // Create sample jobs
    const jobsToCreate = [
      {
        employerId: employer._id,
        title: 'Construction Workers Needed',
        description: 'Need 5 construction workers for a building project in Kharadi, Pune.',
        workType: 'construction_labour',
        location: { village: 'Kharadi', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 600, period: 'daily' },
        numberOfPositions: 5,
        experienceRequired: 2,
        workingHours: { startTime: '08:00', endTime: '17:00', daysPerWeek: 6 },
        accommodation: true,
        mealProvided: true,
        benefits: ['Safety gear provided', 'Weekly payment'],
      },
      {
        employerId: employer._id,
        title: 'Factory Helpers Required',
        description: 'Packing and loading helpers needed for a food processing unit.',
        workType: 'factory_helper',
        location: { village: 'Bhosari', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 520, period: 'daily' },
        numberOfPositions: 8,
        experienceRequired: 1,
        workingHours: { startTime: '09:00', endTime: '18:00', daysPerWeek: 6 },
        accommodation: false,
        mealProvided: true,
        benefits: ['Overtime available'],
      },
      {
        employerId: employer._id,
        title: 'Housekeeping Staff Needed',
        description: 'Domestic help needed for cleaning and basic household support.',
        workType: 'domestic_help',
        location: { village: 'Viman Nagar', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 14000, period: 'monthly' },
        numberOfPositions: 3,
        experienceRequired: 1,
        workingHours: { startTime: '07:00', endTime: '15:00', daysPerWeek: 6 },
        accommodation: false,
        mealProvided: false,
        benefits: ['Monthly bonus based on attendance'],
      },
      {
        employerId: employer2._id,
        title: 'Farm Workers for Harvesting',
        description: 'Seasonal farm workers needed for crop harvesting and sorting.',
        workType: 'farm_worker',
        location: { village: 'Chakan', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 450, period: 'daily' },
        numberOfPositions: 10,
        experienceRequired: 0,
        workingHours: { startTime: '06:00', endTime: '14:00', daysPerWeek: 7 },
        accommodation: true,
        mealProvided: true,
        benefits: ['Transport from nearby pickup points'],
      },
      {
        employerId: employer2._id,
        title: 'Dairy Farm Assistant',
        description: 'Assist with milking, feeding cattle and maintaining cleanliness at dairy farm.',
        workType: 'farm_worker',
        location: { village: 'Rajgurunagar', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 15500, period: 'monthly' },
        numberOfPositions: 4,
        experienceRequired: 1,
        workingHours: { startTime: '05:00', endTime: '13:00', daysPerWeek: 6 },
        accommodation: true,
        mealProvided: true,
        benefits: ['Accommodation included', 'Festival bonus'],
      },
      {
        employerId: employer2._id,
        title: 'Warehouse Sorting Staff',
        description: 'Need workers for package sorting and dispatch support in warehouse.',
        workType: 'other',
        location: { village: 'Talegaon', district: 'Pune', state: 'Maharashtra' },
        salary: { amount: 500, period: 'daily' },
        numberOfPositions: 6,
        experienceRequired: 0,
        workingHours: { startTime: '10:00', endTime: '19:00', daysPerWeek: 6 },
        accommodation: false,
        mealProvided: true,
        benefits: ['Weekly off on Sunday'],
      },
    ];

    const jobsWithTranslations = await Promise.all(
      jobsToCreate.map(async (job) => ({
        ...job,
        titleHi: await translateDescription(job.title, 'hi'),
        descriptionHi: await translateDescription(job.description, 'hi'),
        jobStatus: 'open',
        isApproved: true,
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      }))
    );

    const createdJobs = await Job.insertMany(jobsWithTranslations);

    const applications = await Application.insertMany([
      {
        workerId: worker1._id,
        jobId: createdJobs[0]._id,
        employerId: employer._id,
        status: 'accepted',
        applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        acceptedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        workerId: worker2._id,
        jobId: createdJobs[3]._id,
        employerId: employer2._id,
        status: 'applied',
        applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        workerId: worker3._id,
        jobId: createdJobs[1]._id,
        employerId: employer._id,
        status: 'shortlisted',
        applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
    ]);

    await Payment.insertMany([
      {
        applicationId: applications[0]._id,
        employerId: employer._id,
        workerId: worker1._id,
        amount: 3000,
        paymentMethod: 'upi',
        status: 'advance_paid',
        paymentType: 'advance',
        platformFee: 150,
        platformCommission: 150,
        netAmount: 2850,
        transactionId: 'TXN-ADV-1001',
        description: 'Advance payment for construction job',
        advancePaymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        applicationId: applications[0]._id,
        employerId: employer._id,
        workerId: worker1._id,
        amount: 3000,
        paymentMethod: 'upi',
        status: 'completed',
        paymentType: 'final',
        platformFee: 150,
        platformCommission: 150,
        netAmount: 2850,
        transactionId: 'TXN-FIN-1001',
        description: 'Final payment for construction job',
        completionPaymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ]);

    console.log(`✅ ${createdJobs.length} Sample jobs created`);
    console.log(`✅ ${applications.length} Sample applications created`);
    console.log('✅ Sample payments created');

    console.log('\n=== Test Accounts ===');
    console.log('Admin: admin@ruralemp.com / admin123');
    console.log('Worker: rajesh@worker.com / password123');
    console.log('Worker: sita@worker.com / password123');
    console.log('Worker: mohan@worker.com / password123');
    console.log('Employer: priya@employer.com / password123');
    console.log('Employer: amit@employer.com / password123');
    console.log('\nDatabase seeded successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
