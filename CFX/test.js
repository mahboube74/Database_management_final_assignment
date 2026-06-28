// =============================================
// تست MongoDB
// =============================================

const { connectMongoDB, getMongoDb } = require('./config/database');

async function testMongoDB() {
    try {
        // اتصال به MongoDB
        await connectMongoDB();
        const db = getMongoDb();
        
        // گرفتن کالکشن product_catalog
        const collection = db.collection('product_catalog');
        
        // اضافه کردن یک محصول نمونه
        const sampleProduct = {
            _id: 'test-001',
            name: 'محصول تست',
            price: 1000000,
            description: 'این یک محصول تست است',
            category: 'تست',
            dynamic_attributes: {
                brand: 'تست برند',
                color: 'قرمز',
                size: 'XL'
            },
            created_at: new Date()
        };
        
        // درج در دیتابیس
        const result = await collection.insertOne(sampleProduct);
        console.log('✅ محصول تست اضافه شد:', result.insertedId);
        
        // پیدا کردن محصول
        const found = await collection.findOne({ _id: 'test-001' });
        console.log('✅ محصول پیدا شد:', found);
        
        console.log('========================================');
        console.log('✅ همه چیز به درستی کار می‌کند!');
        console.log('========================================');
        
    } catch (error) {
        console.error('❌ خطا:', error.message);
    }
}

testMongoDB();
