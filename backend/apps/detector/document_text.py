import html
import io
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree


class DocumentTextExtractionError(ValueError):
    pass


SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".csv",
    ".docx",
    ".htm",
    ".html",
    ".json",
    ".latex",
    ".md",
    ".odp",
    ".ods",
    ".odt",
    ".pdf",
    ".pptx",
    ".rtf",
    ".tex",
    ".text",
    ".tsv",
    ".txt",
    ".xlsx",
    ".xml",
}

TEXT_EXTENSIONS = {
    ".csv",
    ".htm",
    ".html",
    ".json",
    ".latex",
    ".md",
    ".rtf",
    ".tex",
    ".text",
    ".tsv",
    ".txt",
    ".xml",
}


def extract_text_from_document(filename, content):
    extension = Path(filename or "").suffix.lower()
    if extension not in SUPPORTED_DOCUMENT_EXTENSIONS:
        raise DocumentTextExtractionError(
            "Unsupported file type. Upload PDF, DOCX, PPTX, XLSX, ODT, ODS, ODP, LaTeX, CSV, Markdown, HTML, or plain text."
        )

    if extension in TEXT_EXTENSIONS:
        return _clean_text(_extract_text_file(content, extension))
    if extension == ".pdf":
        return _clean_text(_extract_pdf(content))
    if extension == ".docx":
        return _clean_text(_extract_docx(content))
    if extension == ".pptx":
        return _clean_text(_extract_pptx(content))
    if extension == ".xlsx":
        return _clean_text(_extract_xlsx(content))
    if extension in {".odt", ".odp"}:
        return _clean_text(_extract_open_document_text(content))
    if extension == ".ods":
        return _clean_text(_extract_ods(content))

    raise DocumentTextExtractionError("This document type is not supported yet.")


def _decode_text(content):
    for encoding in ("utf-8-sig", "utf-16", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="ignore")


def _extract_text_file(content, extension):
    text = _decode_text(content)
    if extension in {".html", ".htm"}:
        text = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", text)
        text = re.sub(r"(?s)<[^>]+>", " ", text)
        return html.unescape(text)
    if extension == ".rtf":
        text = re.sub(r"\\'[0-9a-fA-F]{2}", " ", text)
        text = re.sub(r"\\[a-zA-Z]+\d* ?", " ", text)
        return re.sub(r"[{}]", " ", text)
    return text


def _read_zip_xml(content, names):
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            chunks = []
            for name in names:
                try:
                    chunks.append(archive.read(name))
                except KeyError:
                    continue
            return chunks
    except zipfile.BadZipFile as exc:
        raise DocumentTextExtractionError("The uploaded document could not be opened.") from exc


def _zip_names(content, predicate):
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            return sorted(name for name in archive.namelist() if predicate(name))
    except zipfile.BadZipFile as exc:
        raise DocumentTextExtractionError("The uploaded document could not be opened.") from exc


def _local_name(tag):
    return tag.rsplit("}", 1)[-1]


def _xml_text(xml_bytes, text_tags):
    try:
        root = ElementTree.fromstring(xml_bytes)
    except ElementTree.ParseError:
        return ""

    parts = []
    for element in root.iter():
        name = _local_name(element.tag)
        if name in text_tags and element.text:
            parts.append(element.text)
        elif name == "tab":
            parts.append("\t")
        elif name in {"br", "cr", "p"}:
            parts.append("\n")
    return " ".join(parts)


def _extract_docx(content):
    names = _zip_names(
        content,
        lambda name: name == "word/document.xml"
        or re.match(r"word/(header|footer)\d+\.xml$", name),
    )
    xml_chunks = _read_zip_xml(content, names)
    return "\n".join(_xml_text(chunk, {"t"}) for chunk in xml_chunks)


def _slide_sort_key(name):
    match = re.search(r"slide(\d+)\.xml$", name)
    return int(match.group(1)) if match else 0


def _extract_pptx(content):
    names = _zip_names(
        content,
        lambda name: re.match(r"ppt/slides/slide\d+\.xml$", name) is not None,
    )
    names = sorted(names, key=_slide_sort_key)
    xml_chunks = _read_zip_xml(content, names)
    slides = [_xml_text(chunk, {"t"}) for chunk in xml_chunks]
    return "\n\n".join(slide for slide in slides if slide.strip())


