SELECT u.name, p.id as posting_id, d.name as dept_name, d.type as dept_type, d."subType" as dept_sub_type
FROM "User" u
JOIN "Posting" p ON u.id = p."userId"
JOIN "Department" d ON p."deptId" = d.id
LIMIT 10;
