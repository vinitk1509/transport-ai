package com.transportai.backend.service;

import com.transportai.backend.model.ReceiptData;
import com.transportai.backend.entity.ReceiptEntity;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelGeneratorService {

    private static final String MISSING = "MISSING";

    public ByteArrayInputStream generateExcel(ReceiptData receipt) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Receipt Data");

            // Define styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Create Header Row (Row 0)
            String[] headers = {
                    "Company Name", "Document No.", "Date", "Private Marka (P.M.)", "From", "To",
                    "Consignor Name", "Consignor GSTIN", "Consignee Name", "Consignee GSTIN",
                    "Items Description", "Total Quantity", "Total Weight",
                    "Base Freight", "Labour Charges", "Cartage", "Total Amount", "Payment Terms"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create Data Row (Row 1)
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue(text(receipt.companyName()));
            dataRow.createCell(1).setCellValue(text(receipt.documentNo()));
            dataRow.createCell(2).setCellValue(text(receipt.date()));
            dataRow.createCell(3).setCellValue(text(receipt.privateMarka()));
            dataRow.createCell(4).setCellValue(text(receipt.origin()));
            dataRow.createCell(5).setCellValue(text(receipt.destination()));
            
            dataRow.createCell(6).setCellValue(receipt.consignor() != null ? text(receipt.consignor().name()) : MISSING);
            dataRow.createCell(7).setCellValue(receipt.consignor() != null ? text(receipt.consignor().gstin()) : MISSING);
            dataRow.createCell(8).setCellValue(receipt.consignee() != null ? text(receipt.consignee().name()) : MISSING);
            dataRow.createCell(9).setCellValue(receipt.consignee() != null ? text(receipt.consignee().gstin()) : MISSING);

            // Process Items
            StringBuilder itemDesc = new StringBuilder();
            int totalQty = 0;
            double totalWeight = 0.0;
            if (receipt.items() != null) {
                for (ReceiptData.Item item : receipt.items()) {
                    if (item.description() != null && !item.description().isBlank()) {
                        if (itemDesc.length() > 0) itemDesc.append(", ");
                        itemDesc.append(item.description());
                    }
                    totalQty += item.quantity();
                    totalWeight += item.weight();
                }
            }
            dataRow.createCell(10).setCellValue(itemDesc.length() > 0 ? itemDesc.toString() : MISSING);
            dataRow.createCell(11).setCellValue(totalQty);
            dataRow.createCell(12).setCellValue(totalWeight);

            // Process Freight
            if (receipt.freight() != null) {
                dataRow.createCell(13).setCellValue(receipt.freight().baseFreight());
                dataRow.createCell(14).setCellValue(receipt.freight().labourCharges());
                dataRow.createCell(15).setCellValue(receipt.freight().cartage());
                dataRow.createCell(16).setCellValue(receipt.freight().totalAmount());
                dataRow.createCell(17).setCellValue(text(receipt.freight().paymentTerms()));
            } else {
                for (int i = 13; i <= 16; i++) {
                    dataRow.createCell(i).setCellValue(-1);
                }
                dataRow.createCell(17).setCellValue(MISSING);
            }

            // Set fixed column widths (autoSizeColumn not supported by SXSSFWorkbook)
            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, 5000);
            }

            workbook.write(out);
            workbook.dispose(); // Clean up temp files
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    public ByteArrayInputStream generateConsolidatedExcel(List<ReceiptEntity> receipts) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("All Bilties");
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            CellStyle highlightStyle = workbook.createCellStyle();
            highlightStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
            highlightStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font highlightFont = workbook.createFont();
            highlightFont.setBold(true);
            highlightStyle.setFont(highlightFont);

            String[] headers = {
                    "GR/LR No.", "Bilty Date", "Truck No.", "Uploaded At", "Processed At",
                    "Consignor", "Consignee", "From", "To", "Packages", "Material",
                    "Charges", "Private Marka (P.M.)", "Original File"
            };

            int rowIndex = 0;
            
            // Group by Transport Name (companyName from extracted JSON)
            java.util.Map<String, List<ReceiptEntity>> grouped = new java.util.HashMap<>();
            for (ReceiptEntity r : receipts) {
                String transportName = getTransportName(r);
                grouped.computeIfAbsent(transportName, k -> new java.util.ArrayList<>()).add(r);
            }
            // Date will be extracted dynamically per group
            
            for (java.util.Map.Entry<String, List<ReceiptEntity>> entry : grouped.entrySet()) {
                String transportName = entry.getKey();
                List<ReceiptEntity> groupReceipts = entry.getValue();
                String truckNumber = groupReceipts.get(0).getTruckNumber();
                if (truckNumber == null || truckNumber.isBlank()) {
                    truckNumber = "_______________";
                }
                
                // Highlighted Group Row
                Row groupRow = sheet.createRow(rowIndex++);
                Cell c0 = groupRow.createCell(0);
                c0.setCellValue("Vehicle No: " + truckNumber);
                c0.setCellStyle(highlightStyle);
                
                Cell c1 = groupRow.createCell(1);
                c1.setCellValue("Transport Name: " + transportName);
                c1.setCellStyle(highlightStyle);
                
                String headerDate = groupReceipts.get(0).getUploadedAt() != null 
                        ? groupReceipts.get(0).getUploadedAt().toLocalDate().toString() 
                        : java.time.LocalDate.now().toString();
                
                Cell c2 = groupRow.createCell(2);
                c2.setCellValue("Batch Date: " + headerDate);
                c2.setCellStyle(highlightStyle);
                
                // Header Row
                Row headerRow = sheet.createRow(rowIndex++);
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                
                // Data Rows
                for (ReceiptEntity receipt : groupReceipts) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(text(receipt.getGrNumber()));
                    row.createCell(1).setCellValue(text(receipt.getBiltyDate()));
                    row.createCell(2).setCellValue(text(receipt.getTruckNumber()));
                    row.createCell(3).setCellValue(receipt.getUploadedAt() != null ? receipt.getUploadedAt().toString() : MISSING);
                    row.createCell(4).setCellValue(receipt.getProcessedAt() != null ? receipt.getProcessedAt().toString() : MISSING);
                    row.createCell(5).setCellValue(text(receipt.getConsignor()));
                    row.createCell(6).setCellValue(text(receipt.getConsignee()));
                    row.createCell(7).setCellValue(text(receipt.getSource()));
                    row.createCell(8).setCellValue(text(receipt.getDestination()));
                    row.createCell(9).setCellValue(receipt.getPackages());
                    row.createCell(10).setCellValue(text(receipt.getMaterial()));
                    row.createCell(11).setCellValue(receipt.getCharges() != 0 ? receipt.getCharges() : receipt.getAmount());
                    row.createCell(12).setCellValue(text(receipt.getPrivateMarka()));
                    row.createCell(13).setCellValue(text(receipt.getOriginalFilename()));
                }
                
                // Empty row between groups
                rowIndex++;
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, 5000);
            }

            workbook.write(out);
            workbook.dispose(); // Clean up temp files
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate consolidated Excel file", e);
        }
    }
    
    private String getTransportName(ReceiptEntity receipt) {
        if (receipt.getExtractedJson() != null && !receipt.getExtractedJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(receipt.getExtractedJson());
                if (node.has("companyName") && !node.get("companyName").isNull()) {
                    String name = node.get("companyName").asText();
                    if (name != null && !name.isBlank()) return name;
                }
            } catch (Exception ignored) {}
        }
        return "UNKNOWN TRANSPORT";
    }

    private String text(String value) {
        return value == null || value.isBlank() ? MISSING : value;
    }
}
