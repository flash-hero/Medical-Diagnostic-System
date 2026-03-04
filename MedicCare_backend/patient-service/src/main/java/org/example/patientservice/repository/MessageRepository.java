package org.example.patientservice.repository;

import org.example.patientservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get messages between two users ordered by time
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderUsername = :user1 AND m.receiverUsername = :user2) OR " +
           "(m.senderUsername = :user2 AND m.receiverUsername = :user1) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findConversation(@Param("user1") String user1, @Param("user2") String user2);

    // Get all distinct users the current user has conversations with
    @Query("SELECT DISTINCT CASE WHEN m.senderUsername = :username THEN m.receiverUsername ELSE m.senderUsername END " +
           "FROM Message m WHERE m.senderUsername = :username OR m.receiverUsername = :username")
    List<String> findConversationPartners(@Param("username") String username);

    // Get the last message between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderUsername = :user1 AND m.receiverUsername = :user2) OR " +
           "(m.senderUsername = :user2 AND m.receiverUsername = :user1) " +
           "ORDER BY m.sentAt DESC")
    List<Message> findLastMessages(@Param("user1") String user1, @Param("user2") String user2);

    // Count unread messages from a specific sender
    @Query("SELECT COUNT(m) FROM Message m WHERE m.senderUsername = :sender AND m.receiverUsername = :receiver AND m.isRead = false")
    Long countUnread(@Param("sender") String sender, @Param("receiver") String receiver);

    // Mark messages as read
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.senderUsername = :sender AND m.receiverUsername = :receiver AND m.isRead = false")
    void markAsRead(@Param("sender") String sender, @Param("receiver") String receiver);
}
