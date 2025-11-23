import qrcode
import qrcode.image.svg
from io import BytesIO
import base64

class QRCodeGenerator:
    """
    Generates QR codes for Digital Passports.
    """
    
    @staticmethod
    def generate_png_base64(data: str) -> str:
        """Generates a PNG QR code and returns it as a base64 string."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    @staticmethod
    def generate_svg(data: str) -> str:
        """Generates an SVG QR code and returns it as a string."""
        factory = qrcode.image.svg.SvgImage
        img = qrcode.make(data, image_factory=factory)
        
        buffered = BytesIO()
        img.save(buffered)
        return buffered.getvalue().decode("utf-8")

    @staticmethod
    def create_verification_url(passport_id: str, token: str, base_url: str = "https://mediguard.io/verify") -> str:
        """Creates the verification URL encoded in the QR code."""
        return f"{base_url}?passport_id={passport_id}&token={token}"
