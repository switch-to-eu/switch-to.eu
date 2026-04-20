# Lexical JSON Reference

Reference doc for skills that write richText fields. Not an invocable skill.

All richText fields in Payload require Lexical JSON format.

## Root structure

```json
{
  "root": {
    "type": "root", "direction": "ltr", "format": "", "indent": 0, "version": 1,
    "children": [ ...nodes... ]
  }
}
```

## Node types

**Paragraph:**
```json
{
  "type": "paragraph",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {
      "type": "text",
      "text": "Your paragraph text here.",
      "mode": "normal",
      "style": "",
      "detail": 0,
      "format": 0,
      "version": 1
    }
  ]
}
```

**Heading (h2):**
```json
{
  "type": "heading",
  "tag": "h2",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [
    {
      "type": "text",
      "text": "Section title",
      "mode": "normal",
      "style": "",
      "detail": 0,
      "format": 0,
      "version": 1
    }
  ]
}
```

## Text formatting

On text nodes, the `format` field controls styling:
- `0` — plain text
- `1` — **bold**
- `2` — *italic*
- `3` — ***bold italic***
