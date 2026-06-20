require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('./src/app');

// Import models
const User = require('./models/user.model');
const Service = require('./models/service.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HalloBarberShop';
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
const PORT = 3001;
const API_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    let server;
    try {
        // Start express server
        console.log(`🔄 Starting Express server on port ${PORT}...`);
        server = app.listen(PORT);
        console.log('✅ Server started.');

        // 1. CLEAN UP test data
        console.log('🔄 Cleaning up test database...');
        await User.deleteMany({ email: { $in: ['test_admin@test.com', 'test_customer@test.com'] } });
        await Service.deleteMany({ name: { $regex: /Test|VIP|Perm/i } });

        // 2. CREATE test users and data
        console.log('🔄 Seeding test data...');
        const adminUser = await User.create({
            name: 'Test Admin',
            email: 'test_admin@test.com',
            password: 'password123',
            role: 'admin',
            phone: '0111111111'
        });

        const customerUser = await User.create({
            name: 'Test Customer',
            email: 'test_customer@test.com',
            password: 'password123',
            role: 'customer',
            phone: '0222222222'
        });

        // Set JWT_SECRET in environment to ensure server token verification works
        process.env.JWT_SECRET = JWT_SECRET;
        
        const adminToken = jwt.sign({ userId: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        const customerToken = jwt.sign({ userId: customerUser._id, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

        const adminHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        };
        const customerHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customerToken}`
        };

        console.log('\n--- SERVICE CRUD TESTS ---');

        // Test 1.1: Create Service without authorization
        console.log('▶️ Test 1.1: Create service without token (Should fail)');
        let res = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Unauthorized Service', price: 100000 })
        });
        let data = await res.json();
        if (res.status === 401) {
            console.log('✅ Success: Blocked unauthorized request.');
        } else {
            console.error('❌ Fail: Expected status 401, got', res.status, data);
        }

        // Test 1.2: Create Service as Customer (Should fail)
        console.log('▶️ Test 1.2: Create service as customer (Should fail)');
        res = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: customerHeaders,
            body: JSON.stringify({ name: 'Customer Attempt Service', price: 100000 })
        });
        data = await res.json();
        if (res.status === 403) {
            console.log('✅ Success: Blocked customer from creating service.');
        } else {
            console.error('❌ Fail: Expected status 403, got', res.status, data);
        }

        // Test 1.3: Create Service as Admin (Should succeed)
        console.log('▶️ Test 1.3: Create service as admin');
        const newServiceData = {
            name: 'Test Haircut Service',
            description: 'Premium haircut for tests',
            price: 150000,
            durationMinutes: 30,
            category: 'cut',
            isActive: true
        };
        res = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify(newServiceData)
        });
        data = await res.json();
        let serviceId1;
        if (res.status === 201 && data.success) {
            serviceId1 = data.service._id;
            console.log('✅ Success: Created service with ID:', serviceId1);
        } else {
            console.error('❌ Fail: Failed to create service.', res.status, data);
        }

        // Create secondary services to test filters and pagination
        const vipComboRes = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: 'VIP Combo Service',
                description: 'Full combo experience',
                price: 450000,
                durationMinutes: 90,
                category: 'combo',
                isActive: true
            })
        });
        const vipComboData = await vipComboRes.json();
        const serviceId2 = vipComboData.service._id;

        const permRes = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: 'Perm Service',
                description: 'Korean style perm',
                price: 300000,
                durationMinutes: 60,
                category: 'perm',
                isActive: false // inactive
            })
        });
        const permData = await permRes.json();
        const serviceId3 = permData.service._id;

        // Test 1.4: Get All Services (without filters)
        console.log('▶️ Test 1.4: Get all services without filters');
        res = await fetch(`${API_URL}/services`);
        data = await res.json();
        if (res.status === 200 && data.services && data.services.length === 3) {
            console.log('✅ Success: Fetched all 3 services. Total count in pagination:', data.pagination.total);
        } else {
            console.error('❌ Fail: Get all services returned unexpected data.', res.status, data);
        }

        // Test 1.5: Get Services with search query
        console.log('▶️ Test 1.5: Get services with search query "VIP"');
        res = await fetch(`${API_URL}/services?search=VIP`);
        data = await res.json();
        if (res.status === 200 && data.services.length === 1 && data.services[0].name === 'VIP Combo Service') {
            console.log('✅ Success: Found service matching search.');
        } else {
            console.error('❌ Fail: Search query test failed.', res.status, data);
        }

        // Test 1.6: Get Services with category filter
        console.log('▶️ Test 1.6: Get services with category "perm"');
        res = await fetch(`${API_URL}/services?category=perm`);
        data = await res.json();
        if (res.status === 200 && data.services.length === 1 && data.services[0].category === 'perm') {
            console.log('✅ Success: Category filter works.');
        } else {
            console.error('❌ Fail: Category filter test failed.', res.status, data);
        }

        // Test 1.7: Get Services with isActive filter
        console.log('▶️ Test 1.7: Get active-only services (isActive=true)');
        res = await fetch(`${API_URL}/services?isActive=true`);
        data = await res.json();
        if (res.status === 200 && data.services.length === 2) {
            const activeServices = data.services.map(s => s.name);
            console.log('✅ Success: Active filter works. Returned:', activeServices);
        } else {
            console.error('❌ Fail: isActive=true filter failed.', res.status, data);
        }

        // Test 1.8: Get Service Detail
        console.log('▶️ Test 1.8: Get service details');
        res = await fetch(`${API_URL}/services/${serviceId1}`);
        data = await res.json();
        if (res.status === 200 && data.service && data.service.name === 'Test Haircut Service') {
            console.log('✅ Success: Fetched service detail.');
        } else {
            console.error('❌ Fail: Get detail failed.', res.status, data);
        }

        // Test 1.9: Update Service
        console.log('▶️ Test 1.9: Update service price and name as admin');
        res = await fetch(`${API_URL}/services/${serviceId1}`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({
                name: 'Test Haircut Service (Updated)',
                price: 180000
            })
        });
        data = await res.json();
        if (res.status === 200 && data.service && data.service.name === 'Test Haircut Service (Updated)' && data.service.price === 180000) {
            console.log('✅ Success: Service updated correctly.');
        } else {
            console.error('❌ Fail: Update service failed.', res.status, data);
        }

        // Test 1.10: Delete Service
        console.log('▶️ Test 1.10: Delete service as admin');
        res = await fetch(`${API_URL}/services/${serviceId3}`, {
            method: 'DELETE',
            headers: adminHeaders
        });
        data = await res.json();
        if (res.status === 200 && data.success) {
            console.log('✅ Success: Deleted service correctly.');
            // Double check
            const checkRes = await fetch(`${API_URL}/services/${serviceId3}`);
            if (checkRes.status === 404) {
                console.log('   Confirmed: Service no longer exists (404).');
            } else {
                console.error('❌ Fail: Service still retrievable after deletion.');
            }
        } else {
            console.error('❌ Fail: Delete service failed.', res.status, data);
        }

    } catch (err) {
        console.error('❌ System Error during testing:', err);
    } finally {
        // Shutdown server
        if (server) {
            console.log('\n🔄 Closing Express server...');
            server.close();
            console.log('✅ Server closed.');
        }
        // Disconnect DB
        console.log('🔄 Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('✅ Disconnected.');
        console.log('\n🏁 Service CRUD Tests Completed.');
    }
}

runTests();
