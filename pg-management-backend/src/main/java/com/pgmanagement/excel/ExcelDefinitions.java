package com.pgmanagement.excel;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExcelDefinitions {
    private final List<ExcelWorkbookDefinition> definitions = List.of(
            new ExcelWorkbookDefinition("tenants.xlsx", "Tenants",
                    List.of("tenantId", "fullName", "age", "gender", "phoneNumber", "email",
                            "address", "emergencyContact", "joiningDate", "vacatingDate",
                            "roomId", "bedNumber", "monthlyRent", "foodIncluded", "monthlyFoodAmount", "advanceAmount", "advancePaid", "status", "notes"),
                    "tenantId"),
            new ExcelWorkbookDefinition("rooms.xlsx", "Rooms",
                    List.of("roomId", "roomNumber", "floor", "roomType", "sharingType",
                            "totalBeds", "monthlyRentPerPerson", "foodFacility", "status"),
                    "roomId"),
            new ExcelWorkbookDefinition("billing.xlsx", "MonthlyBills",
                    List.of("billId", "tenantId", "tenantName", "roomNumber", "billingMonth",
                            "monthlyRent", "electricityCharges", "foodCharges", "previousBalance", "electricityUnits", "electricityRate", "electricityRoomTotal",
                            "otherCharges", "discount", "totalAmount", "amountPaid",
                            "remainingBalance", "paymentStatus", "createdAt"),
                    "billId"),
            new ExcelWorkbookDefinition("electricity_readings.xlsx", "ElectricityReadings",
                    List.of("readingId", "roomId", "roomNumber", "billingMonth", "previousReading", "currentReading",
                            "unitsUsed", "ratePerUnit", "totalCharge", "memberCount", "perTenantShare", "recordedAt"),
                    "readingId"),
            new ExcelWorkbookDefinition("payments.xlsx", "Payments",
                    List.of("paymentId", "tenantId", "tenantName", "billId", "paymentDate",
                            "billingMonth", "amount", "paymentMode", "transactionReference", "notes"),
                    "paymentId"),
            new ExcelWorkbookDefinition("settings.xlsx", "PGSettings",
                    List.of("settingKey", "settingValue", "updatedAt"),
                    "settingKey"),
            new ExcelWorkbookDefinition("users.xlsx", "Users",
                    List.of("userId", "username", "passwordHash", "role", "enabled", "createdAt"),
                    "userId")
    );

    public List<ExcelWorkbookDefinition> all() {
        return definitions;
    }
}
