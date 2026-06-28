const express = require('express');
const { connectMongoDB, testConnections, supabase } = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const start = Date.now();
    console.log(`${req.method} ${req.url}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`   answer: ${res.statusCode} (${duration}ms)`);
    });

    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'CFX',
    });
});
app.post('/api/customers', async (req, res) => {
    try {
        const { email, full_name, phone, address } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your email'
            });
        }
        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your full name'
            });
        }


        const { data, error } = await supabase
            .from('customers')
            .insert([
                {
                    email: email,
                    full_name: full_name,
                    phone: phone || null,
                    address: address || null
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/customersList', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/customers/email', async (req, res) => {
    try {
        const { email } = req.body;

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/sellers', async (req, res) => {
    try {
        const { company_name, contact_email, phone, city } = req.body;

        if (!company_name || !contact_email) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your email and company name'
            });
        }

        const { data, error } = await supabase
            .from('sellers')
            .insert([
                {
                    company_name: company_name,
                    contact_email: contact_email,
                    phone: phone || null,
                    city: city || null
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/sellersList', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sellers')
            .select('*')
            .order('company_name');

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { seller_id, category_id, name, description, base_price } = req.body;

        if (!seller_id || !name || !base_price ) {
            return res.status(400).json({
                success: false,
                message: 'seller_id، name، base_price are necessary'
            });
        }

        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    seller_id: seller_id,
                    category_id: category_id || null,
                    name: name,
                    description: description || null,
                    base_price: base_price,
                    is_active: true
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, description, parent_category_id } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please enter name'
            });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([
                {
                    name: name,
                    description: description || null,
                    parent_category_id: parent_category_id || null
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/productsList', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                sellers (company_name, rating),
                categories (name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer_id, payment_method, shipping_address, items } = req.body;

        if (!customer_id || !payment_method || !shipping_address || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all inputs'
            });
        }

        for (const item of items) {
            const { data: inventory, error: invError } = await supabase
                .from('inventory')
                .select('quantity_on_hand, reserved_quantity')
                .eq('product_id', item.product_id)
                .single();

            if (invError) {
                return res.status(400).json({
                    success: false,
                    message: 'ID ${item.product_id} is not found'
                });
            }

            const available = inventory.quantity_on_hand - inventory.reserved_quantity;

            if (available < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: '${item.product_id} Insufficient inventory' ,
                    available: available,
                    requested: item.quantity
                });
            }
        }

        let total_amount = 0;
        for (const item of items) {
            total_amount += item.quantity * item.unit_price;
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id,
                payment_method,
                shipping_address,
                total_amount,
                status: 'Pending'
            }])
            .select()
            .single();

        if (orderError) {
            return res.status(400).json({
                success: false,
                error: orderError.message
            });
        }

        const orderItems = items.map(item => ({
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount || 0
        }));

        const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)
            .select();

        if (itemsError) {
            await supabase.from('orders').delete().eq('order_id', order.order_id);
            return res.status(400).json({
                success: false,
                error: itemsError.message
            });
        }

        res.status(201).json({
            success: true,
            data: { order, items: itemsData }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/orders/customer', async (req, res) => {
    try {
        const { customer_id } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    product_id,
                    quantity,
                    unit_price,
                    discount,
                    products (name)
                )
            `)
            .eq('customer_id', customer_id)
            .order('order_date', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await testConnections();
        res.json({
            success: true,
            details: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/clicks', async (req, res) => {
    try {
        const { customer_id, product_id, action_type, page_url } = req.body;

        if (!customer_id || !action_type) {
            return res.status(400).json({
                success: false,
                message: 'customer_id و action_type are necessary'
            });
        }

        const db = require('./config/database').getMongoDb();
        const collection = db.collection('clickstream');

        const clickData = {
            customer_id: customer_id,
            product_id: product_id || null,
            action_type: action_type,
            page_url: page_url || null,
            timestamp: new Date(),
            session_id: 'session_' + Date.now()
        };

        const result = await collection.insertOne(clickData);

        res.status(201).json({
            success: true,
            data: { ...clickData, _id: result.insertedId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { product_id, customer_id, rating, comment } = req.body;

        if (!product_id || !customer_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'product_id، customer_id و rating are necessary'
            });
        }

        const db = require('./config/database').getMongoDb();
        const collection = db.collection('reviews');

        const reviewData = {
            product_id: product_id,
            customer_id: customer_id,
            rating: rating,
            comment: comment || null,
            review_date: new Date(),
            helpful_votes: 0,
            comments: []
        };

        const result = await collection.insertOne(reviewData);

        res.status(201).json({
            success: true,
            data: { ...reviewData, _id: result.insertedId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/reviews/product', async (req, res) => {
    try {
        const { product_id } = req.body;

        const db = require('./config/database').getMongoDb();
        const collection = db.collection('reviews');

        const reviews = await collection
            .find({ product_id: product_id })
            .sort({ review_date: -1 })
            .toArray();

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطای سرور',
            error: error.message
        });
    }
});

app.listen(port, async () => {

    try {
        await connectMongoDB();
    } catch (error) {
        console.error(error.message);
    }

});

process.on('unhandledRejection', (error) => {
    console.error(error);
});
