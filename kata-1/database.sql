CREATE TABLE patients (
    patient_id UUID PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE triage_queues (
    queue_id UUID PRIMARY KEY,
    queue_date DATE NOT NULL,
    department_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE triage_entries (
    entry_id UUID PRIMARY KEY,
    queue_id UUID NOT NULL REFERENCES triage_queues(queue_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    original_urgency VARCHAR(20) NOT NULL,
    effective_urgency VARCHAR(20) NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    position_snapshot INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_triage_entries_queue_priority_arrival
    ON triage_entries (queue_id, effective_urgency, arrival_time);

CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY,
    entry_id UUID NOT NULL UNIQUE REFERENCES triage_entries(entry_id),
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    attending_physician VARCHAR(120),
    outcome_notes TEXT
);
