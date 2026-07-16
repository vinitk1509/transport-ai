package com.transportai.backend.model;

import java.util.List;

public record ReceiptData(
    String companyName,
    String documentNo,
    String date,
    String privateMarka,
    String origin,
    String destination,
    Party consignor,
    Party consignee,
    List<Item> items,
    FreightDetails freight,
    String truckNumber
) {
    public record Party(String name, String gstin) {}
    public record Item(String description, int quantity, double weight) {}
    public record FreightDetails(
        double baseFreight,
        double labourCharges,
        double cartage,
        double totalAmount,
        String paymentTerms
    ) {}
}
