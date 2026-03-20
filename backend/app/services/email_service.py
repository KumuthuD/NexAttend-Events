import os
import base64
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition, ContentId
from app.core.config import settings

# Setup Jinja2 environment
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(
    loader=FileSystemLoader(template_dir),
    autoescape=select_autoescape(['html', 'xml'])
)

def send_registration_email(to_email, participant_name, event_title, event_date, qr_code_id, qr_code_base64):
    """
    Sends a registration confirmation email with an embedded QR code.
    """
    if not settings.SENDGRID_API_KEY:
        print("SENDGRID_API_KEY is not set. Skipping email.")
        return False

    try:
        # 1. Render HTML template
        template = env.get_template("registration_email.html")
        html_content = template.render(
            participant_name=participant_name,
            event_title=event_title,
            event_date=event_date,
            qr_code_id=qr_code_id
        )

        # 2. Prepare Email
        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=to_email,
            subject=f"Registration Confirmed: {event_title}",
            html_content=html_content
        )

        # 3. Handle QR Code Attachment (Embedded inline)
        # Strip the 'data:image/png;base64,' prefix if present
        if "," in qr_code_base64:
            encoded_content = qr_code_base64.split(",")[1]
        else:
            encoded_content = qr_code_base64

        attachment = Attachment(
            FileContent(encoded_content),
            FileName('qr_code.png'),
            FileType('image/png'),
            Disposition('inline'),
            ContentId('qrcode')
        )
        message.add_attachment(attachment)

        # 4. Send Email
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code >= 200 and response.status_code < 300:
            print(f"Email sent successfully to {to_email}")
            return True
        else:
            print(f"Failed to send email. Status Code: {response.status_code}")
            return False

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
