import qrcode
import io
import base64


def generate_qr_code_id(event_id: str, registration_id: str) -> str:
    """Generate a unique QR code ID using first 6 hex chars of each ObjectId."""
    event_short = str(event_id)[:6]
    reg_short = str(registration_id)[:6]
    return f"EVT-{event_short}-REG-{reg_short}"


def generate_qr_image(qr_code_id: str) -> str:
    """Generate QR code image and return as base64 PNG string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_code_id)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64_string = base64.b64encode(buffer.read()).decode("utf-8")
    return f"data:image/png;base64,{b64_string}"
