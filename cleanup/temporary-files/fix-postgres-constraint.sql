-- PostgreSQL Constraint Fix for counselor_notes table
-- This script addresses the constraint violation issue

-- 1. Check current constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'counselor_notes_note_type_check';

-- 2. Check if there are any existing invalid records
SELECT 
    id, 
    note_type, 
    title,
    CASE 
        WHEN note_type IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication') 
        THEN 'VALID' 
        ELSE 'INVALID' 
    END as validity_status
FROM counselor_notes 
WHERE note_type NOT IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication');

-- 3. If there are invalid records, update them to 'general'
UPDATE counselor_notes 
SET note_type = 'general' 
WHERE note_type NOT IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication');

-- 4. Drop and recreate the constraint to ensure it's properly defined
ALTER TABLE counselor_notes DROP CONSTRAINT IF EXISTS counselor_notes_note_type_check;

-- 5. Add the constraint back with explicit naming
ALTER TABLE counselor_notes 
ADD CONSTRAINT counselor_notes_note_type_check 
CHECK (note_type IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication'));

-- 6. Verify the constraint is working
-- This should succeed:
-- INSERT INTO counselor_notes (student_id, counselor_id, note_type, title, content) 
-- VALUES (1, 1, 'general', 'Test Note', 'Test content');

-- This should fail:
-- INSERT INTO counselor_notes (student_id, counselor_id, note_type, title, content) 
-- VALUES (1, 1, 'invalid_type', 'Test Note', 'Test content');

-- 7. Check final constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'counselor_notes_note_type_check';