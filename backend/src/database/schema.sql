-- Lantern AI Database Schema
-- Multi-user career guidance platform with relationships

-- Users table (students, counselors, parents)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'counselor', 'parent')),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Student profiles (extended information for students)
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    grade INTEGER,
    school_name VARCHAR(200),
    zip_code VARCHAR(10),
    interests TEXT, -- JSON array of interests
    skills TEXT, -- JSON array of skills
    education_goal VARCHAR(50),
    work_environment VARCHAR(50),
    gpa DECIMAL(3,2),
    extracurricular_activities TEXT, -- JSON array
    career_aspirations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Counselor profiles
CREATE TABLE IF NOT EXISTS counselor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    school_district VARCHAR(200),
    specializations TEXT, -- JSON array of specializations
    years_experience INTEGER,
    license_number VARCHAR(100),
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Parent profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    occupation VARCHAR(200),
    education_level VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Relationships between users (parent-student, counselor-student)
CREATE TABLE IF NOT EXISTS user_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_user_id INTEGER NOT NULL, -- counselor or parent
    secondary_user_id INTEGER NOT NULL, -- student
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('parent_child', 'counselor_student')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (primary_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (secondary_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(primary_user_id, secondary_user_id, relationship_type)
);

-- Assessment sessions
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- NULL for anonymous sessions
    session_token VARCHAR(255) UNIQUE NOT NULL,
    zip_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Assessment answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    answer TEXT NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE
);

-- Career matches and recommendations
CREATE TABLE IF NOT EXISTS career_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_id INTEGER, -- For logged-in users
    career_matches TEXT NOT NULL, -- JSON array of career matches
    ai_recommendations TEXT, -- JSON object with AI recommendations
    local_job_market TEXT, -- JSON object with local job data
    academic_plan TEXT, -- JSON object with course recommendations
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Action plans (personalized career pathways)
CREATE TABLE IF NOT EXISTS action_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    career_code VARCHAR(50) NOT NULL,
    career_title VARCHAR(200) NOT NULL,
    short_term_goals TEXT, -- JSON array
    medium_term_goals TEXT, -- JSON array
    long_term_goals TEXT, -- JSON array
    skill_gaps TEXT, -- JSON array
    action_items TEXT, -- JSON array
    progress_notes TEXT, -- JSON array of progress updates
    created_by INTEGER, -- counselor who created/modified
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Counselor notes and recommendations
CREATE TABLE IF NOT EXISTS counselor_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    counselor_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('assessment', 'meeting', 'recommendation', 'progress', 'other')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_shared_with_parent BOOLEAN DEFAULT 0,
    is_shared_with_student BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    action_plan_id INTEGER,
    milestone_type VARCHAR(50) NOT NULL,
    milestone_description TEXT NOT NULL,
    target_date DATE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    notes TEXT,
    recorded_by INTEGER, -- who recorded this progress
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Communication log (messages between users)
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'notification', 'reminder')),
    is_read BOOLEAN DEFAULT 0,
    parent_message_id INTEGER, -- for threading
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES communications(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_profiles_user_id ON counselor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_primary ON user_relationships(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_secondary ON user_relationships(secondary_user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_token ON assessment_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_session_id ON assessment_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_counselor_id ON counselor_notes(counselor_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_student_id ON counselor_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_communications_from_user ON communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_communications_to_user ON communications(to_user_id);