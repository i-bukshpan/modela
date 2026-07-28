-- הוספת עמודת הערות (notes) לטבלת הוצאות (expenses)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS notes text;

-- הוספת עמודת הערות (notes) לטבלת הכנסות (revenue_entries)
ALTER TABLE revenue_entries 
ADD COLUMN IF NOT EXISTS notes text;
