import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
from mjml import mjml2html
from premailer import transform
import html2text
import resend
from app.core.config import settings
from app.core.security import create_unsubscribe_token
from app.core.logging import setup_logging

logger = setup_logging("email_sender")


class EmailSender:
    def __init__(self):
        self.template_dir = Path(__file__).parent.parent / 'email_templates'
        self.env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        self.text_converter = html2text.HTML2Text()
        self.text_converter.ignore_links = False
        self.text_converter.body_width = 0
        self.text_converter.ignore_images = True
        resend.api_key = settings.RESEND_API_KEY
        self.resend = resend

    def _generate_text_content(self, html_content: str, context: Dict[Any, Any]) -> str:
        """Converts HTML content to plain text with some formatting"""
        # Convert HTML to markdown-style text
        text_content = self.text_converter.handle(html_content)

        # Add footer
        text_content += f"""
        ---
        © {context['year']} TrackKeeper. All rights reserved.
        
        You're receiving this email because you're subscribed to notifications.
        To unsubscribe, visit: {context['unsubscribe_url']}
        """

        return text_content.strip()

    def _render_mjml(self, template_name: str, context: Dict[Any, Any]) -> tuple[str, str]:
        """Renders MJML template to HTML and creates a text version"""
        user_id = context.get('user_id')

        if user_id:
            unsubscribe_token = create_unsubscribe_token(user_id)
            unsubscribe_url = f"{settings.APP_URL}/unsubscribe/{user_id}/{unsubscribe_token}"
        else:
            unsubscribe_url = f"{settings.FRONTEND_URL}/settings/general"

        # Add common context variables
        context.update({
            'year': datetime.now().year,
            'logo_url': f"{settings.APP_URL}/logo.png",
            'unsubscribe_url': unsubscribe_url,
            'frontend_url': settings.FRONTEND_URL,
            # Ensure title is set
            'title': context.get('title', 'Email Notification'),
        })

        try:
            # Render MJML template
            template = self.env.get_template(f"{template_name}.mjml")
            mjml_content = template.render(**context)

            # Convert MJML to HTML
            html_output = mjml2html(mjml_content)

            # Inline CSS using premailer
            html_with_inlined_css = transform(html_output)

            # Generate text content
            text_content = self._generate_text_content(
                html_with_inlined_css, context)

        except Exception as e:
            logger.error(
                f"Error during MJML processing: {str(e)}", extra={"context": context})
            raise

        return html_with_inlined_css, text_content

    def send_email(
        self,
        template_name: str,
        to_email: str,
        subject: str,
        context: Dict[Any, Any],
        from_email: Optional[str] = None
    ):
        """Sends an email using the specified template"""
        html_content, text_content = self._render_mjml(template_name, context)

        try:
            self.resend.Emails.send({
                "from": f"{settings.PROJECT_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
                "to": to_email,
                "subject": subject,
                "html": html_content,
                "text": text_content,
                "reply_to": "support@trackkeeper.app",
                "headers": {
                    "List-Unsubscribe": f"<{context['unsubscribe_url']}>",
                    "Precedence": "bulk",
                }
            })
        except Exception as e:
            logger.error(
                f"Error sending email: {e}", extra={"context": context})
            raise

    def preview_email(self, template_name: str, context: Dict[Any, Any]) -> str:
        """Returns HTML preview of the email for development"""
        html_content, _ = self._render_mjml(template_name, context)
        return html_content
