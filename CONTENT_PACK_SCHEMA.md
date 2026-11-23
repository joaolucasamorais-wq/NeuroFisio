# NeuroFisio — contrato preliminar de pacotes (Fase 1)

O importador da Fase 1 recebe **um arquivo JSON de índice**, limitado a 1,5 MB. Não aceita ainda um ZIP, imagens ou sinais EDF/EDF+ diretamente. A arquitetura foi preparada para a futura evolução do contrato.

```json
{
  "schemaVersion": "neurofisio-content-v1",
  "packageId": "eeg-atlas-lote-01",
  "title": "Atlas EEG — Lote 01",
  "createdAt": "2026-11-23T00:00:00.000Z",
  "modality": "eeg",
  "examples": [
    {
      "id": "registro-001",
      "title": "Título do exemplo (somente após produção real do conteúdo)",
      "module": "eeg",
      "origin": "unreviewed",
      "description": "Síntese do objetivo didático",
      "assetPath": "signals/registro-001.edf",
      "license": "Licença verificável"
    }
  ],
  "cases": [
    {
      "id": "caso-001",
      "title": "Título do caso",
      "module": "eeg",
      "complexity": "advanced",
      "synopsis": "Resumo sem dados identificáveis"
    }
  ],
  "references": [],
  "provenance": "Origem e autorização de uso verificáveis"
}
```

Os campos `examples` e `cases` podem ser arrays vazios. `packageId` é estável, letras ASCII/dígitos/`_`/`-`. Uma nova importação com o mesmo ID substitui o índice anterior. Cada `id` deve ser único dentro do pacote. `origin`: `real_desidentified`, `synthetic_reviewed`, `didactic_illustration`, `unreviewed`. **O campo de proveniência é declaratório; não constitui verificação científica automática.**

Os arquivos de sinais e imagens citados em `assetPath` não são lidos na Fase 1. A biblioteca e o Atlas exibem metadados, não o conteúdo binário. Não inclua dados clínicos identificáveis. A fase Work deve manter referências, licenças, autorização e metadados técnicos separados antes de cada integração.

A estrutura de transferência prevista para a expansão é:

```
neurofisio-content-pack/
  manifest.json
  cases/
  signals/
  images/
  anatomy/
  annotations/
  references/
  sources.csv
  LICENSES.md
  DATA_PROVENANCE.md
  REVIEW.md
```
