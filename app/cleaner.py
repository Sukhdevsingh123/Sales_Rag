import re
from collections import Counter

HEADER_FOOTER_PATTERNS = [
    r"NetApp Datasheet\s+\d+",
    r"DATASHEET",
]


def remove_repeated_lines(
    pages
):

    counter = Counter()

    normalized_pages = []

    for page in pages:

        page_lines = []

        for line in page.splitlines():

            cleaned = (
                line.strip()
                .lower()
            )

            if cleaned:

                counter[
                    cleaned
                ] += 1

            page_lines.append(
                (
                    line,
                    cleaned
                )
            )

        normalized_pages.append(
            page_lines
        )

    threshold = max(
        2,
        int(
            len(pages) * 0.7
        )
    )

    repeated = {

        line

        for line, count
        in counter.items()

        if count >= threshold
    }

    cleaned_pages = []

    for page in normalized_pages:

        lines = []

        for original, cleaned in page:

            if cleaned not in repeated:

                lines.append(
                    original
                )

        cleaned_pages.append(
            "\n".join(lines)
        )

    return cleaned_pages


def clean_text(text):

    if not text:
        return ""

    # remove header/footer patterns
    for pattern in HEADER_FOOTER_PATTERNS:
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE
        )

    # remove standalone page numbers
    text = re.sub(
        r"^\d+\s+",
        "",
        text,
        flags=re.MULTILINE
    )

    # remove excessive spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    replacements = {
        "‟": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "\xa0": " "
    }

    for old, new in replacements.items():
        text = text.replace(
            old,
            new
        )

    return text.strip()