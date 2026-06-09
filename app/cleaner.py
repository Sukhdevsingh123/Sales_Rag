import re


def clean_text(text: str):

    if not text:
        return ""

    # remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # remove page numbers
    text = re.sub(
        r"Page\s+\d+",
        "",
        text,
        flags=re.IGNORECASE
    )

    # remove repeated headers/footers
    lines = text.split(" ")

    cleaned = []

    for line in lines:

        line = line.strip()

        if len(line) < 2:
            continue

        cleaned.append(line)

    text = " ".join(cleaned)

    return text.strip()