def _extract_shared_strings(archive):
    try:
        xml_bytes = archive.read("xl/sharedStrings.xml")
    except KeyError:
        return []

    try:
        root = ElementTree.fromstring(xml_bytes)
    except ElementTree.ParseError:
        return []

    values = []
    for item in root.iter():
        if _local_name(item.tag) != "si":
            continue
        values.append("".join(t.text or "" for t in item.iter() if _local_name(t.tag) == "t"))
    return values


def _extract_xlsx(content):
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            shared_strings = _extract_shared_strings(archive)
            sheet_names = sorted(
                name
                for name in archive.namelist()
                if re.match(r"xl/worksheets/sheet\d+\.xml$", name)
            )
            rows = []
            for sheet_name in sheet_names:
                rows.extend(_extract_xlsx_sheet(archive.read(sheet_name), shared_strings))
            return "\n".join(rows)
    except zipfile.BadZipFile as exc:
        raise DocumentTextExtractionError("The uploaded spreadsheet could not be opened.") from exc


def _extract_xlsx_sheet(xml_bytes, shared_strings):
    try:
        root = ElementTree.fromstring(xml_bytes)
    except ElementTree.ParseError:
        return []

    rows = []
    for row in root.iter():
        if _local_name(row.tag) != "row":
            continue
        cells = []
        for cell in row:
            if _local_name(cell.tag) != "c":
                continue
            value = ""
            cell_type = cell.attrib.get("t")
            if cell_type == "inlineStr":
                value = " ".join(
                    text_node.text or ""
                    for text_node in cell.iter()
                    if _local_name(text_node.tag) == "t"
                )
            else:
                value_node = next((child for child in cell if _local_name(child.tag) == "v"), None)
                value = value_node.text if value_node is not None and value_node.text else ""
                if cell_type == "s" and value.isdigit():
                    index = int(value)
                    value = shared_strings[index] if index < len(shared_strings) else ""
            if value:
                cells.append(value)
        if cells:
            rows.append("\t".join(cells))
    return rows


def _extract_open_document_text(content):
    xml_chunks = _read_zip_xml(content, ["content.xml"])
    return "\n".join(_xml_text(chunk, {"p", "span"}) for chunk in xml_chunks)


def _extract_ods(content):
    xml_chunks = _read_zip_xml(content, ["content.xml"])
    if not xml_chunks:
        return ""

    try:
        root = ElementTree.fromstring(xml_chunks[0])
    except ElementTree.ParseError:
        return ""

    rows = []
    for row in root.iter():
        if _local_name(row.tag) != "table-row":
            continue
        cells = []
        for cell in row:
            if _local_name(cell.tag) != "table-cell":
                continue
            cell_text = " ".join(
                node.text or ""
                for node in cell.iter()
                if _local_name(node.tag) in {"p", "span"}
            )
            if cell_text:
                cells.append(cell_text)
        if cells:
            rows.append("\t".join(cells))
    return "\n".join(rows)


def _extract_pdf(content):
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise DocumentTextExtractionError(
            "PDF text extraction is not available. Install backend requirements and try again."
        ) from exc

    try:
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        raise DocumentTextExtractionError("The uploaded PDF could not be read.") from exc

    if not _looks_readable(text):
        raise DocumentTextExtractionError(
            "No readable text was found in this PDF. It may be scanned, image-only, encrypted, or use text encoding that cannot be extracted."
        )
    return text


def _looks_readable(text):
    sample = re.sub(r"\s+", " ", text or "").strip()
    if len(sample) < 20:
        return False

    printable_count = sum(1 for char in sample if char.isprintable())
    if printable_count / len(sample) < 0.95:
        return False

    tokens = re.findall(r"\S+", sample)
    if not tokens:
        return False

    word_like = sum(1 for token in tokens if re.search(r"[A-Za-z]{2,}", token))
    symbol_heavy = sum(1 for token in tokens if len(re.sub(r"[A-Za-z0-9.,;:!?%()'\-/]", "", token)) > 1)
    return word_like / len(tokens) >= 0.45 and symbol_heavy / len(tokens) <= 0.2


def _clean_text(text):
    text = text or ""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    return text.strip()
