DROP TRIGGER IF EXISTS trigger_update_inventory_time ON inventory CASCADE;
DROP TRIGGER IF EXISTS trg_reduce_inventory ON order_items CASCADE;
DROP FUNCTION IF EXISTS update_inventory_timestamp() CASCADE;
DROP FUNCTION IF EXISTS reduce_inventory() CASCADE;

CREATE OR REPLACE FUNCTION update_inventory_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_time
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_inventory_time();

CREATE OR REPLACE FUNCTION reduce_inventory()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT quantity_on_hand INTO current_stock
    FROM inventory
    WHERE product_id = NEW.product_id;

    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Product: %, Available: %, Requested: %',
            NEW.product_id, current_stock, NEW.quantity;
    END IF;

    UPDATE inventory
    SET quantity_on_hand = quantity_on_hand - NEW.quantity,
        last_updated = NOW()
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reduce_inventory
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION reduce_inventory();
