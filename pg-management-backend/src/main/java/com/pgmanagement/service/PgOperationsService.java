package com.pgmanagement.service;

import com.pgmanagement.excel.ExcelStorageService;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PgOperationsService {
    private final ExcelStorageService excel;
    public PgOperationsService(ExcelStorageService excel) { this.excel = excel; }
    public List<Map<String,String>> rooms() {
        // Read each workbook once. The previous implementation reopened tenants.xlsx
        // once per room, causing 15-25 full Excel parses for a single Rooms request.
        return rooms(excel.readAll("tenants.xlsx"));
    }
    private List<Map<String,String>> rooms(List<Map<String,String>> tenants) {
        Map<String,Long> occupiedByRoom = tenants.stream()
                .filter(t -> "ACTIVE".equals(t.get("status")))
                .filter(t -> t.get("roomId") != null && !t.get("roomId").isBlank())
                .collect(Collectors.groupingBy(t -> t.get("roomId"), Collectors.counting()));
        return excel.readAll("rooms.xlsx").stream().map(room -> withOccupancy(room, occupiedByRoom)).toList();
    }
    private Map<String,String> withOccupancy(Map<String,String> room) {
        return withOccupancy(room, excel.readAll("tenants.xlsx").stream()
                .filter(t -> "ACTIVE".equals(t.get("status")))
                .filter(t -> t.get("roomId") != null)
                .collect(Collectors.groupingBy(t -> t.get("roomId"), Collectors.counting())));
    }
    private Map<String,String> withOccupancy(Map<String,String> room, Map<String,Long> occupiedByRoom) {
        Map<String,String> result=new LinkedHashMap<>(room);
        long occupied=occupiedByRoom.getOrDefault(room.get("roomId"), 0L);
        int capacity=Integer.parseInt(room.getOrDefault("totalBeds", "0"));
        result.put("occupiedBeds",String.valueOf(occupied));
        result.put("availableBeds",String.valueOf(Math.max(0,capacity-occupied)));
        return result;
    }
    public synchronized Map<String,String> saveRoom(Map<String,String> payload,String id) {
        String number=required(payload,"roomNumber");
        String type=required(payload,"roomType").toUpperCase(Locale.ROOT);
        if(!Set.of("AC","NON_AC").contains(type)) throw new IllegalArgumentException("Room type must be AC or NON_AC");
        int beds=positiveInt(payload,"totalBeds");
        BigDecimal rent=nonNegative(payload,"monthlyRentPerPerson");
        if(excel.readAll("rooms.xlsx").stream().anyMatch(r->number.equalsIgnoreCase(r.get("roomNumber"))&&!Objects.equals(id,r.get("roomId")))) throw new IllegalArgumentException("Room number already exists");
        if(id!=null) {
            Map<String,String> existing=excel.findById("rooms.xlsx",id);
            if(existing==null) throw new NoSuchElementException("Room not found");
            long occupied=Long.parseLong(withOccupancy(existing).get("occupiedBeds"));
            if(beds<occupied) throw new IllegalArgumentException("Capacity cannot be less than current occupancy");
        }
        Map<String,String> row=new LinkedHashMap<>();
        row.put("roomId",id==null?"ROOM-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT):id);
        row.put("roomNumber",number);row.put("floor",payload.getOrDefault("floor",""));row.put("roomType",type);
        row.put("sharingType",String.valueOf(beds));row.put("totalBeds",String.valueOf(beds));
        row.put("monthlyRentPerPerson",rent.toPlainString());row.put("foodFacility",payload.getOrDefault("foodFacility","false"));
        row.put("status",payload.getOrDefault("status","AVAILABLE"));
        if(id==null) excel.append("rooms.xlsx",row);else excel.updateById("rooms.xlsx",id,row);
        return withOccupancy(row);
    }
    public synchronized void assertRoomCapacity(String roomId,String tenantId,String bedNumber) {
        if(roomId==null||roomId.isBlank()) return;
        Map<String,String> room=excel.findById("rooms.xlsx",roomId);
        if(room==null) throw new IllegalArgumentException("Choose an existing room ID");
        List<Map<String,String>> occupants=excel.readAll("tenants.xlsx").stream()
            .filter(t->"ACTIVE".equals(t.get("status")) && roomId.equals(t.get("roomId")) && !Objects.equals(tenantId,t.get("tenantId"))).toList();
        if(occupants.size()>=Integer.parseInt(room.get("totalBeds"))) throw new IllegalArgumentException("Room is already full");
        if(bedNumber!=null&&!bedNumber.isBlank()&&occupants.stream().anyMatch(t->bedNumber.equalsIgnoreCase(t.get("bedNumber")))) throw new IllegalArgumentException("Bed already occupied");
    }
    public List<Map<String,String>> electricityReadings(String month) {
        return excel.readAll("electricity_readings.xlsx").stream()
                .filter(r -> month == null || month.isBlank() || month.equals(r.get("billingMonth")))
                .sorted(Comparator.comparing(r -> r.getOrDefault("roomNumber", "")))
                .toList();
    }

    public synchronized Map<String,String> saveElectricityReading(Map<String,String> input, String id) {
        String roomId = required(input, "roomId");
        Map<String,String> room = excel.findById("rooms.xlsx", roomId);
        if (room == null) throw new IllegalArgumentException("Select a valid room");
        String month = required(input, "billingMonth");
        YearMonth ym = YearMonth.parse(month);
        BigDecimal previous = nonNegative(input, "previousReading");
        BigDecimal current = nonNegative(input, "currentReading");
        BigDecimal rate = nonNegative(input, "ratePerUnit");
        if (current.compareTo(previous) < 0) throw new IllegalArgumentException("Current meter reading cannot be lower than previous reading");
        BigDecimal units = current.subtract(previous);
        BigDecimal total = units.multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
        long members = excel.readAll("tenants.xlsx").stream().filter(t -> roomId.equals(t.get("roomId")))
                .filter(t -> activeDuring(t, ym)).count();
        if (members < 1) throw new IllegalArgumentException("No tenants are assigned to this room during the selected month");
        BigDecimal share = total.divide(BigDecimal.valueOf(members), 2, java.math.RoundingMode.HALF_UP);
        Map<String,String> existing = excel.readAll("electricity_readings.xlsx").stream()
                .filter(r -> roomId.equals(r.get("roomId")) && month.equals(r.get("billingMonth"))).findFirst().orElse(null);
        String readingId = id != null ? id : existing != null ? existing.get("readingId") : "EB-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase(Locale.ROOT);
        Map<String,String> row = new LinkedHashMap<>();
        row.put("readingId", readingId); row.put("roomId", roomId); row.put("roomNumber", room.get("roomNumber"));
        row.put("billingMonth", month); row.put("previousReading", previous.toPlainString());
        row.put("currentReading", current.toPlainString()); row.put("unitsUsed", units.toPlainString());
        row.put("ratePerUnit", rate.toPlainString()); row.put("totalCharge", total.toPlainString());
        row.put("memberCount", String.valueOf(members)); row.put("perTenantShare", share.toPlainString());
        row.put("recordedAt", LocalDate.now().toString());
        // Check existing bills before changing a reading so a reading correction cannot make a paid bill negative.
        List<Map<String,String>> affectedBills = excel.readAll("billing.xlsx").stream()
                .filter(b -> month.equals(b.get("billingMonth")))
                .filter(b -> excel.findById("tenants.xlsx", b.get("tenantId")) != null)
                .filter(b -> roomId.equals(excel.findById("tenants.xlsx", b.get("tenantId")).get("roomId"))).toList();
        for (Map<String,String> bill : affectedBills) {
            BigDecimal revisedTotal = money(bill.get("totalAmount")).subtract(money(bill.get("electricityCharges"))).add(share);
            BigDecimal alreadyPaid = money(billWithPayments(bill).get("amountPaid"));
            if (revisedTotal.compareTo(alreadyPaid) < 0) {
                throw new IllegalArgumentException("This reading correction would make a tenant bill lower than payments already received. Reconcile the payment first.");
            }
        }
        if (id != null || existing != null) excel.updateById("electricity_readings.xlsx", readingId, row);
        else excel.append("electricity_readings.xlsx", row);
        for (Map<String,String> bill : affectedBills) {
            BigDecimal revisedTotal = money(bill.get("totalAmount")).subtract(money(bill.get("electricityCharges"))).add(share);
            BigDecimal paid = money(billWithPayments(bill).get("amountPaid"));
            Map<String,String> changes = new LinkedHashMap<>();
            changes.put("electricityCharges", share.toPlainString());
            changes.put("electricityUnits", units.toPlainString());
            changes.put("electricityRate", rate.toPlainString());
            changes.put("electricityRoomTotal", total.toPlainString());
            changes.put("totalAmount", revisedTotal.toPlainString());
            changes.put("amountPaid", paid.toPlainString());
            changes.put("remainingBalance", revisedTotal.subtract(paid).toPlainString());
            changes.put("paymentStatus", revisedTotal.compareTo(paid)==0 ? "PAID" : paid.signum()>0 ? "PARTIAL" : "PENDING");
            excel.updateById("billing.xlsx", bill.get("billId"), changes);
        }
        return row;
    }

    private boolean activeDuring(Map<String,String> tenant, YearMonth month) {
        try {
            LocalDate joined = LocalDate.parse(tenant.get("joiningDate"));
            String vacated = tenant.get("vacatingDate");
            return !joined.isAfter(month.atEndOfMonth()) && (vacated == null || vacated.isBlank() || !LocalDate.parse(vacated).isBefore(month.atDay(1)));
        } catch (Exception ignored) { return false; }
    }

    private BigDecimal electricityShare(String roomId, String month) {
        if (roomId == null || roomId.isBlank()) return BigDecimal.ZERO;
        return excel.readAll("electricity_readings.xlsx").stream()
                .filter(r -> roomId.equals(r.get("roomId")) && month.equals(r.get("billingMonth")))
                .findFirst().map(r -> money(r.get("perTenantShare"))).orElse(BigDecimal.ZERO);
    }

    private String electricityUnits(String roomId, String month) { return electricityField(roomId, month, "unitsUsed"); }
    private String electricityRate(String roomId, String month) { return electricityField(roomId, month, "ratePerUnit"); }
    private String electricityRoomTotal(String roomId, String month) { return electricityField(roomId, month, "totalCharge"); }
    private String electricityField(String roomId, String month, String field) {
        return excel.readAll("electricity_readings.xlsx").stream().filter(r -> Objects.equals(roomId, r.get("roomId")) && month.equals(r.get("billingMonth")))
                .findFirst().map(r -> r.getOrDefault(field, "0")).orElse("0");
    }

    public synchronized List<Map<String,String>> bills(String month) {
        return bills(month, excel.readAll("payments.xlsx"));
    }
    private List<Map<String,String>> bills(String month, List<Map<String,String>> payments) {
        Map<String,BigDecimal> paidByBill = payments.stream().collect(Collectors.groupingBy(
                p -> p.getOrDefault("billId", ""),
                Collectors.reducing(BigDecimal.ZERO, p -> money(p.get("amount")), BigDecimal::add)));
        return excel.readAll("billing.xlsx").stream()
                .filter(b -> month==null || month.isBlank() || month.equals(b.get("billingMonth")))
                .map(b -> billWithPayments(b, paidByBill.getOrDefault(b.get("billId"), BigDecimal.ZERO)))
                .toList();
    }
    private Map<String,String> billWithPayments(Map<String,String> bill) {
        BigDecimal paid = excel.readAll("payments.xlsx").stream()
                .filter(p -> bill.get("billId").equals(p.get("billId")))
                .map(p -> money(p.get("amount"))).reduce(BigDecimal.ZERO, BigDecimal::add);
        return billWithPayments(bill, paid);
    }
    private Map<String,String> billWithPayments(Map<String,String> bill, BigDecimal paid) {
        Map<String,String> result=new LinkedHashMap<>(bill);
        BigDecimal due=money(bill.get("totalAmount")).subtract(paid);
        result.put("amountPaid",paid.toPlainString());result.put("remainingBalance",due.max(BigDecimal.ZERO).toPlainString());
        result.put("paymentStatus",due.signum()<=0?"PAID":paid.signum()>0?"PARTIAL":"PENDING");
        return result;
    }
    public synchronized List<Map<String,String>> generateBills(String month) {
        YearMonth ym=YearMonth.parse(month);
        for(Map<String,String> tenant:excel.readAll("tenants.xlsx")) {
            LocalDate joined=LocalDate.parse(tenant.get("joiningDate"));
            String vacated=tenant.get("vacatingDate");
            if(joined.isAfter(ym.atEndOfMonth()) || (vacated!=null&&!vacated.isBlank()&&LocalDate.parse(vacated).isBefore(ym.atDay(1)))) continue;
            String tid=tenant.get("tenantId");
            if(excel.readAll("billing.xlsx").stream().anyMatch(b->tid.equals(b.get("tenantId"))&&month.equals(b.get("billingMonth")))) continue;
            BigDecimal prior=outstandingBefore(tid,ym);
            BigDecimal rent=money(tenant.get("monthlyRent"));
            BigDecimal food="true".equalsIgnoreCase(tenant.getOrDefault("foodIncluded", "false"))
                    ? money(tenant.getOrDefault("monthlyFoodAmount", "0")) : BigDecimal.ZERO;
            BigDecimal eb=electricityShare(tenant.get("roomId"), month);
            Map<String,String> bill=new LinkedHashMap<>();
            bill.put("billId","BILL-"+UUID.randomUUID().toString().substring(0,12).toUpperCase(Locale.ROOT));
            bill.put("tenantId",tid);bill.put("tenantName",tenant.get("fullName"));bill.put("roomNumber",tenant.getOrDefault("roomId",""));
            bill.put("billingMonth",month);bill.put("monthlyRent",rent.toPlainString());bill.put("electricityCharges",eb.toPlainString());
            bill.put("foodCharges",food.toPlainString());bill.put("previousBalance",prior.toPlainString());
            bill.put("electricityUnits", electricityUnits(tenant.get("roomId"), month));
            bill.put("electricityRate", electricityRate(tenant.get("roomId"), month));
            bill.put("electricityRoomTotal", electricityRoomTotal(tenant.get("roomId"), month));
            bill.put("otherCharges","0");bill.put("discount","0");
            BigDecimal total=rent.add(food).add(eb).add(prior);
            bill.put("totalAmount",total.toPlainString());bill.put("amountPaid","0");bill.put("remainingBalance",total.toPlainString());
            bill.put("paymentStatus","PENDING");bill.put("createdAt",LocalDate.now().toString());
            excel.append("billing.xlsx",bill);
        }
        return bills(month);
    }
    private BigDecimal outstandingBefore(String tenantId,YearMonth month) {
        // Carry forward only the latest earlier bill's unpaid balance; prevents repeatedly counting old arrears.
        return excel.readAll("billing.xlsx").stream().filter(b->tenantId.equals(b.get("tenantId")) && YearMonth.parse(b.get("billingMonth")).isBefore(month))
          .max(Comparator.comparing(b->b.get("billingMonth"))).map(this::billWithPayments)
          .map(b->money(b.get("remainingBalance"))).orElse(BigDecimal.ZERO);
    }
    public synchronized Map<String,String> updateBill(String id,Map<String,String> changes) {
        Map<String,String> current=excel.findById("billing.xlsx",id);
        if(current==null) throw new NoSuchElementException("Bill not found");
        Map<String,String> update=new LinkedHashMap<>();
        for(String key:List.of("electricityCharges","foodCharges","otherCharges","discount")) {
            update.put(key,changes.containsKey(key)?nonNegative(changes,key).toPlainString():current.get(key));
        }
        BigDecimal total=money(current.get("monthlyRent")).add(money(current.get("previousBalance")))
            .add(money(update.get("electricityCharges"))).add(money(update.get("foodCharges")))
            .add(money(update.get("otherCharges"))).subtract(money(update.get("discount")));
        if(total.signum()<0) throw new IllegalArgumentException("Discount cannot exceed charges");
        BigDecimal paid=money(billWithPayments(current).get("amountPaid"));
        if(total.compareTo(paid)<0) throw new IllegalArgumentException("Bill total cannot be less than already received payments");
        update.put("totalAmount",total.toPlainString());update.put("amountPaid",paid.toPlainString());
        update.put("remainingBalance",total.subtract(paid).toPlainString());update.put("paymentStatus",total.compareTo(paid)==0?"PAID":paid.signum()>0?"PARTIAL":"PENDING");
        excel.updateById("billing.xlsx",id,update);
        return billWithPayments(excel.findById("billing.xlsx",id));
    }
    public List<Map<String,String>> payments(String month) {
        return excel.readAll("payments.xlsx").stream().filter(p->month==null||month.isBlank()||month.equals(p.get("billingMonth"))).toList();
    }
    public synchronized Map<String,String> addPayment(Map<String,String> input) {
        String billId=required(input,"billId");
        Map<String,String> bill=excel.findById("billing.xlsx",billId);
        if(bill==null) throw new NoSuchElementException("Bill not found");
        BigDecimal amount=nonNegative(input,"amount");
        if(amount.signum()==0) throw new IllegalArgumentException("Payment must be greater than zero");
        BigDecimal remaining=money(billWithPayments(bill).get("remainingBalance"));
        if(amount.compareTo(remaining)>0) throw new IllegalArgumentException("Payment exceeds bill outstanding amount");
        String mode=required(input,"paymentMode").toUpperCase(Locale.ROOT);
        if(!Set.of("CASH","UPI","BANK_TRANSFER","CARD").contains(mode)) throw new IllegalArgumentException("Invalid payment mode");
        String date=input.getOrDefault("paymentDate",LocalDate.now().toString());LocalDate.parse(date);
        String ref=input.getOrDefault("transactionReference","").trim();
        if(!ref.isBlank()&&excel.readAll("payments.xlsx").stream().anyMatch(p->ref.equalsIgnoreCase(p.get("transactionReference")))) throw new IllegalArgumentException("Transaction reference already used");
        Map<String,String> payment=new LinkedHashMap<>();
        payment.put("paymentId","PAY-"+UUID.randomUUID().toString().substring(0,12).toUpperCase(Locale.ROOT));
        payment.put("tenantId",bill.get("tenantId"));payment.put("tenantName",bill.get("tenantName"));payment.put("billId",billId);
        payment.put("paymentDate",date);payment.put("billingMonth",bill.get("billingMonth"));payment.put("amount",amount.toPlainString());
        payment.put("paymentMode",mode);payment.put("transactionReference",ref);payment.put("notes",input.getOrDefault("notes",""));
        excel.append("payments.xlsx",payment);
        // bill paid and balance are derived from immutable payment records on every read.
        return payment;
    }
    public Map<String,Object> dashboard(String month) {
        List<Map<String,String>> tenants=excel.readAll("tenants.xlsx");
        List<Map<String,String>> allRooms=rooms(tenants);
        List<Map<String,String>> monthPayments=payments(month);
        // Reuse the already-loaded monthly payments instead of reopening payments.xlsx
        // once for every bill displayed on the dashboard.
        List<Map<String,String>> monthBills=bills(month, monthPayments);
        BigDecimal expected=monthBills.stream().map(b->money(b.get("totalAmount"))).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal received=monthPayments.stream().map(p->money(p.get("amount"))).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal pending=monthBills.stream().map(b->money(b.get("remainingBalance"))).reduce(BigDecimal.ZERO,BigDecimal::add);
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("activeTenants",tenants.stream().filter(t->"ACTIVE".equals(t.get("status"))).count());
        result.put("totalRooms",allRooms.size());result.put("occupiedBeds",allRooms.stream().mapToInt(r->Integer.parseInt(r.get("occupiedBeds"))).sum());
        result.put("availableBeds",allRooms.stream().mapToInt(r->Integer.parseInt(r.get("availableBeds"))).sum());
        result.put("expected",expected);result.put("received",received);result.put("pending",pending);
        result.put("paidCount",monthBills.stream().filter(b->"PAID".equals(b.get("paymentStatus"))).count());
        result.put("pendingCount",monthBills.stream().filter(b->!"PAID".equals(b.get("paymentStatus"))).count());
        result.put("paymentsByMode",monthPayments.stream().collect(Collectors.groupingBy(p->p.get("paymentMode"),Collectors.reducing(BigDecimal.ZERO,p->money(p.get("amount")),BigDecimal::add))));
        result.put("recentPayments",monthPayments.stream().sorted(Comparator.comparing((Map<String,String> p)->p.get("paymentDate")).reversed()).limit(5).toList());

        Map<String,String> roomNumberById = allRooms.stream().collect(Collectors.toMap(
                r -> r.get("roomId"), r -> r.getOrDefault("roomNumber", "—"), (a,b) -> a));
        Map<String,Map<String,String>> tenantById = tenants.stream().collect(Collectors.toMap(
                t -> t.get("tenantId"), t -> t, (a,b) -> a));
        List<Map<String,String>> activeTenantDetails = tenants.stream()
                .filter(t -> "ACTIVE".equals(t.get("status")))
                .map(t -> { Map<String,String> row = new LinkedHashMap<>(t); row.put("roomNumber", roomNumberById.getOrDefault(t.get("roomId"), "—")); return row; })
                .sorted(Comparator.comparing(t -> t.getOrDefault("roomNumber", ""), String.CASE_INSENSITIVE_ORDER))
                .toList();
        List<Map<String,String>> availableRoomDetails = allRooms.stream()
                .filter(r -> Integer.parseInt(r.getOrDefault("availableBeds", "0")) > 0)
                .sorted(Comparator.comparing(r -> r.getOrDefault("roomNumber", ""), String.CASE_INSENSITIVE_ORDER)).toList();
        List<Map<String,String>> dueBillDetails = monthBills.stream().filter(b -> money(b.get("remainingBalance")).signum() > 0)
                .map(b -> { Map<String,String> row = new LinkedHashMap<>(b); Map<String,String> tenant = tenantById.get(b.get("tenantId"));
                    String roomId = tenant == null ? b.get("roomId") : tenant.get("roomId");
                    row.put("roomNumber", roomNumberById.getOrDefault(roomId, b.getOrDefault("roomNumber", "—"))); return row; })
                .sorted(Comparator.comparing((Map<String,String> b) -> money(b.get("remainingBalance"))).reversed()).toList();
        List<Map<String,String>> paidBillDetails = monthBills.stream().filter(b -> "PAID".equals(b.get("paymentStatus")))
                .map(b -> { Map<String,String> row = new LinkedHashMap<>(b); Map<String,String> tenant = tenantById.get(b.get("tenantId"));
                    String roomId = tenant == null ? b.get("roomId") : tenant.get("roomId");
                    row.put("roomNumber", roomNumberById.getOrDefault(roomId, b.getOrDefault("roomNumber", "—"))); return row; })
                .sorted(Comparator.comparing(b -> b.getOrDefault("tenantName", ""), String.CASE_INSENSITIVE_ORDER)).toList();
        List<Map<String,String>> paymentDetails = monthPayments.stream()
                .sorted(Comparator.comparing((Map<String,String> p) -> p.getOrDefault("paymentDate", "")).reversed())
                .map(p -> { Map<String,String> row = new LinkedHashMap<>(p); Map<String,String> tenant = tenantById.get(p.get("tenantId"));
                    String roomId = tenant == null ? p.get("roomId") : tenant.get("roomId");
                    row.put("roomNumber", roomNumberById.getOrDefault(roomId, "—")); return row; }).toList();
        result.put("activeTenantDetails", activeTenantDetails);
        result.put("availableRoomDetails", availableRoomDetails);
        result.put("dueBillDetails", dueBillDetails);
        result.put("paidBillDetails", paidBillDetails);
        result.put("paymentDetails", paymentDetails);
        List<Map<String,String>> expectedBillDetails = monthBills.stream().map(b -> {
            Map<String,String> row = new LinkedHashMap<>(b);
            Map<String,String> tenant = tenantById.get(b.get("tenantId"));
            String roomId = tenant == null ? b.get("roomId") : tenant.get("roomId");
            row.put("roomNumber", roomNumberById.getOrDefault(roomId, b.getOrDefault("roomNumber", "—")));
            return row;
        }).toList();
        result.put("expectedBillDetails", expectedBillDetails);
        result.put("occupiedTenantDetails", activeTenantDetails);
        return result;
    }
    public List<Map<String,String>> settings() {return excel.readAll("settings.xlsx");}
    public synchronized void saveSettings(Map<String,String> settings) {
        for(var entry:settings.entrySet()) {
            if(!Set.of("pgName","address","phone","upiId").contains(entry.getKey())) throw new IllegalArgumentException("Unknown setting: "+entry.getKey());
            String key=entry.getKey();Map<String,String> existing=excel.findById("settings.xlsx",key);
            Map<String,String> row=Map.of("settingKey",key,"settingValue",entry.getValue(),"updatedAt",LocalDate.now().toString());
            if(existing==null) excel.append("settings.xlsx",row);else excel.updateById("settings.xlsx",key,row);
        }
    }
    private String required(Map<String,String> row,String key) {
        String value=row.get(key);if(value==null||value.isBlank()) throw new IllegalArgumentException(key+" is required");return value.trim();
    }
    private int positiveInt(Map<String,String> row,String key) {
        int n=Integer.parseInt(required(row,key));if(n<1||n>100) throw new IllegalArgumentException(key+" must be between 1 and 100");return n;
    }
    private BigDecimal nonNegative(Map<String,String> row,String key) {
        BigDecimal n=new BigDecimal(required(row,key));if(n.signum()<0||n.scale()>2) throw new IllegalArgumentException(key+" must be a non-negative amount with at most 2 decimals");return n;
    }
    private BigDecimal money(String value) {return new BigDecimal(value==null||value.isBlank()?"0":value);}
}
