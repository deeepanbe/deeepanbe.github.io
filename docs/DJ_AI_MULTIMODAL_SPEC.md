# DJ AI Multimodal Contract

DJ AI should expose one orchestration interface over multiple media types.

## Inputs

- Text
- Images
- PDF/DOCX documents
- CSV/XLSX spreadsheets
- Screenshots and charts
- Audio/voice through an approved provider adapter

## Outputs

- Text answers
- Structured JSON
- Code
- SQL/DAX/Python
- Tables and charts
- Generated images through an image-generation adapter
- Documents/reports through approved artifact tools

## Rules

Every adapter must declare supported input/output types, size limits, cost characteristics, failure behavior, and privacy requirements. The orchestrator should select capabilities based on the task instead of pretending every model supports every modality.
