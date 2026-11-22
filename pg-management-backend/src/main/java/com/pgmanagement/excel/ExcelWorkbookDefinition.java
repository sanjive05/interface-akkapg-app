package com.pgmanagement.excel;

import java.util.List;

public record ExcelWorkbookDefinition(
        String fileName,
        String sheetName,
        List<String> headers,
        String idHeader
) {
}
