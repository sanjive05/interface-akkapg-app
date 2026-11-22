package com.pgmanagement.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TenantRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotNull @Min(1) @Max(120) Integer age,
        @NotBlank @Size(max = 30) String gender,
        @NotBlank @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Enter a valid phone number") String phoneNumber,
        @Email @Size(max = 150) String email,
        @Size(max = 500) String address,
        @Size(max = 30) String emergencyContact,
        @NotNull LocalDate joiningDate,
        LocalDate vacatingDate,
        @Size(max = 40) String roomId,
        @Size(max = 20) String bedNumber,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2) BigDecimal monthlyRent,
        @NotNull Boolean foodIncluded,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2) BigDecimal monthlyFoodAmount,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2) BigDecimal advanceAmount,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 10, fraction = 2) BigDecimal advancePaid,
        @NotBlank String status,
        @Size(max = 1000) String notes
) {}
