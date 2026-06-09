import pypdfium2 as pdfium

from io import BytesIO
from PIL import Image

from PyPDF2 import PdfReader
from easyocr import Reader


reader = Reader(["en"], gpu=False)


def pdf_to_images(pdf_path):

    pdf = pdfium.PdfDocument(pdf_path)

    renderer = pdf.render(
        pdfium.PdfBitmap.to_pil,
        page_indices=range(len(pdf)),
        scale=300 / 72,
    )

    images = []

    for image in renderer:

        buffer = BytesIO()

        image.save(
            buffer,
            format="JPEG",
            optimize=True
        )

        images.append(buffer.getvalue())

    return images


def extract_text_pypdf(pdf_path):

    pdf_reader = PdfReader(pdf_path)

    text = ""

    for page in pdf_reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


def extract_text_easyocr(pdf_path):
    print("PDF -> Images Started")

    images = pdf_to_images(pdf_path)
    print(f"Total Pages: {len(images)}")


    full_text = []

    for idx, image_bytes in enumerate(images):
        print(f"Processing Page {idx + 1}")

        image = Image.open(BytesIO(image_bytes))

        result = reader.readtext(image)
        print(f"Page {idx + 1} OCR Completed")

        page_text = "\n".join(
            item[1]
            for item in result
        )

        full_text.append(page_text)
    print("OCR Finished")

    return "\n".join(full_text)



