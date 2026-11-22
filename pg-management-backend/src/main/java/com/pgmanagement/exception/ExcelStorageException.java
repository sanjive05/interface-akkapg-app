package com.pgmanagement.exception;

public class ExcelStorageException extends RuntimeException {
    public ExcelStorageException(String message, Throwable cause) {
        super(message, cause);
    }

    public ExcelStorageException(String message) {
        super(message);
    }
}
