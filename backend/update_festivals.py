import sqlite3

conn = sqlite3.connect('myntra.db')
cursor = conn.cursor()

festivals_data = [
    (11, 'Chhath Puja', '["North", "Patna", "Bihar"]', '2026-11-16', '2026-11-19', 1),
    (12, 'Varalakshmi Vratam', '["South", "Vizag", "Vijayawada", "Belgaum", "Mysuru"]', '2026-08-28', '2026-08-28', 1),
    (13, 'Aadi Festival', '["South", "Coimbatore", "Madurai", "Salem", "Tamil Nadu"]', '2026-07-17', '2026-08-16', 1),
    (14, 'Ganesh Chaturthi', '["West", "Mumbai", "Belgaum", "Maharashtra", "Karnataka"]', '2026-09-12', '2026-09-21', 1),
    (15, 'Lohri', '["North", "Ludhiana", "Amritsar", "Punjab"]', '2026-01-13', '2026-01-13', 1),
    (16, 'Durga Puja', '["East", "Kolkata", "West Bengal"]', '2026-10-19', '2026-10-24', 1),
    (17, 'Raksha Bandhan', '["All India"]', '2026-08-28', '2026-08-28', 1),
    (18, 'Diwali', '["All India"]', '2026-11-08', '2026-11-12', 1)
]

for fest in festivals_data:
    # Use REPLACE to update or insert the row
    cursor.execute('''
        REPLACE INTO festivals (festival_id, name, region_tags, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', fest)

# For Rakhi and Diwali which might have different IDs locally, let's delete any old Rakhi/Diwali to avoid duplicates
cursor.execute("DELETE FROM festivals WHERE name IN ('Raksha Bandhan', 'Diwali') AND festival_id NOT IN (17, 18)")

conn.commit()
conn.close()
print("Festivals updated successfully!")
