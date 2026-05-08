#!/usr/bin/env python3

import random
from datetime import date, datetime, timedelta

import mysql.connector


DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "your password",
    "database": "wip_dashboard",
}

# Set the input dates here in YYYY-MM-DD format.
FROM_DATE = "2026-04-01"
TO_DATE = "2026-04-10"

# Set to True if you want to delete old rows before inserting new data.
CLEAR_EXISTING = False

LOT_STATUSES = ["NotStarted", "WorkInProcess", "Finished", "Hold", "Cancelled"]
DEFECT_CODES = ["Scratch", "Crack", "Discolor", "Burr", "Warp"]
AGING_BUCKETS = ["1-3", "4-7", "8-11", "12-15", "16-19", "20-23", "24-27"]
PRODUCTION_LINES = ["Line A", "Line B", "Line C", "Line D", "Line E"]

CREATE_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS wip_production_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        record_date DATE NOT NULL,
        pending_count INT NOT NULL,
        in_process_count INT NOT NULL,
        hold_count INT NOT NULL,
        cancelled_count INT NOT NULL,
        created_at DATETIME NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_lot_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        date DATETIME NOT NULL,
        week_start_date DATETIME NOT NULL,
        month_start_date DATETIME NOT NULL,
        status VARCHAR(50) NOT NULL,
        lot_count INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_scrap_rate (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        scrap FLOAT NOT NULL,
        wip_count INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_defect_rate (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        defect_code VARCHAR(50) NOT NULL,
        defect_count INT NOT NULL,
        total_defect_percentage FLOAT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_aging_bucket (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        aging_bucket VARCHAR(50) NOT NULL,
        lot_count INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_rework_rate (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        rework FLOAT NOT NULL,
        wip INT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS wip_yield_summary (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filter_type VARCHAR(50) NOT NULL,
        record_date DATE NOT NULL,
        lot_action_type VARCHAR(50) NOT NULL,
        production_line_code VARCHAR(50) NOT NULL,
        total_yield INT NOT NULL
    )
    """,
]
def parse_date(value: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError(f"Invalid date '{value}'. Use YYYY-MM-DD format.") from exc


def daterange(start_date: date, end_date: date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)


def week_start_for(day: date) -> datetime:
    return datetime.combine(day - timedelta(days=day.weekday()), datetime.min.time())


def month_start_for(day: date) -> datetime:
    return datetime.combine(day.replace(day=1), datetime.min.time())


def day_start(day: date) -> datetime:
    return datetime.combine(day, datetime.min.time())


def random_production_status(record_day: date):
    pending = random.randint(5, 30)
    in_process = random.randint(10, 60)
    hold = random.randint(0, 10)
    cancelled = random.randint(0, 5)
    return {
        "record_date": record_day,
        "pending_count": pending,
        "in_process_count": in_process,
        "hold_count": hold,
        "cancelled_count": cancelled,
        "created_at": day_start(record_day),
    }


def random_lot_status_rows(record_day: date):
    rows = []
    base_date = day_start(record_day)
    week_start_date = week_start_for(record_day)
    month_start_date = month_start_for(record_day)

    for status in LOT_STATUSES:
        if status == "NotStarted":
            lot_count = random.randint(5, 25)
        elif status == "WorkInProcess":
            lot_count = random.randint(15, 60)
        elif status == "Finished":
            lot_count = random.randint(10, 50)
        elif status == "Hold":
            lot_count = random.randint(0, 8)
        else:
            lot_count = random.randint(0, 4)

        rows.append(
            {
                "filter_type": "today",
                "record_date": record_day,
                "date": base_date,
                "week_start_date": week_start_date,
                "month_start_date": month_start_date,
                "status": status,
                "lot_count": lot_count,
            }
        )
    return rows


def random_scrap_rate_rows(record_day: date):
    return [
        {"filter_type": "7days", "record_date": record_day, "scrap": round(random.uniform(1.0, 5.5), 2), "wip_count": random.randint(80, 180)},
        {"filter_type": "30days", "record_date": record_day, "scrap": round(random.uniform(3.0, 8.5), 2), "wip_count": random.randint(200, 450)},
        {"filter_type": "90days", "record_date": record_day, "scrap": round(random.uniform(5.0, 12.0), 2), "wip_count": random.randint(500, 1000)},
    ]


def random_defect_rate_rows(record_day: date):
    rows = []
    filter_specs = {
        "today": 3,
        "7days": 4,
        "30days": 5,
    }

    for filter_type, defect_count in filter_specs.items():
        selected_codes = DEFECT_CODES[:defect_count]
        for code in selected_codes:
            if filter_type == "today":
                count = random.randint(1, 8)
                percentage = round(random.uniform(0.4, 2.0), 2)
            elif filter_type == "7days":
                count = random.randint(5, 20)
                percentage = round(random.uniform(1.0, 3.8), 2)
            else:
                count = random.randint(10, 45)
                percentage = round(random.uniform(1.5, 6.0), 2)

            rows.append(
                {
                    "filter_type": filter_type,
                    "record_date": record_day,
                    "defect_code": code,
                    "defect_count": count,
                    "total_defect_percentage": percentage,
                }
            )
    return rows


def random_wip_aging_rows(record_day: date):
    return [
        {
            "filter_type": "InProgress",
            "record_date": record_day,
            "aging_bucket": bucket,
            "lot_count": random.randint(10, 90),
        }
        for bucket in AGING_BUCKETS
    ]


def random_rework_rate_rows(record_day: date):
    return [
        {"filter_type": "today", "record_date": record_day, "rework": round(random.uniform(1.0, 4.0), 2), "wip": random.randint(80, 180)},
        {"filter_type": "7days", "record_date": record_day, "rework": round(random.uniform(3.0, 6.5), 2), "wip": random.randint(250, 450)},
        {"filter_type": "30days", "record_date": record_day, "rework": round(random.uniform(5.0, 9.0), 2), "wip": random.randint(600, 1000)},
    ]


def random_yield_summary_rows(record_day: date):
    rows = []
    for filter_type, min_yield, max_yield in (
        ("today", 40, 95),
        ("weeks", 50, 97),
        ("months", 55, 99),
    ):
        for line in PRODUCTION_LINES:
            rows.append(
                {
                    "filter_type": filter_type,
                    "record_date": record_day,
                    "lot_action_type": "Completed",
                    "production_line_code": line,
                    "total_yield": random.randint(min_yield, max_yield),
                }
            )
    return rows


def ensure_record_date_columns(cursor):
    alter_statements = [
        "ALTER TABLE wip_production_status ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_lot_status ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_scrap_rate ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_defect_rate ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_aging_bucket ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_rework_rate ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
        "ALTER TABLE wip_yield_summary ADD COLUMN record_date DATE NOT NULL DEFAULT (CURRENT_DATE)",
    ]

    for statement in alter_statements:
        try:
            cursor.execute(statement)
        except mysql.connector.Error:
            pass


def create_tables(cursor):
    for query in CREATE_TABLES:
        cursor.execute(query)
    ensure_record_date_columns(cursor)


def clear_existing_data(cursor):
    tables = [
        "wip_production_status",
        "wip_lot_status",
        "wip_scrap_rate",
        "wip_defect_rate",
        "wip_aging_bucket",
        "wip_rework_rate",
        "wip_yield_summary",
    ]
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")


def insert_data_for_date(cursor, record_day: date):
    production_row = random_production_status(record_day)
    lot_rows = random_lot_status_rows(record_day)
    scrap_rows = random_scrap_rate_rows(record_day)
    defect_rows = random_defect_rate_rows(record_day)
    aging_rows = random_wip_aging_rows(record_day)
    rework_rows = random_rework_rate_rows(record_day)
    yield_rows = random_yield_summary_rows(record_day)

    cursor.execute(
        """
        INSERT INTO wip_production_status
        (record_date, pending_count, in_process_count, hold_count, cancelled_count, created_at)
        VALUES (%(record_date)s, %(pending_count)s, %(in_process_count)s, %(hold_count)s, %(cancelled_count)s, %(created_at)s)
        """,
        production_row,
    )

    cursor.executemany(
        """
        INSERT INTO wip_lot_status
        (filter_type, record_date, date, week_start_date, month_start_date, status, lot_count)
        VALUES (%(filter_type)s, %(record_date)s, %(date)s, %(week_start_date)s, %(month_start_date)s, %(status)s, %(lot_count)s)
        """,
        lot_rows,
    )

    cursor.executemany(
        """
        INSERT INTO wip_scrap_rate
        (filter_type, record_date, scrap, wip_count)
        VALUES (%(filter_type)s, %(record_date)s, %(scrap)s, %(wip_count)s)
        """,
        scrap_rows,
    )

    cursor.executemany(
        """
        INSERT INTO wip_defect_rate
        (filter_type, record_date, defect_code, defect_count, total_defect_percentage)
        VALUES (%(filter_type)s, %(record_date)s, %(defect_code)s, %(defect_count)s, %(total_defect_percentage)s)
        """,
        defect_rows,
    )

    cursor.executemany(
        """
        INSERT INTO wip_aging_bucket
        (filter_type, record_date, aging_bucket, lot_count)
        VALUES (%(filter_type)s, %(record_date)s, %(aging_bucket)s, %(lot_count)s)
        """,
        aging_rows,
    )

    cursor.executemany(
        """
        INSERT INTO wip_rework_rate
        (filter_type, record_date, rework, wip)
        VALUES (%(filter_type)s, %(record_date)s, %(rework)s, %(wip)s)
        """,
        rework_rows,
    )

    cursor.executemany(
        """
        INSERT INTO wip_yield_summary
        (filter_type, record_date, lot_action_type, production_line_code, total_yield)
        VALUES (%(filter_type)s, %(record_date)s, %(lot_action_type)s, %(production_line_code)s, %(total_yield)s)
        """,
        yield_rows,
    )


def print_summary(cursor, total_days: int):
    tables = [
        "wip_production_status",
        "wip_lot_status",
        "wip_scrap_rate",
        "wip_defect_rate",
        "wip_aging_bucket",
        "wip_rework_rate",
        "wip_yield_summary",
    ]

    print(f"Inserted random dummy data for {total_days} date(s).")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  - {table}: {count} rows")


def main():
    from_date = parse_date(FROM_DATE)
    to_date = parse_date(TO_DATE)

    if from_date > to_date:
        raise ValueError("fromdate cannot be greater than todate.")

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        create_tables(cursor)

        if CLEAR_EXISTING:
            clear_existing_data(cursor)

        total_days = 0
        for record_day in daterange(from_date, to_date):
            insert_data_for_date(cursor, record_day)
            total_days += 1

        conn.commit()
        print_summary(cursor, total_days)
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
