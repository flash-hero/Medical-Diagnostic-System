package org.example.patientservice.controller;

import org.example.patientservice.entity.Message;
import org.example.patientservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    // Send a message
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, String> payload,
                                                @RequestHeader("loggedInUser") String senderUsername) {
        Message message = new Message();
        message.setSenderUsername(senderUsername);
        message.setReceiverUsername(payload.get("receiverUsername"));
        message.setContent(payload.get("content"));
        message.setIsRead(false);
        message.setSentAt(LocalDateTime.now());
        return ResponseEntity.ok(messageRepository.save(message));
    }

    // Get all conversations for the logged-in user
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @RequestHeader("loggedInUser") String username) {
        List<String> partners = messageRepository.findConversationPartners(username);
        List<Map<String, Object>> conversations = new ArrayList<>();

        for (String partner : partners) {
            List<Message> lastMsgs = messageRepository.findLastMessages(username, partner);
            Message lastMsg = lastMsgs.isEmpty() ? null : lastMsgs.get(0);
            Long unread = messageRepository.countUnread(partner, username);

            Map<String, Object> conv = new HashMap<>();
            conv.put("username", partner);
            conv.put("lastMessage", lastMsg != null ? lastMsg.getContent() : "");
            conv.put("lastMessageTime", lastMsg != null ? lastMsg.getSentAt() : null);
            conv.put("unreadCount", unread);
            conversations.add(conv);
        }

        // Sort by last message time descending
        conversations.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("lastMessageTime");
            LocalDateTime timeB = (LocalDateTime) b.get("lastMessageTime");
            if (timeA == null && timeB == null) return 0;
            if (timeA == null) return 1;
            if (timeB == null) return -1;
            return timeB.compareTo(timeA);
        });

        return ResponseEntity.ok(conversations);
    }

    // Get message history with a specific user
    @GetMapping("/history/{otherUsername}")
    public ResponseEntity<List<Message>> getMessageHistory(
            @PathVariable String otherUsername,
            @RequestHeader("loggedInUser") String username) {
        // Mark messages from the other user as read
        messageRepository.markAsRead(otherUsername, username);
        return ResponseEntity.ok(messageRepository.findConversation(username, otherUsername));
    }

    // Mark messages from a user as read
    @PutMapping("/read/{otherUsername}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String otherUsername,
            @RequestHeader("loggedInUser") String username) {
        messageRepository.markAsRead(otherUsername, username);
        return ResponseEntity.ok().build();
    }

    // Start a new conversation (send first message)
    @PostMapping("/start")
    public ResponseEntity<Message> startConversation(@RequestBody Map<String, String> payload,
                                                      @RequestHeader("loggedInUser") String senderUsername) {
        Message message = new Message();
        message.setSenderUsername(senderUsername);
        message.setReceiverUsername(payload.get("receiverUsername"));
        message.setContent(payload.get("content"));
        message.setIsRead(false);
        message.setSentAt(LocalDateTime.now());
        return ResponseEntity.ok(messageRepository.save(message));
    }
}
