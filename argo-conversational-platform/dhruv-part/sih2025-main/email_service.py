import os
from typing import List, Optional, Tuple

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Personalization, From, To


class EmailConfigError(Exception):
    pass


def _get_sendgrid_client() -> SendGridAPIClient:
    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        raise EmailConfigError("Missing SENDGRID_API_KEY environment variable")
    return SendGridAPIClient(api_key)


def _get_sender() -> str:
    sender = os.getenv("SENDGRID_SENDER_EMAIL")
    if not sender:
        raise EmailConfigError("Missing SENDGRID_SENDER_EMAIL environment variable")
    return sender


def send_email(subject: str, content_text: str, recipients: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Send a plain-text email to one or more recipients via SendGrid.

    Returns (ok, error_message)
    """
    if not recipients:
        return False, "No recipients provided"

    try:
        client = _get_sendgrid_client()
        sender_email = _get_sender()

        message = Mail(from_email=From(sender_email), subject=subject)
        # Single personalization with multiple recipients keeps one API call
        personalization = Personalization()
        for r in recipients:
            if r and "@" in r:
                personalization.add_to(To(r.strip()))
        message.add_personalization(personalization)

        # Use plain text; you can extend with HTML if needed
        message.add_content("text/plain", content_text)

        response = client.send(message)
        ok = 200 <= int(getattr(response, "status_code", 0)) < 300
        if not ok:
            return False, f"SendGrid error: status={response.status_code} body={getattr(response, 'body', b'').decode(errors='ignore') if hasattr(response, 'body') else ''}"
        return True, None
    except Exception as exc:
        return False, str(exc)


def send_bulk_personalized(subject: str, body_template: str, recipients: List[str], placeholder: str = "{{email}}") -> Tuple[int, int, Optional[str]]:
    """
    Send personalized emails in bulk. Replaces placeholder with recipient email.

    Returns (num_success, num_failed, last_error)
    """
    success = 0
    failed = 0
    last_error: Optional[str] = None
    for r in recipients:
        body = body_template.replace(placeholder, r)
        ok, err = send_email(subject, body, [r])
        if ok:
            success += 1
        else:
            failed += 1
            last_error = err
    return success, failed, last_error


