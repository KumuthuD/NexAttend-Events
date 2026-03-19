"""
Database index creation for NexAttend Events.
Call create_indexes(db) once on startup after the DB connection is established.
"""
import logging


async def create_indexes(db) -> None:
    """Create all required MongoDB indexes for the application."""
    try:
        # ── form_fields ──────────────────────────────────────────────────────
        await db["form_fields"].create_index(
            [("event_id", 1), ("order", 1)],
            name="form_fields_event_order"
        )

        # ── registrations ────────────────────────────────────────────────────
        # Unique QR code identifier
        await db["registrations"].create_index(
            [("qr_code_id", 1)],
            unique=True,
            name="registrations_qr_code_id_unique"
        )
        # Prevent duplicate registration (same email per event)
        await db["registrations"].create_index(
            [("event_id", 1), ("email", 1)],
            unique=True,
            name="registrations_event_email_unique"
        )
        # Efficient query for checked-in status per event
        await db["registrations"].create_index(
            [("checked_in", 1), ("event_id", 1)],
            name="registrations_checked_in_event"
        )
        # General lookup by event
        await db["registrations"].create_index(
            [("event_id", 1)],
            name="registrations_event_id"
        )

        logging.info("Database indexes created successfully.")
    except Exception as e:
        logging.error(f"Error creating database indexes: {e}")
