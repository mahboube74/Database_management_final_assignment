--1. Monthly Sales Analysis
SELECT DATE_TRUNC('month', order_date) AS month,
       SUM(total_amount) AS total_sales
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

--2. Top-Selling Products
SELECT p.product_id,
       p.name AS product_name,
       SUM(oi.quantity) AS total_units_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY total_units_sold DESC;


-- 3. Low-Stock Products
SELECT i.product_id,
       i.quantity_on_hand AS stock_quantity,
       p.name AS product_name
FROM inventory i, products p
WHERE i.product_id = p.product_id
  AND i.quantity_on_hand < 10
ORDER BY i.quantity_on_hand ASC;
