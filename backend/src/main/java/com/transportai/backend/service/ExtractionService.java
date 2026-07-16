package com.transportai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.transportai.backend.model.ReceiptData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

@Service
public class ExtractionService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public CompletableFuture<ReceiptData> extractDataFromImage(File imageFile) {
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("Gemini API key is not configured.");
            }
            // 1. Read file and encode to Base64
            byte[] fileContent = Files.readAllBytes(imageFile.toPath());
            String base64Image = Base64.getEncoder().encodeToString(fileContent);
            String contentType = Files.probeContentType(imageFile.toPath());
            if (contentType == null || contentType.isBlank()) {
                contentType = "image/jpeg";
            }

            // 2. Build the JSON payload for Gemini
            String prompt = "You are a highly accurate Indian Logistics data extraction AI. First decide whether this image is a transport bilty / lorry receipt / goods receipt / L.R. If it is not, return ONLY {\"isBilty\":false}. If it is a bilty, extract the details. Pay close attention to the specific labels in the image. Return a JSON object exactly matching this structure:\n" +
                    "{ \"isBilty\": true, \"companyName\": \"\", \"documentNo\": \"\", \"date\": \"YYYY-MM-DD\", \"privateMarka\": \"\", \"origin\": \"\", \"destination\": \"\", \"consignor\": { \"name\": \"\", \"gstin\": \"\" }, \"consignee\": { \"name\": \"\", \"gstin\": \"\" }, \"items\": [ { \"description\": \"\", \"quantity\": 0, \"weight\": 0.0 } ], \"freight\": { \"baseFreight\": 0.0, \"labourCharges\": 0.0, \"cartage\": 0.0, \"totalAmount\": 0.0, \"paymentTerms\": \"TO PAY/PAID/TBB\" } }\n" +
                    "CRITICAL EXTRACTION RULES:\n" +
                    "0. NON-BILTY REJECTION: If the image is a selfie, product photo, random document, invoice without bilty/L.R./G.R. transport fields, or any non-logistics image, return ONLY {\"isBilty\":false}.\n" +
                    "1. documentNo: Look explicitly for 'G.R. No.', 'L.R. No.', 'Receipt No.' or 'Bilty No.' (e.g. LDH0487050).\n" +
                    "2. consignee.name: Look strictly under or next to the label 'CONSIGNEE' or 'To'. Sometimes this is a numeric code (e.g. 9514).\n" +
                    "3. privateMarka: Look for 'P.M.', 'Marka', or standalone numeric/fractional codes written in margins (e.g. 9514/5).\n" +
                    "4. consignor.name: Look strictly under or next to 'CONSIGNOR' or 'From'.\n" +
                    "5. origin & destination: Look for 'FROM' and 'TO' locations (e.g., LUDHIANA, KOTKAPURA).\n" +
                    "6. ANTI-HALLUCINATION: If any text field is blurry or illegible, DO NOT guess. Set its value exactly to 'UNREADABLE'. If a text field is absent, set it exactly to 'MISSING'. If any numeric field is missing or illegible, set its value to -1.\n" +
                    "Return ONLY valid JSON. Do not include markdown code blocks like ```json.";

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", contentType);
            inlineData.put("data", base64Image);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inline_data", inlineData);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(textPart, imagePart));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(contentPart));

            String requestBody = objectMapper.writeValueAsString(payload);

            // 3. Make HTTP call
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Failed to call Gemini API: " + response.body());
            }

            // 4. Parse response
            JsonNode rootNode = objectMapper.readTree(response.body());
            String extractedJsonText = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // Clean up markdown just in case Gemini ignored the prompt
            extractedJsonText = extractedJsonText.replace("```json", "").replace("```", "").trim();

            // 5. Convert JSON to ReceiptData
            JsonNode extractedNode = objectMapper.readTree(extractedJsonText);
            if (extractedNode.has("isBilty") && !extractedNode.path("isBilty").asBoolean()) {
                throw new NonBiltyDocumentException("Uploaded image is not a bilty.");
            }
            if (extractedNode instanceof ObjectNode objectNode) {
                objectNode.remove("isBilty");
            }

            ReceiptData receiptData = objectMapper.treeToValue(extractedNode, ReceiptData.class);
            receiptData = withDefaults(receiptData);
            if (!looksLikeBilty(receiptData)) {
                throw new NonBiltyDocumentException("Uploaded image does not contain required bilty fields.");
            }
            return CompletableFuture.completedFuture(receiptData);

        } catch (NonBiltyDocumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error extracting data via Gemini API", e);
        }
    }

    private boolean looksLikeBilty(ReceiptData receipt) {
        boolean hasDocumentNumber = usefulText(receipt.documentNo());
        boolean hasRoute = usefulText(receipt.origin()) || usefulText(receipt.destination());
        boolean hasParty = receipt.consignor() != null && usefulText(receipt.consignor().name())
                || receipt.consignee() != null && usefulText(receipt.consignee().name());
        return hasDocumentNumber && (hasRoute || hasParty);
    }

    private boolean usefulText(String value) {
        return value != null
                && !value.isBlank()
                && !"MISSING".equalsIgnoreCase(value)
                && !"UNREADABLE".equalsIgnoreCase(value);
    }

    public static class NonBiltyDocumentException extends RuntimeException {
        public NonBiltyDocumentException(String message) {
            super(message);
        }
    }

    private ReceiptData withDefaults(ReceiptData receipt) {
        List<ReceiptData.Item> items = receipt.items();
        if (items == null || items.isEmpty()) {
            items = List.of(new ReceiptData.Item("MISSING", -1, -1));
        }
        return new ReceiptData(
                textOrMissing(receipt.companyName()),
                textOrMissing(receipt.documentNo()),
                textOrMissing(receipt.date()),
                textOrMissing(receipt.privateMarka()),
                textOrMissing(receipt.origin()),
                textOrMissing(receipt.destination()),
                partyOrMissing(receipt.consignor()),
                partyOrMissing(receipt.consignee()),
                items.stream()
                        .map(item -> new ReceiptData.Item(textOrMissing(item.description()), item.quantity(), item.weight()))
                        .toList(),
                freightOrMissing(receipt.freight()),
                textOrMissing(receipt.truckNumber())
        );
    }

    private String textOrMissing(String value) {
        return value == null || value.isBlank() ? "MISSING" : value;
    }

    private ReceiptData.Party partyOrMissing(ReceiptData.Party party) {
        if (party == null) {
            return new ReceiptData.Party("MISSING", "MISSING");
        }
        return new ReceiptData.Party(textOrMissing(party.name()), textOrMissing(party.gstin()));
    }

    private ReceiptData.FreightDetails freightOrMissing(ReceiptData.FreightDetails freight) {
        if (freight == null) {
            return new ReceiptData.FreightDetails(-1, -1, -1, -1, "MISSING");
        }
        return new ReceiptData.FreightDetails(
                freight.baseFreight(),
                freight.labourCharges(),
                freight.cartage(),
                freight.totalAmount(),
                textOrMissing(freight.paymentTerms())
        );
    }
}
