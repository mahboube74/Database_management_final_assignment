
INSERT INTO customers (customer_id, email, full_name, phone, address, registration_date) VALUES
    (gen_random_uuid(), 'jean.dupont@email.com', 'Jean Dupont', '+3225551111', 'Brussels, Grand Place 12, Belgium', NOW()),
    (gen_random_uuid(), 'marie.leclerc@email.com', 'Marie Leclerc', '+3247788888', 'Antwerp, Meir 45, Belgium', NOW()),
    (gen_random_uuid(), 'lucas.vanhout@email.com', 'Lucas Vanhout', '+3256555123', 'Ghent, Veldstraat 78, Belgium', NOW())
;

INSERT INTO sellers (seller_id, company_name, contact_email, phone, city, rating, payment_method, registration_date) VALUES
    (gen_random_uuid(), 'BelgianChocolate Deluxe', 'info@belgianchocolate.be', '+3222223333', 'Brussels', 4.90, 'Bank Transfer', NOW()),
    (gen_random_uuid(), 'Brussels Electronics', 'sales@brussels-electronics.be', '+3224445555', 'Brussels', 4.70, 'Credit Card', NOW()),
    (gen_random_uuid(), 'Antwerp Fashion Hub', 'contact@antwerpfashion.be', '+3236667777', 'Antwerp', 4.50, 'PayPal', NOW())
;

INSERT INTO categories (category_id, name, description, parent_category_id) VALUES
    (gen_random_uuid(), 'Belgian Chocolate', 'Premium Belgian chocolate products',
        (SELECT category_id FROM categories WHERE name = 'Food & Beverage' LIMIT 1)),
    (gen_random_uuid(), 'Diamonds & Jewelry', 'Luxury diamonds from Antwerp', NULL),
    (gen_random_uuid(), 'Belgian Beer', 'Traditional Belgian beer collection', NULL)
;

INSERT INTO products (product_id, name, description, seller_id, category_id, base_price, listing_date, is_active)
SELECT
    gen_random_uuid(),
    product.name,
    product.description,
    s.seller_id,
    c.category_id,
    product.price,
    NOW(),
    true
FROM (
    VALUES
        ('Godiva Premium Box 24pc', 'Luxury Belgian chocolate gift box', 'Belgian Chocolate', 850000),
        ('Leonidas Praline Collection', 'Assorted Belgian pralines', 'Belgian Chocolate', 650000),
        ('Antwerp Diamond Ring', '18K gold with 0.5ct diamond', 'Diamonds & Jewelry', 45000000),
        ('Belgian Diamond Earrings', 'Elegant diamond stud earrings', 'Diamonds & Jewelry', 32000000),
        ('Trappist Westvleteren 12', 'Rare Belgian Trappist beer', 'Belgian Beer', 1500000),
        ('Duvel Belgian Ale', 'Classic Belgian strong ale', 'Belgian Beer', 250000),
        ('Chimay Blue Label', 'Belgian Trappist beer', 'Belgian Beer', 350000),
        ('Neuhaus Chocolate Box', 'Prestige Belgian chocolate', 'Belgian Chocolate', 550000)
) AS product(name, description, category_name, price)
JOIN categories c ON c.name = product.category_name
JOIN sellers s ON s.company_name = (
    CASE
        WHEN product.category_name = 'Belgian Chocolate' THEN 'BelgianChocolate Deluxe'
        WHEN product.category_name = 'Diamonds & Jewelry' THEN 'Antwerp Fashion Hub'
        WHEN product.category_name = 'Belgian Beer' THEN 'Brussels Electronics'
    END
)
;

INSERT INTO inventory (product_id, quantity_on_hand, reserved_quantity, reorder_level)
SELECT
    p.product_id,
    CASE p.name
        WHEN 'Trappist Westvleteren 12' THEN 50   -- محصولات کمیاب با موجودی محدود
        WHEN 'Antwerp Diamond Ring' THEN 20
        WHEN 'Belgian Diamond Earrings' THEN 30
        ELSE 100
    END AS qty,
    0 AS reserved,
    CASE p.name
        WHEN 'Trappist Westvleteren 12' THEN 5
        ELSE 10
    END AS reorder
FROM products p
WHERE p.name IN (
    'Godiva Premium Box 24pc',
    'Leonidas Praline Collection',
    'Antwerp Diamond Ring',
    'Belgian Diamond Earrings',
    'Trappist Westvleteren 12',
    'Duvel Belgian Ale',
    'Chimay Blue Label',
    'Neuhaus Chocolate Box'
)
;

INSERT INTO orders (order_id, customer_id, order_date, status, total_amount, payment_method, shipping_address, tracking_number)
SELECT
    gen_random_uuid(),
    c.customer_id,
    NOW() - (random() * INTERVAL '7 days'),
    (ARRAY['Pending', 'Processing', 'Shipped', 'Delivered'])[floor(random() * 4) + 1],
    0,  -- موقتاً 0، بعداً به‌روز می‌شود
    (ARRAY['Credit Card', 'Bank Transfer', 'PayPal'])[floor(random() * 3) + 1],
    c.address,
    'BEL' || 'TRK' || LPAD(floor(random() * 1000000)::TEXT, 6, '0')
FROM customers c
WHERE c.email LIKE '%belgium%' OR c.email LIKE '%be'
ORDER BY random()
LIMIT 5;

INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount)
SELECT
    o.order_id,
    p.product_id,
    CASE p.name
        WHEN 'Trappist Westvleteren 12' THEN 2
        WHEN 'Antwerp Diamond Ring' THEN 1
        WHEN 'Belgian Diamond Earrings' THEN 1
        ELSE 2
    END AS qty,
    p.base_price,
    CASE
        WHEN p.base_price > 10000000 THEN 5.00
        ELSE 0
    END AS discount
FROM orders o
CROSS JOIN LATERAL (
    SELECT product_id, base_price, name
    FROM products
    WHERE name IN (
        'Godiva Premium Box 24pc',
        'Leonidas Praline Collection',
        'Antwerp Diamond Ring',
        'Belgian Diamond Earrings',
        'Trappist Westvleteren 12',
        'Duvel Belgian Ale'
    )
    ORDER BY random()
    LIMIT (random() * 2 + 1)::INT
) p
;

UPDATE orders o
SET total_amount = (
    SELECT COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount/100)), 0)
    FROM order_items oi
    WHERE oi.order_id = o.order_id
)
WHERE o.order_id IN (SELECT order_id FROM order_items);


SELECT
    o.order_id,
    c.full_name AS customer,
    c.address,
    o.total_amount,
    o.status,
    o.tracking_number,
    COUNT(oi.product_id) AS item_count,
    SUM(oi.quantity) AS total_items
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE c.address LIKE '%Belgium%' OR c.address LIKE '%Belgique%'
GROUP BY o.order_id, c.full_name, c.address, o.total_amount, o.status, o.tracking_number;

SELECT
    p.name AS product_name,
    p.base_price,
    i.quantity_on_hand,
    i.reserved_quantity,
    i.reorder_level
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE p.name LIKE '%Belgian%' OR p.name LIKE '%Belgium%' OR p.name IN (
    'Godiva Premium Box 24pc',
    'Leonidas Praline Collection',
    'Trappist Westvleteren 12',
    'Duvel Belgian Ale'
)
ORDER BY i.quantity_on_hand ASC;
